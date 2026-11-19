import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import {
  SPENT_KEY,
  DEFAULT_STICK,
  burnProgress,
  incenseActivity,
  markSpent,
  readSpent,
  resetSpentMemory,
  type IncenseEvent,
  type IncenseState,
} from "../src/app/places/hall/incense.ts";

const run = (events: IncenseEvent["type"][], seconds = 120): IncenseState =>
  events.reduce((s, type) => incenseActivity.reduce(s, { type }), incenseActivity.initial({ seconds }));

beforeEach(resetSpentMemory);

test("one ritual: the stick starts ready with the default burn length", () => {
  const initial = incenseActivity.initial({});
  assert.equal(initial.phase, "ready");
  assert.equal(initial.seconds, DEFAULT_STICK);
  assert.equal(initial.remainingMs, DEFAULT_STICK * 1000);
  assert.equal(incenseActivity.initial({ seconds: 45 }).remainingMs, 45000);
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

test("the full ritual runs pull, light, extinguish, place in order", () => {
  assert.equal(run(["pull"]).phase, "pulled");
  assert.equal(run(["pull", "pull"]).phase, "pulled");
  assert.equal(run(["pull", "light"]).phase, "burning");
  assert.equal(run(["pull", "light", "pull"]).phase, "burning");
  assert.equal(run(["pull", "light", "extinguish", "place"]).phase, "placed");
  assert.equal(run(["place", "extinguish"]).phase, "ready");
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
