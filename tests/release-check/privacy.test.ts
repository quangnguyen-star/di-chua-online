import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (p: string) => readFileSync(new URL(`../../src/${p}`, import.meta.url), "utf8");

const VISIT_FILES = [
  "components/visit/VisitFlow.tsx",
  "components/visit/VisitScene.tsx",
  "components/visit/VisitErrorBoundary.tsx",
  "app/visit/page.tsx",
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
    "components/temple/river/RiverScene.tsx",
    "components/temple/river/index.ts",
  ]) {
    const src = read(f);
    assert.doesNotMatch(src, /analytics|track\(/i, f);
    assert.doesNotMatch(src, /fetch\(|sendBeacon|XMLHttpRequest|axios/, f);
    assert.doesNotMatch(src, /localStorage|sessionStorage|indexedDB|document\.cookie/, f);
    assert.doesNotMatch(src, /console\./, f);
    assert.doesNotMatch(src, /useSearchParams|router\.(push|replace)\([^)]*thought/, f);
  }
});

test("river renderer has no renderer dependency, network, storage or text input", () => {
  const src = read("components/temple/river/RiverScene.tsx");
  assert.doesNotMatch(src, /pixi|import\(|from "(?!@\/components\/temple\/art|\.\/river\.module\.css|react)/, "river imports");
  assert.doesNotMatch(src, /thought|textarea|useState|localStorage|sessionStorage|fetch\(|console\./);
});

test("lantern flow clears the thought on fold and keeps it out of URLs", () => {
  const src = read("app/places/pond/lantern/LanternFlow.tsx");
  assert.match(src, /setThought\(""\);\s*setPhase\("releasing"\)/);
  assert.doesNotMatch(src, /href=\{[^}]*thought|useEffect\([^)]*thought/);
});
