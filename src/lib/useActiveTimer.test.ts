import assert from "node:assert/strict";
import test from "node:test";
import { ActiveTimerCore } from "./activity/timerCore.ts";

function make(seconds: number) {
  let t = 0;
  let scheduled = 0;
  let cancelled = 0;
  const core = new ActiveTimerCore(seconds, {
    now: () => t,
    schedule: () => {
      scheduled++;
      return () => void cancelled++;
    },
  });
  return { core, advance: (ms: number) => void (t += ms), counts: () => ({ scheduled, cancelled }) };
}

test("counts down only while running", () => {
  const { core, advance } = make(10);
  advance(5000);
  core.tick();
  assert.equal(core.getSnapshot().remainingMs, 10_000);
  core.start();
  advance(3000);
  core.tick();
  assert.equal(core.getSnapshot().remainingMs, 7000);
});

test("pause freezes the countdown and resume is explicit", () => {
  const { core, advance } = make(10);
  core.start();
  advance(2000);
  core.pause();
  advance(60_000);
  core.tick();
  assert.deepEqual(core.getSnapshot(), { remainingMs: 8000, running: false });
  core.resume();
  advance(1000);
  core.tick();
  assert.equal(core.getSnapshot().remainingMs, 7000);
});

test("hidden tab freezes and visibility alone does not resume", () => {
  const { core, advance } = make(10);
  core.start();
  advance(1000);
  core.setHidden(true);
  advance(30_000);
  core.setHidden(false);
  core.tick();
  assert.deepEqual(core.getSnapshot(), { remainingMs: 9000, running: false });
  core.start();
  assert.equal(core.getSnapshot().running, true);
});

test("cannot start while hidden", () => {
  const { core } = make(10);
  core.setHidden(true);
  core.start();
  assert.equal(core.getSnapshot().running, false);
});

test("finishes at zero and stops its tick; config override resets the total", () => {
  const { core, advance, counts } = make(2);
  core.start();
  advance(5000);
  core.tick();
  assert.deepEqual(core.getSnapshot(), { remainingMs: 0, running: false });
  assert.equal(counts().cancelled, 1);
  core.reset(120);
  assert.equal(core.getSnapshot().remainingMs, 120_000);
});
