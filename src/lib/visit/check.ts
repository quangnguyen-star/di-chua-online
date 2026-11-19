// Run: node --experimental-strip-types src/lib/visit/check.ts (silent; exit code 0 means every check passed)
import assert from "node:assert/strict";
import { initialState, reduce, type Action, type EngineState, type Stage } from "./reducer.ts";

const stages: Stage[] = [
  { id: "a", label: "A", seconds: 10, prompt: "a" },
  { id: "b", label: "B", seconds: 5, prompt: "b" },
];

let now = 0;
let s: EngineState = initialState;
const send = (a: Action, advance = 0) => {
  now += advance;
  s = reduce(stages, s, a, now);
};

send("begin");
assert.equal(s.phase, "running");
assert.equal(s.remainingMs, 10_000);

send("tick", 3000);
assert.equal(s.remainingMs, 7000);

send("pause", 1000);
assert.equal(s.phase, "paused");
assert.equal(s.remainingMs, 6000);
send("tick", 60_000);
assert.equal(s.remainingMs, 6000, "paused time never counts");
send("resume");
send("tick", 1000);
assert.equal(s.remainingMs, 5000);

send("hidden", 2000);
assert.equal(s.phase, "paused", "hidden pauses");
assert.equal(s.remainingMs, 3000);
send("tick", 30_000);
assert.equal(s.remainingMs, 3000, "hidden time never counts");
assert.equal(s.phase, "paused", "no implicit resume");

send("resume");
send("tick", 3000);
assert.equal(s.stageIndex, 1, "stage advances at zero");
assert.equal(s.remainingMs, 5000);
assert.equal(s.skipped, false);

send("skip");
assert.equal(s.phase, "complete", "skip on last stage completes");
assert.equal(s.skipped, true);
const done = s;
send("skip");
send("tick", 1000);
send("begin");
assert.equal(s, done, "complete is terminal and fires once");

send("exit");
assert.deepEqual(s, initialState, "exit resets to ready");

send("begin");
send("skip");
assert.equal(s.stageIndex, 1, "skip advances exactly once");
assert.equal(s.skipped, true);

send("exit");
send("begin");
send("tick", 10_000);
send("tick", 5000);
assert.equal(s.phase, "complete");
assert.equal(s.skipped, false);

