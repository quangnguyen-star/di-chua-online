import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { initialState, visitReducer } from "../../src/lib/visitMachine.ts";

const read = (p: string) => readFileSync(new URL(`../../src/${p}`, import.meta.url), "utf8");

const toIntention = () => {
  let s = visitReducer(initialState, { type: "next", now: 0 });
  s = visitReducer(s, { type: "skip", now: 0 });
  return visitReducer(s, { type: "setIntention", text: "private wish" });
};

test("intention is cleared on confirmed end, clear and reaching close", () => {
  const s = toIntention();
  assert.equal(s.intention, "private wish");
  assert.equal(visitReducer(s, { type: "confirmEnd" }).intention, "");
  assert.equal(visitReducer(s, { type: "clear" }).intention, "");
  const closed = visitReducer(visitReducer(s, { type: "next", now: 0 }), { type: "skip", now: 0 });
  const end = visitReducer(visitReducer(closed, { type: "skip", now: 0 }), { type: "next", now: 0 });
  assert.equal(end.intention, "");
});

test("visit components never send, store or log the intention", () => {
  for (const f of ["components/visit/VisitFlow.tsx", "components/visit/VisitErrorBoundary.tsx"]) {
    const src = read(f);
    assert.doesNotMatch(src, /console\.|localStorage|sessionStorage|indexedDB|document\.cookie/, f);
    assert.doesNotMatch(src, /componentDidCatch/, f);
  }
  const flow = read("components/visit/VisitFlow.tsx");
  const trackCalls = flow.match(/track\([^;]*\);/gs) ?? [];
  assert.ok(trackCalls.length > 0);
  for (const c of trackCalls) assert.doesNotMatch(c, /intention/i);
  assert.doesNotMatch(flow, /autoPlay/);
});

test("analytics payload type has no free-text field", () => {
  const src = read("lib/analytics.ts");
  const props = src.match(/export type EventProps = \{([^}]*)\}/s)?.[1] ?? "";
  assert.doesNotMatch(props, /intention|text/i);
});
