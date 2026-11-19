import assert from "node:assert/strict";
import test from "node:test";
import { LANTERN_COLORS, lanternBake } from "./bake.ts";

test("each lantern color bakes to a distinct look", () => {
  const petals = new Set(LANTERN_COLORS.map((c) => lanternBake(c).petal));
  const glows = new Set(LANTERN_COLORS.map((c) => lanternBake(c).glow));
  assert.equal(petals.size, LANTERN_COLORS.length);
  assert.equal(glows.size, LANTERN_COLORS.length);
});

test("prominent differs only in brightness and size", () => {
  for (const color of LANTERN_COLORS) {
    const plain = lanternBake(color);
    const big = lanternBake(color, true);
    assert.ok(big.brightness > plain.brightness);
    assert.ok(big.width > plain.width && big.height > plain.height);
    const { brightness: _b, width: _w, height: _h, prominent: _p, ...restBig } = big;
    const { brightness: _b2, width: _w2, height: _h2, prominent: _p2, ...restPlain } = plain;
    assert.deepEqual(restBig, restPlain);
  }
});
