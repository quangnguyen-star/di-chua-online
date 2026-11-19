import assert from "node:assert/strict";
import test from "node:test";
import { contrastRatio, eveningPairs } from "./contrast.ts";

for (const [name, fg, bg] of eveningPairs) {
  test(`evening: ${name} keeps at least 4.5:1`, () => {
    assert.ok(contrastRatio(fg, bg) >= 4.5, `${name} is ${contrastRatio(fg, bg).toFixed(2)}:1`);
  });
}
