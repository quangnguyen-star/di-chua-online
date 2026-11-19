import { WORLD_W } from "../art.ts";
import { BACKDROP_LAYERS, buildBackdrop } from "./backdrop.ts";
import type { BackdropSpec, PlaceScene, SceneContext, SceneInstance } from "./types.ts";

const spec: BackdropSpec = { horizon: 320, groundTop: "#2c2a1c", groundBottom: "#0e0d08", edge: "#8f8a52" };

/** Village path: a dirt track narrowing to the horizon, with a few low roofs and trees beside it. */
function buildOutside(ctx: SceneContext): SceneInstance {
  const { pixi } = ctx;
  const instance = buildBackdrop(ctx, spec);
  const h = spec.horizon;
  const cx = WORLD_W / 2;

  const path = new pixi.Graphics()
    .poly([cx - 14, h, cx + 14, h, cx + 190, 540, cx - 190, 540])
    .fill({ color: 0xd2b482, alpha: 0.22 });
  ctx.layer("path", path);

  const huts = new pixi.Graphics();
  const hut = (x: number, w: number, hh: number) => {
    huts.rect(x, h - hh, w, hh).fill({ color: 0x1a1710, alpha: 0.85 });
    huts.poly([x - 6, h - hh, x + w / 2, h - hh - hh * 0.7, x + w + 6, h - hh]).fill({ color: 0x241f14, alpha: 0.9 });
  };
  hut(150, 54, 30);
  hut(250, 40, 24);
  hut(620, 60, 34);
  hut(730, 44, 26);
  for (const x of [90, 330, 560, 840]) huts.circle(x, h - 34, 20).fill({ color: 0x1d2414, alpha: 0.8 });
  ctx.depthLayer("huts", huts, 0.3);

  return instance;
}

export const outsideScene: PlaceScene = {
  horizon: spec.horizon,
  layers: [...BACKDROP_LAYERS, "path", "huts"],
  backdrop: spec,
  build: buildOutside,
};
