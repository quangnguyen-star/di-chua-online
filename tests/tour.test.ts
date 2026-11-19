import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { visitStages } from "../src/content/visitStages.ts";
import { initialState, reduce } from "../src/lib/visit/reducer.ts";

const read = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("the tour runs the four shared activities with the stage config", () => {
  const src = read("src/components/visit/StopActivity.tsx");
  for (const name of ["Sweeping", "IncenseHall", "LanternFlow", "TeaPreparation"]) {
    assert.match(src, new RegExp(`<${name}\\b[^>]*embed=\\{embed\\}`));
  }
  assert.match(read("src/components/visit/VisitFlow.tsx"), /seconds=\{stage\.config\.seconds\}/);
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
  assert.match(read("src/components/visit/VisitFlow.tsx"), /<StopActivity key=\{stage\.id\}/);
});

test("the stages sum to 300 active seconds", () => {
  assert.equal(visitStages.reduce((n, s) => n + s.seconds, 0), 300);
});

test("only an unskipped full run is a five-minute tour; skip advances once", () => {
  let t = 0;
  let s = reduce(visitStages, initialState, "begin", t);
  s = reduce(visitStages, s, "skip", t);
  assert.equal(s.stageIndex, 1);
  for (let i = 0; i < 300 && s.phase !== "complete"; i++) {
    t += 1000;
    s = reduce(visitStages, s, "tick", t);
  }
  assert.equal(s.phase, "complete");
  assert.equal(s.skipped, true);

  let full = reduce(visitStages, initialState, "begin", 0);
  for (let i = 1; i <= 301 && full.phase !== "complete"; i++) full = reduce(visitStages, full, "tick", i * 1000);
  assert.equal(full.phase, "complete");
  assert.equal(full.skipped, false);
});
