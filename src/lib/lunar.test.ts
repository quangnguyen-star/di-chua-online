import assert from "node:assert/strict";
import { test } from "node:test";
import { lunarDate } from "./lunar/index.ts";

// Fixture dates are the widely published Vietnamese calendar dates (Ho Ngoc Duc's
// lunar calendar tables / Vietnamese national holiday calendars). They were recalled,
// not re-fetched from the web in this session; re-check against
// https://www.informatik.uni-leipzig.de/~duc/amlich/ before relying on them as sources.

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
