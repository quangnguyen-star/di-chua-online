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
} from "./audio/mix.ts";

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
