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
