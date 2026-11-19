import assert from "node:assert/strict";
import { test } from "node:test";
import { buildIcs, escapeIcsText, foldLine } from "./ics.ts";

test("buildIcs(2024): deterministic, DATE-valued, UID shape", () => {
  const a = buildIcs(2024);
  assert.equal(a, buildIcs(2024));
  assert.match(a, /UID:dc-20240210-mung1@dichua\r\n/);
  assert.match(a, /DTSTART;VALUE=DATE:20240210\r\n/);
  assert.match(a, /DTEND;VALUE=DATE:20240211\r\n/);
  const uids = [...a.matchAll(/UID:(.+)\r\n/g)].map((m) => m[1]);
  assert.equal(new Set(uids).size, uids.length);
  for (const u of uids) assert.match(u, /^dc-2024\d{4}-(mung1|ram)@dichua$/);
  assert.ok(uids.length >= 24 && uids.length <= 26);
});

test("text escaping and folding", () => {
  assert.equal(escapeIcsText("a,b;c\\d\ne"), "a\\,b\;c\\\\d\\ne");
  const folded = foldLine("SUMMARY:" + "ằ".repeat(60));
  for (const l of folded.split("\r\n")) assert.ok(new TextEncoder().encode(l).length <= 75);
  assert.equal(folded.replace(/\r\n /g, ""), "SUMMARY:" + "ằ".repeat(60));
});
