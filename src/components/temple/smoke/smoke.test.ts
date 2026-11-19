import assert from "node:assert/strict";
import test from "node:test";
import { drawSmoke, type SmokeContext } from "./draw.ts";
import { MAX_SEGMENTS, wispPoints } from "./wisp.ts";

function fakeContext() {
  const calls: string[] = [];
  const ctx = {
    globalAlpha: 1,
    strokeStyle: "",
    lineWidth: 1,
    lineCap: "butt",
    beginPath: () => calls.push("beginPath"),
    moveTo: () => calls.push("moveTo"),
    lineTo: () => calls.push("lineTo"),
    stroke: () => calls.push("stroke"),
    clearRect: () => calls.push("clearRect"),
    save: () => calls.push("save"),
    restore: () => calls.push("restore"),
    translate: () => calls.push("translate"),
  } as SmokeContext;
  return { ctx, calls };
}

test("an unlit smoke draws nothing", () => {
  assert.deepEqual(wispPoints({ lit: false, intensity: 1, wind: 0, time: 0, height: 100 }), []);
  const { ctx, calls } = fakeContext();
  assert.equal(drawSmoke(ctx, 64, 120, { lit: false, intensity: 1, wind: 0, time: 0 }), 0);
  assert.ok(!calls.includes("stroke"));
});

test("segment count is capped however high the intensity", () => {
  for (const intensity of [0, 0.5, 1, 5, 1000]) {
    const points = wispPoints({ lit: true, intensity, wind: 0, time: 1, height: 100 });
    assert.ok(points.length - 1 <= MAX_SEGMENTS, `intensity ${intensity}`);
  }
  const { ctx, calls } = fakeContext();
  const drawn = drawSmoke(ctx, 64, 120, { lit: true, intensity: 1000, wind: 0, time: 0 });
  assert.ok(drawn > 0 && drawn <= MAX_SEGMENTS);
  assert.equal(calls.filter((c) => c === "stroke").length, drawn);
});
