import assert from "node:assert/strict";
import { test } from "node:test";
import { INCENSE_SECONDS, burnProgress, formatRemaining, incensePhase } from "../src/app/places/hall/incense/incense.ts";

test("phase: unlit is ready regardless of timer state", () => {
  assert.equal(incensePhase(false, false, 180000), "ready");
  assert.equal(incensePhase(false, true, 180000), "ready");
});

test("phase: lit goes burning, paused, finished", () => {
  assert.equal(incensePhase(true, true, 100000), "burning");
  assert.equal(incensePhase(true, false, 100000), "paused");
  assert.equal(incensePhase(true, false, 0), "finished");
  assert.equal(incensePhase(true, true, 0), "finished");
});

test("duration is 180 seconds of active time", () => {
  assert.equal(INCENSE_SECONDS, 180);
});

test("burnProgress is clamped to 0..1", () => {
  assert.equal(burnProgress(180000), 0);
  assert.equal(burnProgress(90000), 0.5);
  assert.equal(burnProgress(0), 1);
  assert.equal(burnProgress(-5), 1);
  assert.equal(burnProgress(999999), 0);
});

test("formatRemaining rounds up to whole seconds", () => {
  assert.equal(formatRemaining(180000), "3:00");
  assert.equal(formatRemaining(59001), "1:00");
  assert.equal(formatRemaining(0), "0:00");
});
