import assert from "node:assert/strict";
import test from "node:test";
import { redirects, routes, placeForHref } from "../src/content/routes.ts";
import { visitStages } from "../src/content/index.ts";

const stopOf = (to: string) => new URL(to, "http://localhost").searchParams.get("stop");

test("every place href is its stop URL", () => {
  for (const r of routes) assert.equal(r.href, `/visit?stop=${r.id}`);
});

test("every historic URL still redirects (standalone /places/* pages are not redirected) to a stop that has content", () => {
  const expected: Record<string, string> = {
    "/practices": "/visit",
    "/practices/breathing": "gate",
    "/practices/tho-2-phut": "gate",
    "/places/gate": "gate",
    "/places/courtyard": "courtyard",
    "/practices/sitting": "hall",
    "/practices/ngoi-yen-5-phut": "hall",
    "/places/pond": "pond",
    "/places/river": "pond",
    "/practices/tea": "veranda",
    "/practices/tra-3-phut": "veranda",
  };
  const table = new Map(redirects);
  for (const [from, want] of Object.entries(expected)) {
    const to = table.get(from);
    assert.ok(to, `${from} has a redirect`);
    if (want === "/visit") {
      assert.equal(to, "/visit");
      continue;
    }
    assert.equal(stopOf(to), want, from);
    const stage = visitStages.find((s) => s.id === stopOf(to));
    assert.ok(stage && stage.label && stage.prompt, `${from} lands on a stop with content`);
    assert.equal(placeForHref(from)?.id, want);
  }
});

test("standalone place pages are not redirect sources", () => {
  const sources = new Set(redirects.map(([from]) => from));
  for (const p of ["/places/hall", "/places/hall/incense", "/places/courtyard/sweeping", "/places/pond/lantern", "/places/veranda", "/places/word"]) {
    assert.ok(!sources.has(p), p);
  }
});

test("redirect sources are unique and none is the destination", () => {
  const sources = redirects.map(([from]) => from);
  assert.equal(new Set(sources).size, sources.length);
  assert.ok(!sources.includes("/visit"));
});
