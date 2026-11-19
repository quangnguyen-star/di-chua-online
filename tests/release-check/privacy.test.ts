import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (p: string) => readFileSync(new URL(`../../src/${p}`, import.meta.url), "utf8");

const VISIT_FILES = [
  "components/visit/VisitShell.tsx",
  "components/visit/VisitErrorBoundary.tsx",
  "app/visit/page.tsx",
  "lib/visit/deepLink.ts",
  "lib/visit/reducer.ts",
  "lib/visit/useVisit.ts",
];

test("visit code never stores, logs, fetches, tracks or plays sound", () => {
  for (const f of VISIT_FILES) {
    const src = read(f);
    assert.doesNotMatch(src, /console\.|localStorage|sessionStorage|indexedDB|document\.cookie/, f);
    assert.doesNotMatch(src, /fetch\(|sendBeacon|XMLHttpRequest|lib\/analytics|track\(/, f);
    assert.doesNotMatch(src, /autoPlay|new Audio|<audio/, f);
    assert.doesNotMatch(src, /componentDidCatch/, f);
  }
});

test("analytics payload type has no free-text field", () => {
  const src = read("lib/analytics.ts");
  const props = src.match(/export type EventProps = \{([^}]*)\}/s)?.[1] ?? "";
  assert.doesNotMatch(props, /intention|text/i);
});

test("lantern module never tracks, fetches, stores or logs the thought", () => {
  for (const f of [
    "app/places/pond/lantern/page.tsx",
    "app/places/pond/lantern/LanternFlow.tsx",
    "components/temple/river/sequence.ts",
    "components/temple/river/effects.ts",
    "components/temple/river/index.ts",
    "components/temple/stage/scenes/pond.ts",
  ]) {
    const src = read(f);
    assert.doesNotMatch(src, /analytics|track\(/i, f);
    assert.doesNotMatch(src, /fetch\(|sendBeacon|XMLHttpRequest|axios/, f);
    assert.doesNotMatch(src, /localStorage|sessionStorage|indexedDB|document\.cookie/, f);
    assert.doesNotMatch(src, /console\./, f);
    assert.doesNotMatch(src, /useSearchParams|router\.(push|replace)\([^)]*thought/, f);
  }
});

test("river sequence, effects and pond scene have no text input and never see the thought", () => {
  for (const f of [
    "components/temple/river/sequence.ts",
    "components/temple/river/effects.ts",
    "components/temple/stage/scenes/pond.ts",
  ]) {
    const src = read(f);
    assert.doesNotMatch(src, /thought|textarea|<input|localStorage|sessionStorage|indexedDB|fetch\(|console\./, f);
  }
  assert.doesNotMatch(read("components/temple/river/index.ts"), /thought/);
});

test("no thought value reaches the scene API", () => {
  const src = read("app/places/pond/lantern/LanternFlow.tsx");
  assert.doesNotMatch(src, /(?:pond|resetScene|applyStep)\w*\??\.?\([^)]*thought/, "scene call takes the thought");
  assert.doesNotMatch(src, /<SceneStage[^>]*thought/);
  assert.doesNotMatch(src, /\bthought\b[^;\n]*(?:pondRef|sceneHandle)|(?:pondRef|sceneHandle)[^;\n]*\bthought\b/);
});

test("the paper panel unmounts the textarea on fold, so the sheet that is folded is blank", () => {
  const src = read("app/places/pond/lantern/LanternFlow.tsx");
  assert.match(src, /step === "writing" \? \(\s*<>[\s\S]*data-testid="lantern-thought"[\s\S]*\) : \(\s*<div className=\{styles\.sheet\}/);
  assert.match(src, /thoughtRef\.current\.value = "";\s*setThought\(""\);\s*setStep\(startRelease\("writing"\)\)/);
});

test("lantern flow clears the thought on fold and keeps it out of URLs", () => {
  const src = read("app/places/pond/lantern/LanternFlow.tsx");
  assert.match(src, /setThought\(""\);\s*setStep\(startRelease\("writing"\)\)/);
  assert.doesNotMatch(src, /href=\{[^}]*thought|useEffect\([^)]*thought/);
});
