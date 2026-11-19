import assert from "node:assert/strict";
import { test } from "node:test";
import { activities, places, visitCompletionNext } from "../src/content/places.ts";

const ids = new Set(activities.map((a) => a.id));

test("every ready activity has an href", () => {
  for (const a of activities.filter((x) => x.ready)) assert.ok(a.href.startsWith("/"), a.id);
});

test("next references an existing activity", () => {
  for (const a of activities) if (a.next) assert.ok(ids.has(a.next), `${a.id} -> ${a.next}`);
  assert.ok(ids.has(visitCompletionNext));
});

test("every activity sits in a known place", () => {
  const placeIds = new Set<string>(places.map((p) => p.id));
  for (const a of activities) assert.ok(placeIds.has(a.place), a.id);
});
