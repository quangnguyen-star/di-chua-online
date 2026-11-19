import assert from "node:assert/strict";
import { test } from "node:test";
import { dailyWords, visitStages, wordForDate } from "../../src/content/index.ts";
import { routes } from "../../src/content/routes.ts";
import { appearanceFor, vnNow } from "../../src/lib/clock.ts";
import { buildIcs } from "../../src/lib/ics.ts";
import { DEFAULT_STICK, STICKS, incenseActivity, variantDefaults } from "../../src/app/places/hall/incense.ts";
import { CLEARED_LINE, freshState, reduceSweep, remaining } from "../../src/app/places/courtyard/sweeping/logic.ts";

// Run with: node --test --experimental-strip-types qa/suites/state.test.ts

const vn = (iso: string) => new Date(`${iso}+07:00`);

test("tour: six stops in route order totalling 300 active seconds", () => {
  assert.deepEqual(visitStages.map((s) => s.seconds), [30, 45, 30, 120, 45, 30]);
  assert.equal(visitStages.reduce((n, s) => n + s.seconds, 0), 300);
  assert.deepEqual(visitStages.map((s) => s.id), routes.map((r) => r.id));
});

test("hall: sticks 120/300/600, default 300, variants preselect their duration", () => {
  assert.deepEqual([...STICKS], [120, 300, 600]);
  assert.equal(DEFAULT_STICK, 300);
  assert.equal(variantDefaults("incense").seconds, 300);
  assert.equal(variantDefaults("breathing").seconds, 120);
  assert.equal(variantDefaults("sitting").seconds, 300);
});

test("hall: keyboard-reachable states follow ready, burning, paused, burning, extinguished, placed", () => {
  let s = incenseActivity.initial({ seconds: 300 });
  const seen = [s.phase];
  for (const type of ["light", "pause", "resume", "extinguish", "place"] as const) {
    s = incenseActivity.reduce(s, { type });
    seen.push(s.phase);
  }
  assert.deepEqual(seen, ["ready", "burning", "paused", "burning", "extinguished", "placed"]);
});

test("hall: burning out reaches spent, not placed", () => {
  let s = incenseActivity.reduce(incenseActivity.initial({ seconds: 120 }), { type: "light" });
  const { tick } = incenseActivity;
  assert.ok(tick, "incense activity defines a tick");
  s = tick(s, 0);
  assert.equal(s.phase, "spent");
});

test("sweeping: one pass clears the first set, shows the line once, pile grows", () => {
  assert.equal(remaining(freshState), 8);
  const done = reduceSweep(freshState, { type: "pass" });
  assert.equal(remaining(done), 0);
  assert.equal(done.lineShown, true);
  assert.equal(done.pile, 8);
  assert.equal(CLEARED_LINE, "Lá vẫn rơi. Cứ quét chậm thôi.");
});

test("appearance: auto is day from 06:00 to 17:59 Vietnam time, evening otherwise", () => {
  const hours = (iso: string) => appearanceFor("auto", vnNow(vn(iso)).hour);
  assert.equal(hours("2026-06-01T05:59:59"), "evening");
  assert.equal(hours("2026-06-01T06:00:00"), "day");
  assert.equal(hours("2026-06-01T17:59:59"), "day");
  assert.equal(hours("2026-06-01T18:00:00"), "evening");
  assert.equal(appearanceFor("day", 23), "day");
  assert.equal(appearanceFor("evening", 12), "evening");
});

test("daily word: stable within a Vietnam day, changes at its midnight", () => {
  const a = wordForDate(vn("2026-06-01T00:00:00"));
  assert.equal(wordForDate(vn("2026-06-01T23:59:59")), a);
  assert.notEqual(wordForDate(vn("2026-06-02T00:00:00")), a);
  assert.ok(new Set(Array.from({ length: dailyWords.length }, (_, i) => wordForDate(new Date(vn("2026-06-01T12:00:00").getTime() + i * 86_400_000)))).size === dailyWords.length);
});

test("calendar export: valid VCALENDAR with 24 to 26 events for the year", () => {
  const ics = buildIcs(2026);
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /END:VCALENDAR\r\n$/);
  const events = ics.match(/BEGIN:VEVENT/g)?.length ?? 0;
  assert.ok(events >= 24 && events <= 26, `events: ${events}`);
});
