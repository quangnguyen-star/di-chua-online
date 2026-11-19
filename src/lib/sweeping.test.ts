import assert from "node:assert/strict";
import test from "node:test";
import {
  CUE_INTERVAL_MS,
  FAST_SPEED,
  LEAF_CAP,
  PILE,
  PILE_CAP,
  SLOW_SPEED,
  canCue,
  freshWorld,
  relocateLeaves,
  settleLeaf,
  spawnLeaf,
  stepBroom,
  stepWorld,
  type World,
} from "../app/places/courtyard/sweeping/logic.ts";

const rand = () => 0.5;
const landedAt = (x: number, y: number): World => ({ ...freshWorld, spawnIn: 99, nextId: 2, leaves: [{ id: 1, x, y, vx: 0, vy: 0, rot: 0, landed: true }] });

test("leaves keep falling and never exceed the live cap", () => {
  let w = freshWorld;
  for (let i = 0; i < LEAF_CAP * 3; i++) w = spawnLeaf(w, rand);
  assert.equal(w.leaves.length, LEAF_CAP);
  assert.equal(spawnLeaf(w, rand), w);
  let s: World = { ...freshWorld, spawnIn: 0 };
  for (let i = 0; i < 4000; i++) s = stepWorld(s, { x: 0, y: 0, vx: 0, vy: 0 }, 0.05, rand);
  assert.ok(s.leaves.length <= LEAF_CAP);
  assert.ok(s.leaves.length > 0);
});

test("a falling leaf lands on the ground and stays there", () => {
  let w = spawnLeaf(freshWorld, rand);
  for (let i = 0; i < 400; i++) w = { ...stepWorld({ ...w, spawnIn: 99 }, { x: 0, y: 0, vx: 0, vy: 0 }, 0.05, rand) };
  assert.equal(w.leaves[0].landed, true);
});

test("a slow broom gathers a leaf toward the pile", () => {
  const w = landedAt(50, 70);
  const next = stepWorld(w, { x: 50, y: 70, vx: SLOW_SPEED / 2, vy: 0 }, 0.05, rand);
  const before = Math.hypot(PILE.x - 50, PILE.y - 70);
  assert.ok(Math.hypot(PILE.x - next.leaves[0].x, PILE.y - next.leaves[0].y) < before);
});

test("a fast broom scatters a leaf away from it", () => {
  const w = landedAt(55, 70);
  const next = stepWorld(w, { x: 50, y: 70, vx: FAST_SPEED * 2, vy: 0 }, 0.05, rand);
  assert.ok(next.leaves[0].x > 55);
  assert.ok(Math.abs(next.leaves[0].vx) > SLOW_SPEED);
});

test("a leaf in reach of a resting broom stays where it is", () => {
  const next = stepWorld(landedAt(50, 70), { x: 50, y: 70, vx: 0, vy: 0 }, 0.05, rand);
  assert.equal(next.leaves[0].x, 50);
});

test("a leaf reaching the pile joins it, and the pile is bounded", () => {
  let w = landedAt(PILE.x, PILE.y);
  w = stepWorld(w, { x: 0, y: 0, vx: 0, vy: 0 }, 0.05, rand);
  assert.equal(w.leaves.length, 0);
  assert.equal(w.pile, 1);
  const full = stepWorld({ ...landedAt(PILE.x, PILE.y), pile: PILE_CAP }, { x: 0, y: 0, vx: 0, vy: 0 }, 0.05, rand);
  assert.equal(full.pile, PILE_CAP);
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
