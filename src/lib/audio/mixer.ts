import { AudioEngine } from "./engine.ts";
import { clamp01, type Bus, type Cue, type CueOptions, type Scene } from "./mix.ts";

export const CROSSFADE_MS = 2500;

export type MixerContextState = AudioContextState | "none";

export interface MixerStatus {
  enabled: boolean;
  /** The real AudioContext.state, never inferred from what was requested. */
  contextState: MixerContextState;
  /** An audio asset failed to load; the synth keeps playing as the fallback source. */
  assetFailed: boolean;
  /** enable() was refused by the browser or Web Audio is missing. */
  blocked: boolean;
}

/** A sound source behind the mixer. The synth engine is the always-available one. */
export interface MixerSource {
  start(): Promise<void>;
  suspend(): Promise<void>;
  close(): Promise<void>;
  setBus(bus: Bus, level: number): void;
  setScene(scene: Scene, seconds: number): void;
  cue(cue: Cue, options?: CueOptions): void;
  readonly contextState: MixerContextState;
}

export class Mixer {
  private source: MixerSource | null = null;
  private enabled = false;
  private blocked = false;
  private assetFailed = false;
  private scene: Scene = "gate";
  private levels: Record<Bus, number> = { ambience: 0.5, cues: 0.75, music: 0.35 };

  private createSource: () => MixerSource;

  constructor(createSource: () => MixerSource) {
    this.createSource = createSource;
  }

  /** Silent until called; must come from a user gesture. Rejects when the browser will not run audio. */
  async enable(): Promise<void> {
    const source = (this.source ??= this.createSource());
    for (const bus of Object.keys(this.levels) as Bus[]) source.setBus(bus, this.levels[bus]);
    source.setScene(this.scene, 0.05);
    try {
      await source.start();
    } catch (err) {
      this.enabled = false;
      this.blocked = true;
      throw err;
    }
    this.blocked = false;
    this.enabled = true;
  }

  async disable(): Promise<void> {
    this.enabled = false;
    await this.source?.suspend();
  }

  setBus(bus: Bus, level: number): void {
    this.levels[bus] = clamp01(level);
    this.source?.setBus(bus, this.levels[bus]);
  }

  /** Crossfades the ambience to the place's mix over 2.5s. */
  setScene(placeId: Scene): void {
    this.scene = placeId;
    if (this.enabled) this.source?.setScene(placeId, CROSSFADE_MS / 1000);
  }

  cue(name: Cue, options?: CueOptions): void {
    if (!this.enabled || this.levels.cues <= 0) return;
    this.source?.cue(name, options);
  }

  reportAssetFailure(): void {
    this.assetFailed = true;
  }

  get status(): MixerStatus {
    return {
      enabled: this.enabled,
      contextState: this.source?.contextState ?? "none",
      assetFailed: this.assetFailed,
      blocked: this.blocked,
    };
  }

  /** Stops everything; a later enable() builds a fresh source. */
  async dispose(): Promise<void> {
    const source = this.source;
    this.source = null;
    this.enabled = false;
    await source?.close();
  }
}

/** Browser singleton; the synth engine is built lazily on the first enable(). */
export const mixer = new Mixer(() => new AudioEngine());
