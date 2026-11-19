import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { visitStages } from "../src/content/visitStages.ts";

const read = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("the tour runs the four shared activities with the stage config", () => {
  const src = read("src/components/visit/StopActivity.tsx");
  for (const name of ["Sweeping", "IncenseHall", "LanternFlow", "TeaPreparation"]) {
    assert.match(src, new RegExp(`<${name}\\b[^>]*embed=\\{embed\\}`));
  }
  assert.match(read("src/components/visit/VisitShell.tsx"), /seconds=\{stage\.config\.seconds\}/);
});

test("each embedded activity hides its own map and next links", () => {
  for (const file of [
    "src/app/places/courtyard/sweeping/Sweeping.tsx",
    "src/app/places/pond/lantern/LanternFlow.tsx",
  ]) {
    assert.match(read(file), /!embed && <SceneLinks|!embed && \(\s*<>\s*<div[^>]*>\s*<Link[\s\S]*<SceneLinks/);
  }
});

test("the lantern thought is cleared on entry and never stored", () => {
  const src = read("src/app/places/pond/lantern/LanternFlow.tsx");
  assert.match(src, /setThought\(""\);\s*return \(\) => setThought\(""\)/);
  assert.doesNotMatch(src, /localStorage|sessionStorage|fetch\(/);
  assert.match(read("src/components/visit/VisitShell.tsx"), /<StopActivity key=\{stage\.id\}/);
});

test("the stages sum to 300 active seconds", () => {
  assert.equal(visitStages.reduce((n, s) => n + s.seconds, 0), 300);
});
