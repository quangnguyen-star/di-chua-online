import assert from "node:assert/strict";
import test from "node:test";
import {
  audioReducer,
  initialAudioState,
  canPlay,
  clamp01,
  ambienceGain,
  musicGain,
  cueGain,
  noteFrequency,
  nextNote,
  sceneMixes,
  MASTER_GAIN,
  AMBIENCE_CEILING,
  MUSIC_CEILING,
  CUE_CEILING,
  cueBusGain,
  CROSSFADE_SECONDS,
} from "./audio/mix.ts";
import { Mixer, type MixerSource } from "./audio/mixer.ts";

test("fresh state is silent and not failed", () => {
  assert.equal(initialAudioState.soundOn, false);
  assert.equal(initialAudioState.failed, false);
  assert.equal(canPlay(initialAudioState), false);
});

test("enable turns sound on, fail turns it off and is never 'playing'", () => {
  const on = audioReducer(initialAudioState, { type: "enable" });
  assert.equal(canPlay(on), true);
  const failed = audioReducer(on, { type: "fail" });
  assert.equal(failed.failed, true);
  assert.equal(failed.soundOn, false);
  assert.equal(canPlay(failed), false);
  assert.equal(canPlay(audioReducer(failed, { type: "enable" })), true);
});

test("volumes clamp to 0..1", () => {
  assert.equal(clamp01(5), 1);
  assert.equal(clamp01(-1), 0);
  assert.equal(clamp01(Number.NaN), 0);
  assert.equal(audioReducer(initialAudioState, { type: "music", value: 9 }).music, 1);
});

test("summed channel ceilings stay under the master limit", () => {
  assert.ok(ambienceGain(1) <= AMBIENCE_CEILING);
  assert.ok(musicGain(1) <= MUSIC_CEILING);
  assert.ok(cueGain(1) <= CUE_CEILING);
  assert.ok((AMBIENCE_CEILING + MUSIC_CEILING + CUE_CEILING) * MASTER_GAIN < 0.5);
  assert.equal(ambienceGain(0), 0);
});

test("pentatonic notes: root, fifth-ish steps and octave wrap", () => {
  assert.equal(noteFrequency(220, 0), 220);
  assert.ok(Math.abs(noteFrequency(220, 5) - 440) < 1e-9);
  assert.ok(noteFrequency(220, -1) < 220);
});

test("melody stays in range with long rests", () => {
  let deg = 2;
  for (let i = 0; i < 100; i++) {
    const n = nextNote(deg, Math.random);
    assert.ok(n.degree >= -2 && n.degree <= 7);
    assert.ok(n.waitSeconds >= 5);
    deg = n.degree;
  }
});

test("every scene has bounded mix levels", () => {
  for (const mix of Object.values(sceneMixes)) {
    for (const v of [mix.wind, mix.leaves, mix.music]) assert.ok(v >= 0 && v <= 1);
  }
});

test("appearance changes only appearance", () => {
  const next = audioReducer(initialAudioState, { type: "appearance", value: "evening" });
  assert.equal(next.appearance, "evening");
  assert.equal(next.soundOn, initialAudioState.soundOn);
});

function fakeSource() {
  const log: string[] = [];
  const buses: Record<string, number> = {};
  const src: MixerSource & { state: AudioContextState | "none"; fail: boolean } = {
    state: "none",
    fail: false,
    get contextState() {
      return this.state;
    },
    async start() {
      if (this.fail) throw new Error("blocked");
      this.state = "running";
      log.push("start");
    },
    async suspend() {
      this.state = "suspended";
      log.push("suspend");
    },
    async close() {
      this.state = "closed";
      log.push("close");
    },
    setBus(bus, level) {
      buses[bus] = level;
    },
    setScene(scene, seconds) {
      log.push(`scene:${scene}:${seconds}`);
    },
    cue(cue) {
      log.push(`cue:${cue}`);
    },
  };
  return { src, log, buses };
}

test("mixer is silent on load and reports the real context state", async () => {
  const { src, log } = fakeSource();
  const mixer = new Mixer(() => src);
  assert.deepEqual(mixer.status, { enabled: false, contextState: "none", assetFailed: false, blocked: false });
  mixer.cue("bell");
  assert.deepEqual(log, []);
  await mixer.enable();
  assert.equal(mixer.status.enabled, true);
  assert.equal(mixer.status.contextState, "running");
  await mixer.disable();
  assert.equal(mixer.status.contextState, "suspended");
  mixer.reportAssetFailure();
  assert.equal(mixer.status.assetFailed, true);
});

test("a blocked enable is reported, not faked", async () => {
  const { src } = fakeSource();
  src.fail = true;
  const mixer = new Mixer(() => src);
  await assert.rejects(mixer.enable());
  assert.equal(mixer.status.enabled, false);
  assert.equal(mixer.status.blocked, true);
});

test("scene changes crossfade over 2.5s and bus levels clamp", async () => {
  const { src, log, buses } = fakeSource();
  const mixer = new Mixer(() => src);
  await mixer.enable();
  mixer.setScene("pond");
  assert.ok(log.includes("scene:pond:2.5"));
  assert.equal(CROSSFADE_SECONDS, 2.5);
  mixer.setBus("music", 4);
  assert.equal(buses.music, 1);
});

test("cues bus at 0 silences cues", async () => {
  const { src, log } = fakeSource();
  const mixer = new Mixer(() => src);
  await mixer.enable();
  mixer.cue("bell");
  mixer.setBus("cues", 0);
  mixer.cue("cup");
  assert.deepEqual(log.filter((l) => l.startsWith("cue:")), ["cue:bell"]);
  assert.equal(cueBusGain(0), 0);
});

test("dispose stops everything and later cues are inert", async () => {
  const { src, log } = fakeSource();
  const mixer = new Mixer(() => src);
  await mixer.enable();
  await mixer.dispose();
  mixer.cue("bell");
  assert.ok(log.includes("close"));
  assert.ok(!log.includes("cue:bell"));
  assert.deepEqual(mixer.status.enabled, false);
  assert.equal(mixer.status.contextState, "none");
});

test("cue variants are 3-5, bounded, and panning/intensity are clamped", async () => {
  const { CUE_VARIANTS, pickVariant, clampPan, panFromPercent, cueIntensity, sceneMixes: mixes } = await import("./audio/mix.ts");
  assert.ok(CUE_VARIANTS.length >= 3 && CUE_VARIANTS.length <= 5);
  for (const r of [0, 0.3, 0.99, 5, -1]) assert.ok(CUE_VARIANTS.includes(pickVariant(() => r)));
  assert.equal(clampPan(4), 1);
  assert.equal(clampPan(undefined), 0);
  assert.equal(panFromPercent(0), -1);
  assert.equal(panFromPercent(50), 0);
  assert.equal(cueIntensity(undefined), 1);
  assert.equal(cueIntensity(-2), 0);
  assert.equal(mixes.gate.reverb, 0);
  assert.equal(mixes.outside.reverb, 0);
  assert.ok(mixes.hall.reverb > mixes.pond.reverb);
});

test("mixer forwards cue options", async () => {
  const seen: unknown[] = [];
  const { src } = fakeSource();
  src.cue = (_c, o) => void seen.push(o);
  const m = new Mixer(() => src);
  await m.enable();
  m.cue("sweep", { pan: -0.5, intensity: 0.4 });
  assert.deepEqual(seen, [{ pan: -0.5, intensity: 0.4 }]);
});
