import { WORLD_W } from "../art.ts";
import { addHangingLamps, MOTIF_LAYERS } from "./common.ts";
import { BACKDROP_LAYERS, buildBackdrop } from "./backdrop.ts";
import {
  COLUMN_H,
  bakeAltar, bakeColumn, bakeHalo, bakeIncenseBowl, bakeLitStick, bakeOilLamp, bakeStatue,
} from "./hall.art.ts";
import type { BackdropSpec, PlaceScene } from "./types.ts";

const spec: BackdropSpec = { horizon: 260, groundTop: "#2a1810", groundBottom: "#0a0605", edge: "#e2b65a" };

const CENTER_X = WORLD_W / 2;
const ALTAR_TOP = 412;
const COLUMN_XS = [114, 801] as const;
const LAMP_XS = [249, 710] as const;

/**
 * The hall, matching art/stops/hall.jpg at 1.5x: a gilded statue with halo on a red lotus base between two red columns,
 * two hanging lanterns, and an altar with an oil lamp, an incense bowl and one lit stick. The statue layer is the only figure:
 * removing it (and its name here) drops the figure and nothing else.
 */
export const hallScene: PlaceScene = {
  horizon: spec.horizon,
  layers: [
    ...BACKDROP_LAYERS, "columns", "halo", "statue", MOTIF_LAYERS.hangingLamps, "altar", "altarGlow", "oil-lamp", "incense-bowl", "incense-stick",
  ],
  backdrop: spec,
  build: (ctx) => {
    const { pixi } = ctx;
    const instance = buildBackdrop(ctx, spec);
    const place = (name: string, canvas: HTMLCanvasElement, x: number, y: number, ax = 0.5, ay = 0) => {
      const s = new pixi.Sprite(ctx.tex(canvas));
      s.anchor.set(ax, ay);
      s.position.set(x, y);
      ctx.layer(name, s);
    };

    const columns = new pixi.Container();
    const columnTex = ctx.tex(bakeColumn());
    for (const x of COLUMN_XS) {
      const s = new pixi.Sprite(columnTex);
      s.position.set(x, 540 - COLUMN_H);
      columns.addChild(s);
    }
    ctx.layer("columns", columns);

    place("halo", bakeHalo(), CENTER_X, 172, 0.5, 0.5);
    place("statue", bakeStatue(), CENTER_X, 40);
    addHangingLamps(ctx, 28, LAMP_XS);
    place("altar", bakeAltar(), CENTER_X, ALTAR_TOP);

    const glow = new pixi.Graphics().ellipse(CENTER_X, ALTAR_TOP + 40, 420, 90).fill({ color: 0xffb64a, alpha: 0.12 });
    ctx.layer("altarGlow", glow);

    place("oil-lamp", bakeOilLamp(), 260, 420, 0.5, 1);
    place("incense-bowl", bakeIncenseBowl(), CENTER_X, 457);
    place("incense-stick", bakeLitStick(), 487, 465, 0.5, 1);
    return instance;
  },
};
