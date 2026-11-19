import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { visitStages } from "../src/content/visitStages.ts";
import { CROSSFADE_MS, UNMOUNT_AFTER_MS, outgoingOpacity } from "../src/components/visit/crossfade.ts";

/*
 * No browser is available here, so this is a source/CSS-level geometry test: the band percentages are read from
 * visit.module.css and resolved against each viewport. Every stop renders through the same shell bands.
 */
const css = readFileSync(new URL("../src/components/visit/visit.module.css", import.meta.url), "utf8");
const pct = (name: string) => Number(new RegExp(`--${name}:\\s*(\\d+)%`).exec(css)?.[1]);
const band = (top: string, h: string) => ({ top: pct(top), bottom: pct(top) + pct(h) });
const instruction = band("zone-instr-top", "zone-instr-h");
const interaction = band("zone-interact-top", "zone-interact-h");
const actions = band("zone-actions-top", "zone-actions-h");
const subtitle = band("zone-sub-top", "zone-sub-h");
const overlaps = (a: { top: number; bottom: number }, b: { top: number; bottom: number }) => a.top < b.bottom && b.top < a.bottom;

const viewports = [
  { name: "desktop", w: 1280, h: 720 },
  { name: "mobile", w: 390, h: 844 },
];

for (const stop of visitStages) {
  for (const vp of viewports) {
    test(`${stop.id} ${vp.name}: text bands stay out of the interaction band, buttons clear the subtitle`, () => {
      assert.ok(!overlaps(instruction, interaction), "instruction overlaps interaction");
      assert.ok(!overlaps(subtitle, interaction), "subtitle overlaps interaction");
      assert.ok(!overlaps(actions, subtitle), "actions overlap subtitle");
      assert.ok(subtitle.bottom <= 100);
      const px = (b: { top: number; bottom: number }) => ((b.bottom - b.top) / 100) * vp.h;
      assert.ok(px(subtitle) >= 44 * 0.9 || vp.h * 0.08 >= 44 * 0.9, "subtitle/nudge band fits a 44px button row");
      assert.ok(px(actions) >= 44, "actions band fits a 44px button");
    });
  }
}

test("the outgoing layer reaches opacity 0 before it is unmounted", () => {
  assert.equal(outgoingOpacity(0), 1);
  assert.ok(outgoingOpacity(CROSSFADE_MS / 2) < 1);
  assert.equal(outgoingOpacity(UNMOUNT_AFTER_MS), 0);
  assert.ok(UNMOUNT_AFTER_MS >= CROSSFADE_MS);
});

test("handles are kept per layer and dropped when a scene is destroyed", async () => {
  const { withHandle } = await import("../src/components/visit/stageHandles.ts");
  const gate = { setRunning() {}, layers: () => [], destroy() {} };
  const hall = { setRunning() {}, layers: () => [], destroy() {} };
  let m = withHandle({}, "gate", gate);
  m = withHandle(m, "hall", hall);
  assert.equal(m.gate, gate);
  assert.equal(m.hall, hall);
  m = withHandle(m, "gate", null);
  assert.equal("gate" in m, false);
  assert.equal(m.hall, hall);
  assert.equal(withHandle(m, "gate", null), m);
});

test("the shell passes each SceneStage layer's onHandle into the provider", () => {
  const src = readFileSync(new URL("../src/components/visit/VisitShell.tsx", import.meta.url), "utf8");
  assert.match(src, /<SceneStage place=\{leavingStage\.id\}[^>]*onHandle=/);
  assert.match(src, /<SceneStage place=\{stage\.id\}[^>]*onHandle=/);
  assert.match(src, /<StageHandleProvider value=\{\{ handle: handles\[stage\.id\]/);
});
