import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import {
  SPENT_KEY,
  STICKS,
  breathPhase,
  burnProgress,
  formatRemaining,
  incenseActivity,
  markSpent,
  parseVariant,
  readSpent,
  resetSpentMemory,
  variantDefaults,
  type IncenseEvent,
  type IncenseState,
} from "../src/app/places/hall/incense.ts";

const run = (events: IncenseEvent["type"][], seconds = 120): IncenseState =>
  events.reduce((s, type) => incenseActivity.reduce(s, { type }), incenseActivity.initial({ seconds }));

beforeEach(resetSpentMemory);

test("sticks are 120, 300 or 600 seconds", () => {
  assert.deepEqual([...STICKS], [120, 300, 600]);
  assert.equal(incenseActivity.initial({ seconds: 600 }).remainingMs, 600000);
});

test("light, extinguish and place in order; later light is a no-op", () => {
  assert.equal(run(["light"]).phase, "burning");
  assert.equal(run(["light", "light"]).phase, "burning");
  assert.equal(run(["extinguish"]).phase, "ready");
  assert.equal(run(["place"]).phase, "ready");
  assert.equal(run(["light", "extinguish"]).phase, "extinguished");
  assert.equal(run(["light", "extinguish", "place"]).phase, "placed");
  assert.equal(run(["light", "extinguish", "light"]).phase, "extinguished");
});

test("pause freezes the burn and ignores ticks", () => {
  const paused = run(["light", "pause"]);
  assert.equal(paused.phase, "paused");
  assert.equal(run(["light", "pause", "resume"]).phase, "burning");
  const ticked = incenseActivity.tick!(paused, 50000);
  assert.equal(ticked.phase, "paused");
});

test("ticks burn the stick down and spend it at zero", () => {
  const lit = run(["light"]);
  assert.equal(incenseActivity.tick!(lit, 60000).remainingMs, 60000);
  const spent = incenseActivity.tick!(lit, 0);
  assert.equal(spent.phase, "spent");
  assert.equal(incenseActivity.reduce(spent, { type: "place" }).phase, "placed");
  assert.equal(incenseActivity.tick!(run(["light", "extinguish"]), 0).phase, "extinguished");
  assert.equal(incenseActivity.tick!(incenseActivity.initial({ seconds: 120 }), 0).phase, "ready");
});

test("burnProgress is clamped to 0..1", () => {
  assert.equal(burnProgress(300000, 300), 0);
  assert.equal(burnProgress(150000, 300), 0.5);
  assert.equal(burnProgress(-5, 300), 1);
  assert.equal(burnProgress(999999, 300), 0);
});

test("formatRemaining rounds up to whole seconds", () => {
  assert.equal(formatRemaining(180000), "3:00");
  assert.equal(formatRemaining(59001), "1:00");
  assert.equal(formatRemaining(0), "0:00");
});

test("breath cue is 4 s in then 6 s out", () => {
  assert.equal(breathPhase(0), "in");
  assert.equal(breathPhase(3999), "in");
  assert.equal(breathPhase(4000), "out");
  assert.equal(breathPhase(9999), "out");
  assert.equal(breathPhase(10000), "in");
});

test("variants pick their defaults and unknown values fall back to incense", () => {
  assert.equal(parseVariant("breathing"), "breathing");
  assert.equal(parseVariant(["sitting"]), "sitting");
  assert.equal(parseVariant("nope"), "incense");
  assert.equal(parseVariant(undefined), "incense");
  assert.deepEqual(variantDefaults("breathing"), { seconds: 120, cue: "paced" });
});

test("spent flag is the only stored value and survives a failing storage in memory", () => {
  const data = new Map<string, string>();
  const ok = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
  assert.equal(readSpent(ok), false);
  markSpent(ok);
  assert.deepEqual([...data.entries()], [[SPENT_KEY, "1"]]);
  assert.equal(readSpent(ok), true);

  resetSpentMemory();
  const broken = {
    getItem: () => {
      throw new Error("denied");
    },
    setItem: () => {
      throw new Error("denied");
    },
  };
  assert.equal(readSpent(broken), false);
  markSpent(broken);
  assert.equal(readSpent(broken), true);
});
