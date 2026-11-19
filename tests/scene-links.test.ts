import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const scenes: [string, string][] = [
  ["src/app/places/hall/IncenseHall.tsx", "hall"],
  ["src/app/places/courtyard/sweeping/Sweeping.tsx", "courtyard"],
  ["src/app/places/pond/lantern/LanternFlow.tsx", "pond"],
  ["src/app/places/veranda/page.tsx", "veranda"],
  ["src/app/places/word/page.tsx", "outside"],
];

for (const [file, place] of scenes) {
  test(`${file} renders SceneLinks`, () => {
    const src = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.match(src, new RegExp(`<SceneLinks\\s+from="${place}"\\s*/>`));
  });
}
