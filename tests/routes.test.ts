import assert from "node:assert/strict";
import test from "node:test";
import { redirects, routes, placeForHref } from "../src/content/routes.ts";
import { visitStages } from "../src/content/index.ts";

const stopOf = (to: string) => new URL(to, "http://localhost").searchParams.get("stop");

test("every place href is its stop URL", () => {
  for (const r of routes) assert.equal(r.href, `/visit?stop=${r.id}`);
});

test("every historic URL redirects to a stop that has content", () => {
  const expected: Record<string, string> = {
    "/practices": "/visit",
    "/practices/breathing": "gate",
    "/practices/tho-2-phut": "gate",
    "/places/gate": "gate",
    "/places/courtyard": "courtyard",
    "/places/courtyard/sweeping": "courtyard",
    "/places/hall": "hall",
    "/places/hall/incense": "hall",
    "/practices/sitting": "hall",
    "/practices/ngoi-yen-5-phut": "hall",
    "/places/pond": "pond",
    "/places/pond/lantern": "pond",
    "/places/river": "pond",
    "/places/veranda": "veranda",
    "/practices/tea": "veranda",
    "/practices/tra-3-phut": "veranda",
    "/places/word": "outside",
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

test("redirect sources are unique and none is the destination", () => {
  const sources = redirects.map(([from]) => from);
  assert.equal(new Set(sources).size, sources.length);
  assert.ok(!sources.includes("/visit"));
});
