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
  for (const word of ["lanterns", "water", "motes", "bank-and-gate", "ridges"]) assert.match(pond, new RegExp(word));
});

test("each backdrop declares sky and ground", () => {
  for (const p of places.filter((id) => id !== "pond")) {
    const layers = SCENES[p].layers;
    assert.ok(layers.includes("sky") && layers.includes("ground"), p);
  }
});

test("the veranda names the layers of its still", () => {
  const layers = SCENES.veranda.layers;
  for (const name of ["window-frame", "moon", "ridges", "pads", "candles", "boat", "table", "teapot", "cup", "railing", "rain"]) {
    assert.ok(layers.includes(name), `veranda lists ${name}`);
  }
  assert.ok(layers.indexOf("table") < layers.indexOf("teapot") && layers.indexOf("cup") < layers.indexOf("railing"));
});

test("the pond names every layer of the still, bottom to top", () => {
  const layers: readonly string[] = SCENES.pond.layers;
  const order = ["sky", "moon", "ridges", "bank-and-gate", "umbrella-trees", "water", "lily-pads", "boat", "lanterns", "reeds"];
  const at = order.map((name) => layers.indexOf(name));
  assert.ok(at.every((i) => i >= 0), `missing a named layer: ${order.filter((_, i) => at[i] < 0).join(", ")}`);
  assert.deepEqual([...at].sort((a, b) => a - b), at);
});

test("courtyard draws its named layers and no river layers", () => {
  const layers: readonly string[] = SCENES.courtyard.layers;
  for (const name of ["hall", "hanging-lamps", "ground", "tiles", "banyans", "planters", "fallen-leaves", "broom", "sweepers", "drifting-leaves", "moon"]) {
    assert.ok(layers.includes(name), `courtyard lists ${name}`);
  }
  assert.ok(layers.indexOf("tiles") > layers.indexOf("ground"));
  for (const layer of layers) assert.doesNotMatch(layer, RIVER_ONLY, `courtyard lists ${layer}`);
});
