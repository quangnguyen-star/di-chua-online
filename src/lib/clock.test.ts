import assert from "node:assert/strict";
import test from "node:test";
import { appearanceFor, msUntilNextBoundary, vnNow } from "./clock.ts";

// VN is UTC+7, so 06:00 VN is 23:00 UTC the previous day.
const vn = (iso: string) => new Date(`${iso}+07:00`);

test("vnNow reports the Vietnam civil day and hour", () => {
  assert.deepEqual(vnNow(vn("2026-03-01T05:59:59")), { iso: "2026-03-01", hour: 5 });
  assert.deepEqual(vnNow(new Date("2026-03-01T17:00:00Z")), { iso: "2026-03-02", hour: 0 });
});

test("appearance flips at 06:00 and 18:00", () => {
  assert.equal(appearanceFor("auto", 5), "evening");
  assert.equal(appearanceFor("auto", 6), "day");
  assert.equal(appearanceFor("auto", 17), "day");
  assert.equal(appearanceFor("auto", 18), "evening");
  assert.equal(appearanceFor("auto", 0), "evening");
  assert.equal(appearanceFor("day", 22), "day");
  assert.equal(appearanceFor("evening", 12), "evening");
});

test("next boundary is 06:00, 18:00 or the 00:00 rollover", () => {
  assert.equal(msUntilNextBoundary(vn("2026-03-01T05:59:59")), 1000);
  assert.equal(msUntilNextBoundary(vn("2026-03-01T06:00:00")), 12 * 3600_000);
  assert.equal(msUntilNextBoundary(vn("2026-03-01T17:59:59")), 1000);
  assert.equal(msUntilNextBoundary(vn("2026-03-01T18:00:00")), 6 * 3600_000);
  assert.equal(msUntilNextBoundary(vn("2026-03-01T23:59:59")), 1000);
  assert.equal(msUntilNextBoundary(vn("2026-03-02T00:00:00")), 6 * 3600_000);
});
