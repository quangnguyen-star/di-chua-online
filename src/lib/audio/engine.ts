import {
  AMBIENCE_CEILING,
  CROSSFADE_SECONDS,
  CUE_PITCHES,
  MASTER_GAIN,
  MUSIC_CEILING,
  ambienceGain,
  cueBusGain,
  musicGain,
  nextNote,
  noteFrequency,
  sceneMixes,
  type Bus,
  type Cue,
  type Scene,
} from "./mix.ts";
import type { MixerSource } from "./mixer.ts";

const MUSIC_ROOT = 261.63;

function noiseBuffer(ctx: AudioContext): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** Synthesized soundscape. Browser only; every method is safe to call after close(). */
export class AudioEngine implements MixerSource {
  private ctx: AudioContext | null = null;
  private ambience!: GainNode;
  private music!: GainNode;
  private cues!: GainNode;
  private wind!: GainNode;
  private leaves!: GainNode;
  private windFilter!: BiquadFilterNode;
  private sceneMusic!: GainNode;
  private noise: AudioBuffer | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private degree = 2;
  private scene_: Scene = "gate";
  private levels: Record<Bus, number> = { ambience: 0.5, cues: 0.75, music: 0.35 };

  /** Creates and resumes the context; rejects if the browser will not actually run audio. */
  async start(): Promise<void> {
    const Ctor =
      typeof window === "undefined"
        ? undefined
        : window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) throw new Error("Web Audio is not available");
    if (!this.ctx) this.build(new Ctor());
    const ctx = this.ctx!;
    await ctx.resume();
    if (ctx.state !== "running") throw new Error("Audio playback was blocked");
    this.applyBuses();
    this.applyScene(this.scene_, 0.05);
    this.scheduleMusic();
  }

  private build(ctx: AudioContext): void {
    this.ctx = ctx;
    this.noise = noiseBuffer(ctx);
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -18;
    limiter.knee.value = 12;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.005;
    limiter.release.value = 0.25;
    const master = ctx.createGain();
    master.gain.value = MASTER_GAIN;
    master.connect(limiter).connect(ctx.destination);

    this.ambience = ctx.createGain();
    this.music = ctx.createGain();
    this.cues = ctx.createGain();
    this.ambience.connect(master);
    this.music.connect(master);
    this.cues.connect(master);
    this.cues.gain.value = 0;
    this.ambience.gain.value = 0;
    this.music.gain.value = 0;

    this.wind = ctx.createGain();
    this.wind.gain.value = 0;
    this.windFilter = ctx.createBiquadFilter();
    this.windFilter.type = "lowpass";
    this.windFilter.frequency.value = 500;
    this.bed().connect(this.windFilter).connect(this.wind).connect(this.ambience);

    this.leaves = ctx.createGain();
    this.leaves.gain.value = 0;
    const leafFilter = ctx.createBiquadFilter();
    leafFilter.type = "bandpass";
    leafFilter.frequency.value = 3200;
    leafFilter.Q.value = 0.6;
    const flutter = ctx.createGain();
    flutter.gain.value = 0.5;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.23;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.4;
    lfo.connect(lfoDepth).connect(flutter.gain);
    lfo.start();
    this.bed().connect(leafFilter).connect(flutter).connect(this.leaves).connect(this.ambience);

    this.sceneMusic = ctx.createGain();
    this.sceneMusic.gain.value = 0;
    this.sceneMusic.connect(this.music);
  }

  private bed(): AudioBufferSourceNode {
    const src = this.ctx!.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    src.start();
    return src;
  }

  setBus(bus: Bus, level: number): void {
    this.levels[bus] = level;
    this.applyBuses();
  }

  private applyBuses(): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.ambience.gain.setTargetAtTime(ambienceGain(this.levels.ambience) / AMBIENCE_CEILING, t, 0.2);
    this.music.gain.setTargetAtTime(musicGain(this.levels.music) / MUSIC_CEILING, t, 0.2);
    this.cues.gain.setTargetAtTime(cueBusGain(this.levels.cues), t, 0.05);
  }

  setScene(scene: Scene, seconds: number = CROSSFADE_SECONDS): void {
    this.scene_ = scene;
    if (this.ctx?.state === "running") this.applyScene(scene, seconds / 3);
  }

  private applyScene(scene: Scene, timeConstant: number): void {
    if (!this.ctx) return;
    const mix = sceneMixes[scene];
    const t = this.ctx.currentTime;
    this.wind.gain.setTargetAtTime(mix.wind, t, timeConstant);
    this.leaves.gain.setTargetAtTime(mix.leaves, t, timeConstant);
    this.windFilter.frequency.setTargetAtTime(mix.windCutoff, t, timeConstant);
    this.sceneMusic.gain.setTargetAtTime(mix.music, t, timeConstant);
  }

  cue(cue: Cue): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== "running" || this.levels.cues <= 0) return;
    const { freq, decay, noise } = CUE_PITCHES[cue];
    const t = ctx.currentTime;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(1, t + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    env.connect(this.cues);
    if (noise) {
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(freq, t);
      bp.frequency.exponentialRampToValueAtTime(freq * 3, t + decay * 0.8);
      src.connect(bp).connect(env);
      src.start(t);
      src.stop(t + decay);
      return;
    }
    const partials = cue === "water" ? [1] : [1, 2.01];
    for (const ratio of partials) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(cue === "water" ? freq * 1.5 : freq * ratio, t);
      if (cue === "water") osc.frequency.exponentialRampToValueAtTime(freq * 0.8, t + decay);
      const g = ctx.createGain();
      g.gain.value = ratio === 1 ? 1 : 0.25;
      osc.connect(g).connect(env);
      osc.start(t);
      osc.stop(t + decay);
    }
  }

  private scheduleMusic(): void {
    if (this.timer !== null || !this.ctx) return;
    const step = () => {
      this.timer = null;
      const ctx = this.ctx;
      if (!ctx || ctx.state !== "running") return;
      const note = nextNote(this.degree, Math.random);
      this.degree = note.degree;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = noteFrequency(MUSIC_ROOT, note.degree);
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(1, t + 0.8);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 4);
      osc.connect(env).connect(this.sceneMusic);
      osc.start(t);
      osc.stop(t + 4.1);
      this.timer = setTimeout(step, note.waitSeconds * 1000);
    };
    step();
  }

  /** Silences and suspends the context; resuming needs an explicit start(). */
  async suspend(): Promise<void> {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
    if (this.ctx && this.ctx.state === "running") await this.ctx.suspend();
  }

  async close(): Promise<void> {
    await this.suspend();
    const ctx = this.ctx;
    this.ctx = null;
    if (ctx && ctx.state !== "closed") await ctx.close();
  }

  get contextState(): AudioContextState | "none" {
    return this.ctx?.state ?? "none";
  }
}
