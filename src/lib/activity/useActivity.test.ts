import assert from "node:assert/strict";
import test from "node:test";
import { createActivity, type ActivityDefinition } from "./activity.ts";

interface S {
  count: number;
  remainingMs: number;
}
type E = { type: "inc" };

const def: ActivityDefinition<S, E> = {
  initial: (config) => ({ count: 0, remainingMs: (config.seconds ?? 60) * 1000 }),
  reduce: (s) => ({ ...s, count: s.count + 1 }),
  tick: (s, remainingMs) => ({ ...s, remainingMs }),
  seconds: 60,
};

test("config override sets the duration without a separate definition", () => {
  const a = createActivity(def, { seconds: 120 }, { schedule: () => () => {} });
  assert.equal(a.getState().remainingMs, 120_000);
});

test("send updates state and notifies; dispose stops further updates", () => {
  const a = createActivity(def, {}, { schedule: () => () => {} });
  let calls = 0;
  a.subscribe(() => void calls++);
  a.send({ type: "inc" });
  assert.equal(a.getState().count, 1);
  assert.equal(calls, 1);
  a.dispose();
  a.send({ type: "inc" });
  assert.equal(a.getState().count, 1);
  assert.equal(a.disposed, true);
});

test("pause freezes the timer-driven state until resume", () => {
  let t = 0;
  const a = createActivity(def, { seconds: 10 }, { now: () => t, schedule: () => () => {} });
  a.resume();
  t = 2000;
  a.pause();
  assert.equal(a.getState().remainingMs, 8000);
  t = 50_000;
  a.resume();
  t = 51_000;
  a.pause();
  assert.equal(a.getState().remainingMs, 7000);
});
