import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const SRC = resolve(import.meta.dirname, "../src/components");
const read = (rel: string) => readFileSync(resolve(SRC, rel), "utf8");

const still = read("temple/art/TamQuanStill.tsx");
const mapSrc = read("temple/map/TempleMap.tsx");

function spots() {
  const block = mapSrc.match(/const spots[^{]*\{([\s\S]*?)\n\};/);
  assert.ok(block, "spots table found");
  return [...block[1].matchAll(/(\w+):\s*\{\s*left:\s*([\d.]+),\s*top:\s*([\d.]+)/g)].map((m) => ({
    id: m[1],
    left: Number(m[2]),
    top: Number(m[3]),
  }));
}

test("the home map is a separate schematic: it holds no gate art, so no label can sit on the gate", () => {
  assert.doesNotMatch(mapSrc, /TamQuanStill/);
  const home = read("home/HomeView.tsx");
  assert.match(home, /<TamQuanStill\b[^>]*testId="home-gate-art"/);
  assert.match(home, /styles\.gate/);
});

test("the six map spots sit at the design positions (gate marker just below the drawn gate)", () => {
  const all = Object.fromEntries(spots().map((s) => [s.id, s]));
  assert.equal(Object.keys(all).length, 6);
  assert.equal(all.gate.left, 46.875);
  assert.equal(all.gate.top, 85);
  assert.equal(all.outside.left, 60);
  assert.ok(Math.abs(all.outside.top - 86.3) < 0.05);
  assert.match(mapSrc, /\/visit\/\?stop=\$\{p\.id\}/);
});

test("TamQuanStill draws no glow circle", () => {
  assert.doesNotMatch(still, /<circle/);
  assert.doesNotMatch(still, /styles\.glow/);
});

test("no pillar starts above the roof baseline of its passage", () => {
  const roofs = [...still.matchAll(/<Roof\s+cx=\{(\d+)\}\s+y=\{(\d+)\}\s+half=\{(\d+)\}/g)].map((m) => ({
    cx: Number(m[1]),
    baseline: Number(m[2]) + 8,
    half: Number(m[3]),
  }));
  assert.equal(roofs.length, 4);
  const pillars = [...still.matchAll(/className=\{styles\.pillar\}\s+x="(\d+)"\s+y="(\d+)"\s+width="(\d+)"/g)].map((m) => ({
    x: Number(m[1]),
    y: Number(m[2]),
    w: Number(m[3]),
  }));
  assert.equal(pillars.length, 6);
  for (const p of pillars) {
    const covering = roofs.filter((r) => p.x >= r.cx - r.half && p.x + p.w <= r.cx + r.half);
    assert.ok(covering.length > 0, `pillar at x=${p.x} sits under a roof`);
    const lowest = Math.max(...covering.map((r) => r.baseline));
    assert.ok(p.y >= lowest, `pillar at x=${p.x} starts at y=${p.y}, above roof baseline ${lowest}`);
  }
});

test("the gate has a Tam Quan plaque and decorative couplets", () => {
  assert.match(still, /styles\.plaque\b/);
  assert.match(still, />Tam Quan</);
  assert.match(still, /<g aria-hidden="true">/);
});

test("ErrorState renders TamQuanStill decoratively with an empty label", () => {
  const err = read("shell/ErrorState.tsx");
  assert.match(err, /<TamQuanStill label=""/);
  const canvas = read("temple/art/layers.tsx");
  assert.match(canvas, /role=\{label \? "img" : undefined\}/);
  assert.match(canvas, /aria-hidden=\{label \? undefined : true\}/);
});
