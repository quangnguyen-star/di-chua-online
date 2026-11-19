import assert from "node:assert/strict";
import test from "node:test";
import {
  CUE_INTERVAL_MS,
  GROUND_BOTTOM,
  GROUND_TOP,
  LEAF_CAP,
  LEAF_TINTS,
  MARK_CAP,
  MARK_LIFE,
  PILE,
  PILE_CAP,
  broomTilt,
  canCue,
  depthScale,
  freshWorld,
  pileScale,
  relocateLeaves,
  settleLeaf,
  spawnLeaf,
  stepBroom,
  stepMarks,
  stepWorld,
  type World,
} from "../app/places/courtyard/sweeping/logic.ts";

const rand = () => 0.5;
const still = { x: 0, y: 0, vx: 0, vy: 0 };
const landedAt = (x: number, y: number): World => ({ ...freshWorld, spawnIn: 99, nextId: 2, leaves: [{ id: 1, x, y, vx: 0, vy: 0, rot: 0, spin: 0, kind: 0, landed: true }] });

test("leaves keep falling and never exceed the live cap", () => {
  let w = freshWorld;
  for (let i = 0; i < LEAF_CAP * 3; i++) w = spawnLeaf(w, rand);
  assert.equal(w.leaves.length, LEAF_CAP);
  assert.equal(spawnLeaf(w, rand), w);
  let s: World = { ...freshWorld, spawnIn: 0 };
  for (let i = 0; i < 4000; i++) s = stepWorld(s, still, 0.05, rand);
  assert.ok(s.leaves.length <= LEAF_CAP);
  assert.ok(s.leaves.length > 0);
});

test("leaves carry one of the tints and land inside the ground band", () => {
  const w = spawnLeaf(freshWorld, () => 0.99);
  assert.ok(w.leaves[0].kind < LEAF_TINTS.length);
  let s = w;
  for (let i = 0; i < 400; i++) s = stepWorld({ ...s, spawnIn: 99 }, still, 0.05, rand);
  assert.equal(s.leaves[0].landed, true);
  assert.ok(s.leaves[0].y >= GROUND_TOP && s.leaves[0].y <= GROUND_BOTTOM);
});

test("a moving broom pushes a leaf along its direction", () => {
  const next = stepWorld(landedAt(55, 60), { x: 50, y: 60, vx: 40, vy: 0 }, 0.05, rand);
  assert.ok(next.leaves[0].x > 55);
  assert.ok(next.leaves[0].vx > 0);
});

test("a pushed leaf keeps sliding after the broom stops, and friction brings it to rest", () => {
  let w = stepWorld(landedAt(55, 60), { x: 50, y: 60, vx: 60, vy: 0 }, 0.05, rand);
  const pushed = w.leaves[0].vx;
  const x = w.leaves[0].x;
  w = stepWorld(w, still, 0.05, rand);
  assert.ok(w.leaves[0].x > x, "inertia carries it on");
  assert.ok(w.leaves[0].vx < pushed, "friction slows it");
  for (let i = 0; i < 200; i++) w = stepWorld(w, still, 0.05, rand);
  assert.ok(Math.abs(w.leaves[0].vx) < 0.01);
});

test("a leaf in reach of a resting broom stays where it is", () => {
  const next = stepWorld(landedAt(50, 60), { x: 50, y: 60, vx: 0, vy: 0 }, 0.05, rand);
  assert.equal(next.leaves[0].x, 50);
});

test("a leaf far from the broom is not pushed", () => {
  const next = stepWorld(landedAt(10, 60), { x: 80, y: 60, vx: 80, vy: 0 }, 0.05, rand);
  assert.equal(next.leaves[0].vx, 0);
});

test("leaves gathered into the corner raise the pile, which is capped", () => {
  let w = landedAt(PILE.x, PILE.y);
  w = stepWorld(w, still, 0.05, rand);
  assert.equal(w.leaves.length, 0);
  assert.equal(w.pile, 1);
  assert.ok(pileScale(w.pile) > pileScale(0));
  const full = stepWorld({ ...landedAt(PILE.x, PILE.y), pile: PILE_CAP }, still, 0.05, rand);
  assert.equal(full.pile, PILE_CAP);
  assert.equal(pileScale(PILE_CAP * 3), pileScale(PILE_CAP));
});

test("the broom tilts with the drag direction and the tilt is bounded", () => {
  assert.ok(broomTilt({ x: 0, y: 0, vx: 20, vy: 0 }) > 0);
  assert.ok(broomTilt({ x: 0, y: 0, vx: -20, vy: 0 }) < 0);
  assert.equal(broomTilt(still), 0);
  assert.equal(broomTilt({ x: 0, y: 0, vx: 9999, vy: 0 }), 35);
});

test("sweep marks appear while sweeping, fade out and stay capped", () => {
  const fast = { x: 10, y: 60, vx: 40, vy: 0 };
  let marks = stepMarks([], fast, 0.016, true);
  assert.equal(marks.length, 1);
  assert.deepEqual(stepMarks([], fast, 0.016, false), []);
  assert.deepEqual(stepMarks([], still, 0.016, true), []);
  marks = stepMarks(marks, still, MARK_LIFE + 0.1, true);
  assert.equal(marks.length, 0);
  for (let i = 0; i < MARK_CAP * 3; i++) marks = stepMarks(marks, { ...fast, x: i * 5 }, 0.001, true);
  assert.ok(marks.length <= MARK_CAP);
});

test("leaves nearer the viewer are drawn larger", () => {
  assert.ok(depthScale(GROUND_BOTTOM) > depthScale(GROUND_TOP));
});

test("reduced motion: leaves arrive landed and arrows relocate them in whole hops", () => {
  const w = settleLeaf(freshWorld, rand);
  assert.equal(w.leaves[0].landed, true);
  const moved = relocateLeaves({ ...w, leaves: [{ ...w.leaves[0], x: 40 }] }, 40, 1);
  assert.ok(moved.leaves[0].x > 40);
  assert.equal(relocateLeaves(w, 0, 1).leaves.length, 1);
});

test("sweep cue is rate limited", () => {
  assert.equal(canCue(0, null), true);
  assert.equal(canCue(CUE_INTERVAL_MS - 1, 0), false);
  assert.equal(canCue(CUE_INTERVAL_MS, 0), true);
});

test("the broom lags its target and coasts after release", () => {
  const moved = stepBroom({ x: 0, y: 0, vx: 0, vy: 0 }, { x: 100, y: 0 }, 0.016);
  assert.ok(moved.x > 0 && moved.x < 100);
  assert.ok(stepBroom(moved, null, 0.016).x > moved.x);
});
