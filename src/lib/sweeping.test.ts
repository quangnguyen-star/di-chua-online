import assert from "node:assert/strict";
import test from "node:test";
import {
  LEAVES,
  LEAF_CAP,
  PILE_CAP,
  WIND_PAUSE_SECONDS,
  WIND_SET,
  blowWind,
  isWaiting,
  reduceSweep,
  strokeLane,
  stepBroom,
  sweepPath,
  tickSweep,
  CUE_INTERVAL_MS,
  freshState,
  isComplete,
  remaining,
  sweepAt,
  sweepAll,
  canCue,
} from "../app/places/courtyard/sweeping/logic.ts";

test("there are exactly eight leaves and none are cleared at the start", () => {
  assert.equal(LEAVES.length, 8);
  assert.equal(remaining(freshState), 8);
  assert.equal(isComplete(freshState), false);
});

test("sweeping near a leaf clears only that leaf", () => {
  const next = sweepAt(freshState, LEAVES[0].x, LEAVES[0].y);
  assert.deepEqual(next.cleared, [LEAVES[0].id]);
  assert.equal(remaining(next), 7);
});

test("sweeping empty ground returns the same state", () => {
  assert.equal(sweepAt(freshState, 0, 100), freshState);
});

test("sweeping a cleared leaf again changes nothing and never respawns", () => {
  const once = sweepAt(freshState, LEAVES[0].x, LEAVES[0].y);
  assert.equal(sweepAt(once, LEAVES[0].x, LEAVES[0].y), once);
});

test("dragging over every leaf completes, and so does one pass", () => {
  const dragged = LEAVES.reduce((s, l) => sweepAt(s, l.x, l.y), freshState);
  assert.equal(isComplete(dragged), true);
  assert.deepEqual([...sweepAll(freshState).cleared].sort(), [...dragged.cleared].sort());
  assert.equal(sweepAll(dragged), dragged);
});

test("sweep cue is rate limited", () => {
  assert.equal(canCue(0, null), true);
  assert.equal(canCue(CUE_INTERVAL_MS - 1, 0), false);
  assert.equal(canCue(CUE_INTERVAL_MS, 0), true);
});

test("leaf sets stay within the cap", () => {
  assert.ok(LEAVES.length <= LEAF_CAP);
  assert.ok(WIND_SET.length <= LEAF_CAP);
});

test("clearing sets the closing line and a pile; the line is not re-armed by the wind", () => {
  const cleared = sweepAll(freshState);
  assert.equal(cleared.lineShown, true);
  assert.equal(cleared.pile, 8);
  assert.equal(isWaiting(cleared), true);
  const windy = blowWind(cleared);
  assert.equal(windy.leaves.length, WIND_SET.length);
  assert.equal(remaining(windy), WIND_SET.length);
  assert.equal(windy.pile, 8);
  assert.equal(windy.lineShown, true);
});

test("the wind only comes after the pause runs out, and only once", () => {
  const cleared = sweepAll(freshState);
  assert.equal(tickSweep(cleared, 1000).windBlew, false);
  const windy = tickSweep(cleared, 0);
  assert.equal(windy.windBlew, true);
  const again = sweepAll(windy);
  assert.equal(isWaiting(again), false);
  assert.equal(blowWind(again), again);
  assert.equal(WIND_PAUSE_SECONDS > 0, true);
});

test("the wind does not blow while leaves remain", () => {
  assert.equal(blowWind(freshState), freshState);
  assert.equal(tickSweep(freshState, 0).windBlew, false);
});

test("the pile is bounded", () => {
  const a = sweepAll(freshState);
  const b = sweepAll(blowWind(a));
  assert.ok(b.pile <= PILE_CAP);
});

test("keyboard strokes clear every leaf within four strokes", () => {
  let s = freshState;
  for (let i = 0; i < 4; i++) s = strokeLane(s);
  assert.equal(isComplete(s), true);
  assert.equal(strokeLane(s), s);
});

test("a path sweep catches leaves a fast drag jumps over", () => {
  const s = sweepPath(freshState, { x: 0, y: 50, vx: 0, vy: 0 }, { x: 100, y: 50, vx: 0, vy: 0 });
  assert.ok(s.cleared.includes(6));
});

test("the broom lags its target and coasts after release", () => {
  const start = { x: 0, y: 0, vx: 0, vy: 0 };
  const moved = stepBroom(start, { x: 100, y: 0 }, 0.016);
  assert.ok(moved.x > 0 && moved.x < 100);
  const coasting = stepBroom(moved, null, 0.016);
  assert.ok(coasting.x > moved.x);
});

test("reducer routes events", () => {
  assert.equal(isComplete(reduceSweep(freshState, { type: "pass" })), true);
  assert.equal(reduceSweep(freshState, { type: "sweep", x: 0, y: 100 }), freshState);
});
