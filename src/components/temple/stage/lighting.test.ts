import assert from "node:assert/strict";
import test from "node:test";
import { isRam, lanternCount, lightingForHour, resolveLighting } from "./lighting.ts";

test("lighting follows mist 06-11, golden 11-18, moon otherwise", () => {
  const expected = { 5: "moon", 6: "mist", 10: "mist", 11: "golden", 17: "golden", 18: "moon", 23: "moon", 0: "moon" } as const;
  for (const [hour, want] of Object.entries(expected)) assert.equal(lightingForHour(Number(hour)), want, `hour ${hour}`);
});

test("the river is always moon, other places honour the request", () => {
  const noon = new Date("2026-03-10T05:00:00Z");
  assert.equal(resolveLighting("pond", "golden", noon), "moon");
  assert.equal(resolveLighting("pond", undefined, noon), "moon");
  assert.equal(resolveLighting("gate", "mist", noon), "mist");
  assert.equal(resolveLighting("gate", undefined, noon), "golden");
});

test("rằm adds lanterns and is detected on the full-moon day", () => {
  assert.ok(lanternCount("moon", true) > lanternCount("moon", false));
  assert.equal(isRam(new Date("2026-03-03T05:00:00Z")), true);
  assert.equal(isRam(new Date("2026-03-05T05:00:00Z")), false);
});
