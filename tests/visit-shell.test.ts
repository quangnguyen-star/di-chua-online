import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { visitStages } from "../src/content/visitStages.ts";
import { resolveStart } from "../src/lib/visit/deepLink.ts";
import { initialState, reduce, NUDGE_SHOWN_MS, type Action, type VisitState } from "../src/lib/visit/reducer.ts";

const run = (state: VisitState, ...actions: Action[]) => actions.reduce((s, a) => reduce(visitStages, s, a), state);
const tick = (dt: number): Action => ({ type: "tick", dt });
const gateMs = visitStages[0].seconds * 1000;

test("a tick sets due once and never advances the stage", () => {
  let s = run(initialState, tick(gateMs - 1));
  assert.equal(s.due, false);
  assert.equal(s.nudge, "idle");
  s = run(s, tick(1));
  assert.equal(s.due, true);
  assert.equal(s.nudge, "shown");
  s = run(s, tick(60 * 60 * 1000));
  assert.equal(s.stageIndex, 0);
  assert.equal(s.phase, "running");
});

test("the nudge shrinks once and is never shown again for the stop", () => {
  let s = run(initialState, tick(gateMs), tick(NUDGE_SHOWN_MS));
  assert.equal(s.nudge, "faded");
  s = run(s, tick(1000), { type: "stay" });
  assert.equal(s.nudge, "done");
  s = run(s, tick(1000), { type: "stay" });
  assert.equal(s.nudge, "done");
  const stayed = run(initialState, tick(gateMs), { type: "stay" }, tick(1000));
  assert.equal(stayed.nudge, "faded");
  assert.equal(run(initialState, tick(gateMs), { type: "next" }).nudge, "idle");
});

test("pause and hidden freeze activeMs until resume", () => {
  for (const freeze of [{ type: "pause" }, { type: "hidden" }] as const) {
    let s = run(initialState, tick(1000), freeze);
    assert.equal(s.phase, "paused");
    s = run(s, tick(gateMs * 2));
    assert.equal(s.activeMs, 1000);
    assert.equal(s.due, false);
    s = run(s, { type: "resume" }, tick(500));
    assert.equal(s.activeMs, 1500);
  }
});

test("next and prev change stops with a fresh clock; next on the last stop completes", () => {
  let s = run(initialState, tick(5000), { type: "next" });
  assert.deepEqual(s, { phase: "running", stageIndex: 1, activeMs: 0, due: false, nudge: "idle" });
  s = run(s, { type: "prev" });
  assert.equal(s.stageIndex, 0);
  assert.equal(run(s, { type: "prev" }).stageIndex, 0);
  s = run(s, { type: "begin", index: visitStages.length - 1 }, { type: "next" });
  assert.equal(s.phase, "complete");
  assert.equal(run(s, tick(1000), { type: "next" }), s);
});

test("deep link: a known stop runs alone, anything else is the tour from stop 1", () => {
  assert.deepEqual(resolveStart("pond", visitStages), { single: true, index: 3 });
  for (const bad of [undefined, "", "nowhere", ["pond", "hall"], "POND"]) {
    assert.deepEqual(resolveStart(bad, visitStages), { single: false, index: 0 });
  }
});

test("the shell offers the closing and single-stop choices", () => {
  const src = readFileSync(new URL("../src/components/visit/VisitShell.tsx", import.meta.url), "utf8");
  for (const text of ["Chuyến ghé thăm đã khép lại", "Ngồi yên thêm", "Về trang chủ", "Đi tiếp cả chuyến", "Về bản đồ", "Ở lại thêm chút", "Sẵn sàng thì đi tiếp"]) {
    assert.ok(src.includes(text), text);
  }
  assert.match(src, /aria-live="polite"/);
});

test("arrows and swipe navigate whenever a stop runs; typing and the courtyard sweep keep their keys", () => {
  const src = readFileSync(new URL("../src/components/visit/VisitShell.tsx", import.meta.url), "utf8");
  assert.match(src, /canNavigate = !single && !untimed && phase === "running"/);
  assert.ok(!src.includes("atNudge"));
  assert.match(src, /!canNavigate \|\| isEditable\(e\.target\)/);
  assert.match(src, /claimsArrows/);
  const notFound = readFileSync(new URL("../src/app/not-found.tsx", import.meta.url), "utf8");
  assert.match(notFound, /href="\/" className="button" data-testid="not-found-map"/);
  const css = readFileSync(new URL("../src/components/visit/visit.module.css", import.meta.url), "utf8");
  assert.match(css, /animation-duration: 600ms !important/);
});
