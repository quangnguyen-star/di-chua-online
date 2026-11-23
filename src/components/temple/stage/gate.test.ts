import assert from "node:assert/strict";
import test from "node:test";
import { palettes } from "./lighting.ts";
import { gateScene } from "./scenes/gate.ts";
import type { SceneContext } from "./scenes/types.ts";

const RIVER_ONLY = /lantern|water|lily|mote|bank|hill/;
const NAMED = ["moon", "ridges", "umbrella-trees", "tam-quan", "hanging-lamps", "stairs", "stair-lamps"];

/** A node that accepts any call or property, so scene code runs without a browser or pixi. */
function inert(): unknown {
  const fn = function () {};
  const proxy: unknown = new Proxy(fn, { get: (_t, k) => (k === Symbol.toPrimitive ? () => 0 : proxy), apply: () => proxy, construct: () => proxy as object, set: () => true });
  return proxy;
}

function fakeContext(lighting: "moon" | "golden" | "mist"): { ctx: SceneContext; names: string[] } {
  const names: string[] = [];
  const g = globalThis as { document?: unknown };
  g.document = { createElement: () => ({ width: 0, height: 0, getContext: () => inert() }) };
  const ctx = {
    pixi: inert(),
    palette: palettes[lighting],
    options: { lighting, ram: false, quality: "auto", maxDpr: 2 },
    tex: () => inert(),
    layer: (name: string) => void names.push(name),
    depthLayer: (name: string) => void names.push(name),
  } as unknown as SceneContext;
  return { ctx, names };
}

test("gate draws its named layers, in declared order, in every lighting", () => {
  for (const lighting of ["moon", "golden", "mist"] as const) {
    const { ctx, names } = fakeContext(lighting);
    gateScene.build(ctx);
    for (const n of NAMED) assert.ok(names.includes(n), `${lighting}: missing ${n}`);
    const declared = [...gateScene.layers];
    assert.deepEqual(names.filter((n) => declared.includes(n)), names, `${lighting}: undeclared layer drawn`);
    assert.deepEqual(declared.filter((n) => names.includes(n)), names, `${lighting}: order differs`);
  }
});

test("gate has no river layers", () => {
  for (const name of gateScene.layers) assert.doesNotMatch(name, RIVER_ONLY);
});
