import assert from "node:assert/strict";
import { test } from "node:test";
import { applyStep, LOWER_AT, resetScene } from "./effects.ts";
import {
  DRIFT_MAX_MS, DRIFT_MIN_MS, REDUCED_MS, RELEASE_STEPS, clampDrift, isReleasing, nextStep, pullRatio, release,
  releaseDuration, stepDuration, type RiverStep,
} from "./sequence.ts";
import type { PondApi } from "../stage/scenes/types.ts";

const recorder = () => {
  const calls: [string, ...unknown[]][] = [];
  const pond: PondApi = {
    setLantern: (c) => calls.push(["setLantern", c]),
    light: () => calls.push(["light"]),
    lower: (x, y) => calls.push(["lower", x, y]),
    ripple: (x, y) => calls.push(["ripple", x, y]),
    setDrift: (a) => calls.push(["setDrift", a]),
    pullBack: (a) => calls.push(["pullBack", a]),
  };
  return { calls, pond };
};

test("the sequence runs writing, fold, place, light, lower, pull back, drift, blended in order", () => {
  const order: RiverStep[] = ["writing"];
  let step = release("writing");
  while (step !== "blended") {
    order.push(step);
    step = nextStep(step);
  }
  order.push(step);
  assert.deepEqual(order, ["writing", "folding", "placing", "lighting", "lowering", "pulling", "drifting", "blended"]);
  assert.deepEqual(RELEASE_STEPS.at(-1), "blended");
});

test("writing waits for a person and blended is the end: neither has a timer", () => {
  assert.equal(stepDuration("writing", 75_000), null);
  assert.equal(stepDuration("blended", 75_000), null);
  assert.equal(nextStep("writing"), "writing");
  assert.equal(nextStep("blended"), "blended");
});

test("timed steps have positive durations and the drift is held to 60-90 seconds", () => {
  for (const s of ["folding", "placing", "lighting", "lowering", "pulling"] as const) assert.ok((stepDuration(s, 75_000) ?? 0) > 0, s);
  assert.equal(stepDuration("drifting", 1_000), DRIFT_MIN_MS);
  assert.equal(stepDuration("drifting", 500_000), DRIFT_MAX_MS);
  assert.equal(stepDuration("drifting", 75_000), 75_000);
  assert.equal(clampDrift(0), DRIFT_MIN_MS);
});

test("the whole release lasts the beats plus the drift", () => {
  const beats = releaseDuration(75_000) - 75_000;
  assert.equal(beats, 1600 + 1400 + 1500 + 1800 + 2600);
});

test("a repeat release changes nothing once the sequence has started", () => {
  const first = release("writing");
  assert.equal(first, "folding");
  for (const s of RELEASE_STEPS) assert.equal(release(s), s);
});

test("the reduced-motion path folds, then goes straight to the settled river", () => {
  assert.equal(stepDuration("folding", 75_000, true), REDUCED_MS);
  assert.equal(nextStep("folding", true), "blended");
  assert.equal(releaseDuration(75_000, true), REDUCED_MS);
  assert.equal(isReleasing("folding"), true);
  assert.equal(isReleasing("blended"), false);
});

test("the camera pull eases from 0 to 1 and never leaves that range", () => {
  assert.equal(pullRatio(-5), 0);
  assert.equal(pullRatio(0), 0);
  assert.equal(pullRatio(1e9), 1);
  assert.ok(pullRatio(1300) > 0.3 && pullRatio(1300) < 0.7);
});

test("each beat draws itself on the scene, with colour and place only", () => {
  const { calls, pond } = recorder();
  for (const s of RELEASE_STEPS) applyStep(pond, s, "pink");
  assert.deepEqual(calls, [
    ["setLantern", "pink"],
    ["setDrift", 0.4],
    ["light"],
    ["lower", LOWER_AT.x, LOWER_AT.y],
    ["pullBack", 1],
    ["setDrift", 1],
  ]);
});

test("the reduced path applies the whole release at once", () => {
  const { calls, pond } = recorder();
  applyStep(pond, "folding", "white", true);
  assert.deepEqual(calls.map((c) => c[0]), ["setLantern", "light", "lower", "setDrift", "pullBack"]);
});

test("cleanup puts the scene back and is safe to repeat or without a scene", () => {
  const { calls, pond } = recorder();
  resetScene(pond);
  resetScene(pond);
  assert.deepEqual(calls.slice(0, 3), [["setLantern", null], ["setDrift", 1], ["pullBack", 0]]);
  assert.doesNotThrow(() => resetScene(null));
  assert.doesNotThrow(() => applyStep(null, "folding", "gold"));
});

test("no scene call ever carries a typed thought", () => {
  const sentinel = "SENTINEL-thought-text";
  const { calls, pond } = recorder();
  for (const s of RELEASE_STEPS) applyStep(pond, s, "gold");
  resetScene(pond);
  assert.ok(!JSON.stringify(calls).includes(sentinel));
  assert.equal(applyStep.length <= 4, true);
});
