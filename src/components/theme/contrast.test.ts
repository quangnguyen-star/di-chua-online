import assert from "node:assert/strict";
import test from "node:test";
import { contrastRatio, artDayPairs, artNightPairs, eveningPairs } from "./contrast.ts";

for (const [name, fg, bg] of eveningPairs) {
  test(`evening: ${name} keeps at least 4.5:1`, () => {
    assert.ok(contrastRatio(fg, bg) >= 4.5, `${name} is ${contrastRatio(fg, bg).toFixed(2)}:1`);
  });
}

for (const [mode, pairs] of [["day", artDayPairs], ["night", artNightPairs]] as const) {
  for (const [name, fg, bg] of pairs) {
    test(`${mode} art: ${name} keeps at least 4.5:1`, () => {
      assert.ok(contrastRatio(fg, bg) >= 4.5, `${name} is ${contrastRatio(fg, bg).toFixed(2)}:1`);
    });
  }
}
