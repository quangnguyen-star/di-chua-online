import assert from "node:assert/strict";
import test from "node:test";
import {
  LEAVES,
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
