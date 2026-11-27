import { bakeGoldRidge, WORLD_W } from "../art.ts";
import { addGoldenMoon, addSkyline, addUmbrellaTrees } from "./common.ts";
import { BACKDROP_LAYERS, buildBackdrop } from "./backdrop.ts";
import { bakePathLampGlow, bakeRock, bakeStairway, STAIR_BOTTOM_Y, STAIR_TOP_Y, stairHalfWidth } from "./outside.art.ts";
import type { BackdropSpec, PlaceScene, SceneContext, SceneInstance } from "./types.ts";

const HORIZON = 320;

const spec: BackdropSpec = { horizon: HORIZON, groundTop: "#33201a", groundBottom: "#120a07", edge: "#a8663a" };

/** Named layers of the outside scene, bottom to top. The backdrop's own orb is left out: the golden moon replaces it. */
export const outsideLayers = [
  ...BACKDROP_LAYERS.filter((n) => n !== "orb"),
  "moon", "mountains", "skyline", "rocks", "umbrella-trees", "stairway", "path-lamps",
] as const;

const ROCKS: readonly (readonly [number, number, number, string, number])[] = [
  [285, 392, 66, "#c9754c", 0.5],
  [675, 392, 70, "#c9754c", 0.5],
  [45, 470, 150, "#8a5a42", 0.5],
  [915, 470, 160, "#8a5a42", 0.5],
  [95, 540, 80, "#7a4f3a", 0.5],
  [875, 540, 90, "#7a4f3a", 0.5],
  [130, 520, 90, "#6b4634", 0.4],
  [850, 520, 90, "#6b4634", 0.6],
];

/** The way out: a stone stairway climbing to a lit city under a large moon, flanked by trees, rocks and path lamps. */
function buildOutside(ctx: SceneContext): SceneInstance {
  const { pixi } = ctx;
  const instance = buildBackdrop({ ...ctx, depthLayer: (name, node, depth, baseX) => { if (name !== "orb") ctx.depthLayer(name, node, depth, baseX); } }, spec);
  const cx = WORLD_W / 2;

  addGoldenMoon(ctx, 230, 90);

  const mountains = new pixi.Container();
  mountains.addChild(new pixi.Sprite(ctx.tex(bakeGoldRidge("#7a3a24", HORIZON - 100, 70, 7, HORIZON))));
  ctx.depthLayer("mountains", mountains, 0.15, -40);

  addSkyline(ctx, HORIZON + 4, 110, 23);

  const rocks = new pixi.Container();
  for (const [x, groundY, h, tone, peak] of ROCKS) {
    const s = new pixi.Sprite(ctx.tex(bakeRock(Math.round(h * 0.8), h, tone, peak)));
    s.anchor.set(0.5, 1);
    s.position.set(x, groundY);
    rocks.addChild(s);
  }
  ctx.depthLayer("rocks", rocks, 0.3);

  addUmbrellaTrees(ctx, 455, [160, 800]);

  ctx.layer("stairway", new pixi.Sprite(ctx.tex(bakeStairway())));

  const lamps = new pixi.Container();
  const glow = ctx.tex(bakePathLampGlow());
  const lampCount = ctx.options.quality === "low" ? 3 : 6;
  for (let i = 0; i < lampCount; i++) {
    const y = STAIR_TOP_Y + 8 + ((STAIR_BOTTOM_Y - STAIR_TOP_Y - 16) * i) / (lampCount - 1);
    for (const side of [-1, 1]) {
      const s = new pixi.Sprite(glow);
      s.anchor.set(0.5);
      s.position.set(cx + side * (stairHalfWidth(y) + 10), y - 4);
      s.scale.set(0.5 + i * 0.12);
      s.blendMode = "add";
      lamps.addChild(s);
    }
  }
  ctx.layer("path-lamps", lamps);

  return instance;
}

export const outsideScene: PlaceScene = {
  horizon: spec.horizon,
  layers: outsideLayers,
  backdrop: spec,
  build: buildOutside,
};
