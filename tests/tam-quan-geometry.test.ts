import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const SRC = resolve(import.meta.dirname, "../src/components");
const read = (rel: string) => readFileSync(resolve(SRC, rel), "utf8");

const still = read("temple/art/TamQuanStill.tsx");
const mapSrc = read("temple/map/TempleMap.tsx");
const mapCss = read("temple/map/map.module.css");

const VIEW = { width: 400, height: 240 };
/** Half of the 2.75rem hit target as a share of the smallest map frame (about 340px wide, 38rem wide at most). */
const HALF_HIT = 6.5;

function bounds() {
  const m = still.match(/TAM_QUAN_BOUNDS\s*=\s*\{\s*x:\s*(\d+),\s*y:\s*(\d+),\s*width:\s*(\d+),\s*height:\s*(\d+)/);
  assert.ok(m, "TAM_QUAN_BOUNDS is exported from TamQuanStill");
  const [x, y, width, height] = m.slice(1).map(Number);
  return { x, y, width, height };
}

function spots() {
  const block = mapSrc.match(/const spots[^{]*\{([\s\S]*?)\n\};/);
  assert.ok(block, "spots table found");
  return [...block[1].matchAll(/(\w+):\s*\{\s*left:\s*([\d.]+),\s*top:\s*([\d.]+)/g)].map((m) => ({
    id: m[1],
    left: Number(m[2]),
    top: Number(m[3]),
  }));
}

function rule(css: string, selector: string): string {
  const esc = selector.replace(/[.:()]/g, "\\$&");
  const m = css.match(new RegExp(`(?:^|\\n)${esc}\\s*\\{([^}]*)\\}`));
  assert.ok(m, `rule ${selector} exists`);
  return m[1];
}

test("no home-map marker or label box intersects the gate's bounding shape by default", () => {
  const b = bounds();
  const box = {
    left: (b.x / VIEW.width) * 100,
    right: ((b.x + b.width) / VIEW.width) * 100,
    top: (b.y / VIEW.height) * 100,
    bottom: ((b.y + b.height) / VIEW.height) * 100,
  };
  const all = spots();
  assert.equal(all.length, 6);
  for (const s of all) {
    const outsideX = s.left + HALF_HIT <= box.left || s.left - HALF_HIT >= box.right;
    const outsideY = s.top + HALF_HIT <= box.top || s.top - HALF_HIT >= box.bottom;
    assert.ok(outsideX || outsideY, `${s.id} hit box at ${s.left}%,${s.top}% overlaps the gate`);
  }
});

test("place labels are visually hidden until hover or focus", () => {
  const label = rule(mapCss, ".spotLabel");
  assert.match(label, /width:\s*1px/);
  assert.match(label, /height:\s*1px/);
  assert.match(label, /clip-path:\s*inset\(50%\)/);
  assert.match(mapCss, /\.spotLink:hover \.spotLabel[^{]*\.spotLink:focus-visible \.spotLabel\s*\{[^}]*clip-path:\s*none/);
  assert.match(mapSrc, /className=\{styles\.spotLabel\}/);
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
