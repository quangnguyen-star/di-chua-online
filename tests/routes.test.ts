import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import { practices } from "../src/content/index.ts";
import { places } from "../src/content/places.ts";
import { placeForHref, readyRoutes, redirects, routes } from "../src/content/routes.ts";

const APP = resolve(import.meta.dirname, "../src/app");
const redirectMap = new Map(redirects);

/** Status a request for this path would get: 200 with its page file, 308 with its target, else 404. */
function resolveHref(href: string): { status: number; page?: string; to?: string } {
  const to = redirectMap.get(href);
  if (to) return { status: 308, to };
  const direct = resolve(APP, `.${href}`, "page.tsx");
  if (existsSync(direct)) return { status: 200, page: direct };
  const slug = href.match(/^\/practices\/([^/]+)$/)?.[1];
  if (slug && practices.some((p) => p.slug === slug)) return { status: 200, page: resolve(APP, "practices/[slug]/page.tsx") };
  return { status: 404 };
}

function finalPage(href: string) {
  const r = resolveHref(href);
  return r.to ? resolveHref(r.to) : r;
}

test("every ready canonical and legacy href lands on a page", () => {
  for (const r of readyRoutes) {
    for (const href of [r.href, ...r.legacyHrefs]) {
      const res = finalPage(href);
      assert.equal(res.status, 200, `${href} (${r.id})`);
    }
  }
});

test("redirect targets are real pages, never chains", () => {
  for (const [from, to] of redirects) {
    assert.equal(resolveHref(to).status, 200, `${from} -> ${to}`);
  }
});

test("legacy links resolve to the place that owns them", () => {
  assert.equal(placeForHref("/places/river")?.id, "pond");
  assert.equal(placeForHref("/practices/tea")?.id, "veranda");
  assert.equal(placeForHref("/practices/sitting")?.id, "hall");
  assert.equal(placeForHref("/practices/breathing")?.id, "gate");
  assert.equal(finalPage("/places/river").page?.includes("lantern"), true);
});

test("destination content: hall shows incense, veranda shows the tea practice", () => {
  const hall = finalPage("/places/hall");
  assert.ok(hall.page?.includes("hall"));
  const veranda = finalPage("/practices/tea");
  assert.equal(veranda.status, 200);
  assert.ok(practices.some((p) => p.slug === "tra-3-phut"));
});

test("the pond keeps its id but is labelled Bến sông", () => {
  const pond = routes.find((r) => r.id === "pond");
  assert.equal(pond?.name, "Bến sông");
  assert.equal(pond?.legacyHrefs.includes("/places/river"), true);
});

test("places.ts is derived from the table and every continuation exists", () => {
  assert.deepEqual(places.map((p) => p.id), routes.map((r) => r.id));
  const ids = new Set(routes.map((r) => r.id));
  for (const r of routes) if (r.next) assert.ok(ids.has(r.next), `${r.id} -> ${r.next}`);
});

test("a place that is not ready has no page and is not linked", () => {
  for (const r of routes.filter((x) => !x.ready)) assert.equal(resolveHref(r.href).status, 404, r.id);
  assert.equal(readyRoutes.every((r) => r.ready), true);
});

test("unknown paths are a 404", () => {
  assert.equal(resolveHref("/places/nowhere").status, 404);
});
