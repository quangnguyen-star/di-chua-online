import assert from "node:assert/strict";
import test from "node:test";
import { dailyWords, practices, visitStages, wordForDate } from "./index.ts";

test("wordForDate is stable across Ho Chi Minh midnight", () => {
  const before = new Date("2026-11-19T16:59:59.999Z");
  const after = new Date("2026-11-19T17:00:00.000Z");
  const morning = new Date("2026-11-19T01:00:00.000Z");
  assert.equal(wordForDate(before), wordForDate(morning));
  assert.notEqual(wordForDate(before), wordForDate(after));
  assert.equal(wordForDate(after), wordForDate(new Date("2026-11-20T16:59:59.999Z")));
});

test("daily words include the required set", () => {
  assert.ok(dailyWords.length >= 7);
  for (const w of ["An", "Tĩnh", "Buông", "Nhẫn"]) {
    assert.ok(dailyWords.some((d) => d.word === w), w);
  }
});

test("visit stages sum to 300 seconds", () => {
  assert.deepEqual(visitStages.map((s) => s.seconds), [30, 60, 180, 30]);
  assert.equal(visitStages.reduce((n, s) => n + s.seconds, 0), 300);
});

test("three complete practices", () => {
  assert.deepEqual(practices.map((p) => p.slug), ["tho-2-phut", "ngoi-yen-5-phut", "tra-3-phut"]);
  for (const p of practices) {
    assert.ok(p.steps.length >= 4 && p.openingLine && p.closingLine && p.credit);
  }
  assert.ok(practices[2].alternative);
});
