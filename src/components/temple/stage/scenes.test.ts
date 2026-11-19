import assert from "node:assert/strict";
import test from "node:test";
import type { PlaceId } from "../../../content/routes.ts";
import { HORIZON, SCENES } from "./scenes/registry.ts";

const places = Object.keys(SCENES) as PlaceId[];
const RIVER_ONLY = /lantern|water|lily|mote|bank|hill/;

test("every place has a scene and its own horizon", () => {
  assert.deepEqual([...places].sort(), ["courtyard", "gate", "hall", "outside", "pond", "veranda"]);
  const horizons = places.map((p) => HORIZON[p]);
  assert.equal(new Set(horizons).size, places.length);
  for (const p of places) assert.equal(SCENES[p].horizon, HORIZON[p]);
});

test("only the pond draws river layers", () => {
  for (const p of places.filter((id) => id !== "pond")) {
    for (const layer of SCENES[p].layers) assert.doesNotMatch(layer, RIVER_ONLY, `${p} lists ${layer}`);
    assert.ok(SCENES[p].backdrop, `${p} has a backdrop`);
  }
  const pond = SCENES.pond.layers.join(" ");
  for (const word of ["lanterns", "water", "motes", "bank-and-gate", "far-hills"]) assert.match(pond, new RegExp(word));
});

test("each backdrop declares sky and ground", () => {
  for (const p of places.filter((id) => id !== "pond")) {
    const layers = SCENES[p].layers;
    assert.ok(layers.includes("sky") && layers.includes("ground"), p);
  }
});
