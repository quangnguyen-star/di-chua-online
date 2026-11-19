import { WORLD_W } from "../art.ts";
import { BACKDROP_LAYERS, buildBackdrop } from "./backdrop.ts";
import type { BackdropSpec, PlaceScene } from "./types.ts";

const spec: BackdropSpec = { horizon: 260, groundTop: "#2a1810", groundBottom: "#0a0605", edge: "#e2b65a" };

/** The hall: the shared backdrop plus a warm altar glow low in the room, where the lamp and bowl sit. */
export const hallScene: PlaceScene = {
  horizon: spec.horizon,
  layers: [...BACKDROP_LAYERS, "altarGlow"],
  backdrop: spec,
  build: (ctx) => {
    const instance = buildBackdrop(ctx, spec);
    const glow = new ctx.pixi.Graphics().ellipse(WORLD_W / 2, spec.horizon + 120, 420, 90).fill({ color: 0xffb64a, alpha: 0.12 });
    ctx.layer("altarGlow", glow);
    return instance;
  },
};
