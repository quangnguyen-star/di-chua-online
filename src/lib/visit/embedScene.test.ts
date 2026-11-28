import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), "utf8");

test("embedded tea preparation leaves the scene to the shell, standalone keeps its own", () => {
  const src = read("app/practices/[slug]/TeaPreparation.tsx");
  const [embedded, standalone] = src.split("if (embed) {")[1].split("data-testid=\"veranda-map\"")[0].split("return (\n    <div className={styles.page}");
  assert.ok(!embedded.includes("<SceneStage"));
  assert.ok(standalone.includes("<SceneStage"));
});

test("embedded gate draws no art of its own", () => {
  const src = read("components/temple/scenes/Gate.tsx");
  assert.match(src, /\{!embed && \(\s*<div className=\{styles\.art\}>/);
});

test("the lantern flow never touches the pond from an unmount cleanup, the stage is already destroyed by then", () => {
  const src = read("app/places/pond/lantern/LanternFlow.tsx");
  assert.doesNotMatch(src, /\(\) => \(\) => resetScene\(/);
  assert.doesNotMatch(src, /return \(\) => \{[^}]*resetScene\(/);
});
