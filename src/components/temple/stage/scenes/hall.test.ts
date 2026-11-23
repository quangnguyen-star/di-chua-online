import assert from "node:assert/strict";
import test from "node:test";
import { SCENES } from "./registry.ts";

const RIVER_ONLY = /lantern|water|lily|mote|bank|hill/;

test("the hall names its statue, columns, lamps and altar layers", () => {
  const layers = SCENES.hall.layers;
  for (const name of ["columns", "halo", "statue", "hanging-lamps", "altar", "oil-lamp", "incense-bowl", "incense-stick"]) {
    assert.ok(layers.includes(name), `hall lists ${name}`);
  }
  assert.ok(layers.indexOf("statue") > layers.indexOf("halo"), "statue draws over its halo");
});

test("the hall draws no river layers", () => {
  for (const layer of SCENES.hall.layers) assert.doesNotMatch(layer, RIVER_ONLY, layer);
});
