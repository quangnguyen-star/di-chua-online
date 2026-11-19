import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BREATHING_MS,
  breathElapsed,
  initialState,
  visitReducer,
  type VisitAction,
  type VisitState,
} from "./visitMachine.ts";

const run = (s: VisitState, ...actions: VisitAction[]) => actions.reduce(visitReducer, s);

const toBreathing = (now = 0) =>
  run(initialState, { type: "next", now }, { type: "next", now }, { type: "next", now });

test("walks arrive to close", () => {
  let s = toBreathing(0);
  assert.equal(s.step, "breathing");
  s = run(s, { type: "tick", now: BREATHING_MS });
  assert.equal(s.step, "reflection");
  s = run(s, { type: "next", now: BREATHING_MS });
  assert.equal(s.step, "close");
});

test("optional steps skip, reflection does not", () => {
  assert.equal(run(initialState, { type: "next", now: 0 }, { type: "skip", now: 0 }).step, "intention");
  const s = run(toBreathing(), { type: "skip", now: 5 });
  assert.equal(s.step, "reflection");
  assert.equal(visitReducer(s, { type: "skip", now: 5 }).step, "reflection");
});

test("timer counts only active time across pause and hidden", () => {
  let s = toBreathing(1000);
  s = run(s, { type: "pause", now: 31_000 });
  assert.equal(breathElapsed(s.breath, 500_000), 30_000);
  s = run(s, { type: "tick", now: 500_000 });
  assert.equal(s.step, "breathing");
  s = run(s, { type: "resume", now: 600_000 });
  s = run(s, { type: "hidden", now: 630_000 });
  assert.equal(breathElapsed(s.breath, 900_000), 60_000);
  s = run(s, { type: "resume", now: 1_000_000 }, { type: "tick", now: 1_059_999 });
  assert.equal(s.step, "breathing");
  s = run(s, { type: "tick", now: 1_060_000 });
  assert.equal(s.step, "reflection");
});

test("visibility return does not auto-resume", () => {
  const s = run(toBreathing(0), { type: "hidden", now: 10 }, { type: "tick", now: 10_000_000 });
  assert.equal(s.breath.paused, true);
  assert.equal(s.step, "breathing");
});

test("intention is capped, and cleared on completion", () => {
  let s = run(initialState, { type: "next", now: 0 }, { type: "next", now: 0 });
  s = run(s, { type: "setIntention", text: "x".repeat(600) });
  assert.equal(s.intention.length, 500);
  s = run(s, { type: "next", now: 0 }, { type: "tick", now: BREATHING_MS });
  assert.equal(s.step, "reflection");
  assert.equal(s.intention, "x".repeat(500));
  s = run(s, { type: "next", now: BREATHING_MS });
  assert.equal(s.intention, "");
});

test("end visit confirms only with intention text", () => {
  const blank = run(initialState, { type: "requestEnd" });
  assert.equal(blank.ended, true);

  let s = run(initialState, { type: "next", now: 0 }, { type: "next", now: 0 });
  s = run(s, { type: "setIntention", text: "peace" }, { type: "requestEnd" });
  assert.equal(s.confirmingEnd, true);
  assert.equal(s.ended, false);
  assert.equal(run(s, { type: "cancelEnd" }).intention, "peace");
  const done = run(s, { type: "confirmEnd" });
  assert.equal(done.ended, true);
  assert.equal(done.intention, "");
});

test("whitespace-only intention ends without confirm", () => {
  let s = run(initialState, { type: "next", now: 0 }, { type: "next", now: 0 });
  s = run(s, { type: "setIntention", text: "   " }, { type: "requestEnd" });
  assert.equal(s.ended, true);
});
