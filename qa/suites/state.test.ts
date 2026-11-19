import assert from "node:assert/strict";
import { test } from "node:test";
import { dailyWords, visitStages, wordForDate } from "../../src/content/index.ts";
import { routes } from "../../src/content/routes.ts";
import { appearanceFor, vnNow } from "../../src/lib/clock.ts";
import { buildIcs } from "../../src/lib/ics.ts";
import { DEFAULT_STICK, incenseActivity } from "../../src/app/places/hall/incense.ts";
import { LEAF_CAP, spawnLeaf, freshWorld } from "../../src/app/places/courtyard/sweeping/logic.ts";

// Run with: node --test --experimental-strip-types qa/suites/state.test.ts

const vn = (iso: string) => new Date(`${iso}+07:00`);

test("tour: six stops in route order totalling 300 active seconds", () => {
  assert.deepEqual(visitStages.map((s) => s.seconds), [30, 45, 30, 120, 45, 30]);
  assert.equal(visitStages.reduce((n, s) => n + s.seconds, 0), 300);
  assert.deepEqual(visitStages.map((s) => s.id), routes.map((r) => r.id));
});

test("hall: one ritual, sized by the stop and not by a stick choice", () => {
  assert.equal(DEFAULT_STICK, 30);
  assert.equal(incenseActivity.initial({}).seconds, 30);
  assert.equal(incenseActivity.initial({ seconds: 30 }).phase, "ready");
});

test("hall: pull, light, extinguish, place; light cannot start twice", () => {
  let s = incenseActivity.initial({ seconds: 30 });
  const seen = [s.phase];
  for (const type of ["pull", "light", "light", "extinguish", "place"] as const) {
    s = incenseActivity.reduce(s, { type });
    seen.push(s.phase);
  }
  assert.deepEqual(seen, ["ready", "pulled", "burning", "burning", "extinguished", "placed"]);
});

test("hall: Light works straight from ready for keyboard users", () => {
  assert.equal(incenseActivity.reduce(incenseActivity.initial({ seconds: 30 }), { type: "light" }).phase, "burning");
});

test("hall: burning out reaches spent, not placed", () => {
  let s = incenseActivity.reduce(incenseActivity.initial({ seconds: 30 }), { type: "light" });
  const { tick } = incenseActivity;
  assert.ok(tick, "incense activity defines a tick");
  s = tick(s, 0);
  assert.equal(s.phase, "spent");
});

test("sweeping: new leaves keep falling but live leaves stay under the cap", () => {
  let w = freshWorld;
  for (let i = 0; i < LEAF_CAP * 2; i++) w = spawnLeaf(w, () => 0.5);
  assert.equal(w.leaves.length, LEAF_CAP);
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
