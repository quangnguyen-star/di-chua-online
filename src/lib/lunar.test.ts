import assert from "node:assert/strict";
import { test } from "node:test";
import { lunarDate } from "./lunar/index.ts";

// Fixture dates for the pre-existing cases are the published Vietnamese calendar dates; the cross-check block at the end cites its sources.

test("mung mot: Tet Giap Thin, 1st day of month 1 = 2024-02-10", () => {
  assert.deepEqual(lunarDate(new Date("2024-02-10T12:00:00+07:00")), {
    day: 1, month: 1, leap: false, year: 2024, note: "mung-mot",
  });
});

test("ram: Mid-Autumn 2023 (Trung Thu), 15th of month 8 = 2023-09-29", () => {
  assert.deepEqual(lunarDate(new Date("2023-09-29T12:00:00+07:00")), {
    day: 15, month: 8, leap: false, year: 2023, note: "ram",
  });
});

test("leap month: 2023 had a leap month 2 (nhuan thang 2) starting 2023-03-22", () => {
  assert.deepEqual(lunarDate(new Date("2023-03-22T12:00:00+07:00")), {
    day: 1, month: 2, leap: true, year: 2023, note: "mung-mot",
  });
  assert.equal(lunarDate(new Date("2023-03-21T12:00:00+07:00")).leap, false);
});

test("midnight UTC+7 boundary: Tet 2024 begins at 2024-02-10T00:00+07:00 (= 02-09T17:00Z)", () => {
  const before = lunarDate(new Date("2024-02-09T16:59:59Z"));
  assert.deepEqual(before, { day: 30, month: 12, leap: false, year: 2023 });
  const after = lunarDate(new Date("2024-02-09T17:00:00Z"));
  assert.equal(after.day, 1);
  assert.equal(after.month, 1);
  assert.equal(after.note, "mung-mot");
});

test("invalid date throws", () => {
  assert.throws(() => lunarDate(new Date("nope")));
});

// Cross-check fixtures. Sources (fetched this session):
//  [T] https://en.wikipedia.org/wiki/T%E1%BA%BFt  - Gregorian date of Tet 2020-2025, 2026 = 17 February.
//  [C] https://en.wikipedia.org/wiki/Chinese_calendar - leap months: 2017 leap 6th, 2020 leap 4th,
//      2023 leap 2nd, 2025 leap 6th (Vietnamese calendar agrees in these years).
const TET: [number, string][] = [
  [2020, "2020-01-25"], [2021, "2021-02-12"], [2022, "2022-02-01"],
  [2023, "2023-01-22"], [2024, "2024-02-10"], [2025, "2025-01-29"], [2026, "2026-02-17"],
];

for (const [year, iso] of TET) {
  test(`[T] Tet ${year} is ${iso}; the day before closes month 12 of the previous lunar year (year boundary)`, () => {
    const tet = lunarDate(new Date(`${iso}T12:00:00+07:00`));
    assert.deepEqual([tet.day, tet.month, tet.leap, tet.year], [1, 1, false, year]);
    const eve = lunarDate(new Date(new Date(`${iso}T12:00:00+07:00`).getTime() - 86_400_000));
    assert.deepEqual([eve.month, eve.leap, eve.year], [12, false, year - 1]);
    assert.ok(eve.day === 29 || eve.day === 30);
  });
}

function leapMonthsIn(year: number): number[] {
  const found = new Set<number>();
  for (let t = Date.UTC(year, 0, 1); t < Date.UTC(year + 1, 0, 1); t += 86_400_000) {
    const l = lunarDate(new Date(t + 5 * 3_600_000));
    if (l.leap) found.add(l.month);
  }
  return [...found];
}

for (const [year, month] of [[2017, 6], [2020, 4], [2023, 2], [2025, 6]] as const) {
  test(`[C] leap month ${month} occurs in ${year}`, () => {
    assert.deepEqual(leapMonthsIn(year), [month]);
  });
}

test("[C] years without a listed leap month have none", () => {
  for (const y of [2021, 2022, 2024]) assert.deepEqual(leapMonthsIn(y), []);
});
