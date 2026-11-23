import assert from "node:assert/strict";
import test from "node:test";
import { outsideScene } from "./outside.ts";

test("outside draws its named layers and no river layers", () => {
  const layers = outsideScene.layers.join(" ");
  for (const name of ["sky", "ground", "moon", "mountains", "skyline", "rocks", "umbrella-trees", "stairway", "path-lamps"]) {
    assert.ok(outsideScene.layers.includes(name), `missing ${name}`);
  }
  assert.doesNotMatch(layers, /lantern|water|lily|mote|bank|hill/);
});
