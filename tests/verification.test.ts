import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { SCENES } from "../src/components/temple/stage/scenes/registry.ts";
import type { PlaceId } from "../src/content/routes.ts";

/*
 * Static stand-ins for the DCO-70 checks. No browser or WebGL exists here, so SceneHandle.layers() cannot be called on
 * a live scene; the declared layer lists and the ctx.layer/ctx.depthLayer call sites are read instead. Lighting only
 * changes palettes, never which layers are drawn, so day and night share one answer (asserted below).
 */
const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const places = Object.keys(SCENES) as PlaceId[];
const RIVER = /lantern|water|lily|mote/;

test("six places are registered", () => {
  assert.deepEqual([...places].sort(), ["courtyard", "gate", "hall", "outside", "pond", "veranda"]);
});

test("no non-pond scene declares a lantern, water, lily or mote layer", () => {
  for (const place of places.filter((p) => p !== "pond")) {
    for (const layer of SCENES[place].layers) assert.doesNotMatch(layer, RIVER, `${place} declares ${layer}`);
  }
});

test("no non-pond scene file draws a river layer or reaches into the pond or lantern code", () => {
  for (const place of places.filter((p) => p !== "pond")) {
    const src = read(`src/components/temple/stage/scenes/${place}.ts`);
    for (const m of src.matchAll(/\.(?:layer|depthLayer)\(\s*"([^"]+)"/g)) assert.doesNotMatch(m[1], RIVER, `${place} draws ${m[1]}`);
    assert.doesNotMatch(src, /from "\.\/pond|lantern\/|waterFilter|lanternCount/, `${place} imports river code`);
  }
  const backdrop = read("src/components/temple/stage/scenes/backdrop.ts");
  for (const m of backdrop.matchAll(/\.(?:layer|depthLayer)\(\s*"([^"]+)"/g)) assert.doesNotMatch(m[1], RIVER, `backdrop draws ${m[1]}`);
});

test("the layer set does not depend on the lighting (day and night draw the same layers)", () => {
  const scene = read("src/components/temple/stage/scene.ts");
  assert.doesNotMatch(scene, /lighting[^\n]*\.(?:layer|depthLayer)\(|\.(?:layer|depthLayer)\([^\n]*lighting/);
  for (const place of places.filter((p) => p !== "pond")) {
    const src = read(`src/components/temple/stage/scenes/${place}.ts`);
    assert.doesNotMatch(src, /if \([^)]*lighting[^)]*\)\s*ctx\.(?:layer|depthLayer)/, `${place} adds a layer by lighting`);
  }
});

test("the pond is the only scene with the river layers", () => {
  const pond = SCENES.pond.layers.join(" ");
  for (const word of ["water", "lanterns", "motes"]) assert.match(pond, new RegExp(word));
});

test("the home hero and the gate stop import the same TamQuanStill", () => {
  const importsStill = (src: string) => /import \{[^}]*\bTamQuanStill\b[^}]*\} from "(?:\.\.\/art|@\/components\/temple\/art)"/.test(src);
  assert.ok(importsStill(read("src/components/home/HomeView.tsx")), "HomeView");
  assert.ok(importsStill(read("src/components/temple/scenes/Gate.tsx")), "Gate");
  const index = read("src/components/temple/art/index.ts");
  assert.match(index, /TamQuanStill/);
  const gateTags = [...read("src/components/temple/scenes/Gate.tsx").matchAll(/<TamQuanStill\b/g)].length;
  const homeTags = [...read("src/components/home/HomeView.tsx").matchAll(/<TamQuanStill\b/g)].length;
  assert.equal(gateTags, 1);
  assert.equal(homeTags, 1);
});

test("every stop's activity renders through StageZones", () => {
  const files = [
    "src/components/temple/scenes/Gate.tsx",
    "src/app/places/courtyard/sweeping/Sweeping.tsx",
    "src/app/places/hall/IncenseHall.tsx",
    "src/app/places/pond/lantern/LanternFlow.tsx",
    "src/app/practices/[slug]/TeaPreparation.tsx",
    "src/app/places/word/WordBooth.tsx",
  ];
  for (const f of files) assert.match(read(f), /<StageZones\b/, f);
});
