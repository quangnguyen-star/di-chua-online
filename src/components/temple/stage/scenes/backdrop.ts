import { bakeCrackle, bakeGround, bakeOrb, bakeSky, WORLD_H, WORLD_W } from "../art.ts";
import type { BackdropSpec, PlaceScene, SceneContext, SceneInstance } from "./types.ts";

export const BACKDROP_LAYERS = ["sky", "orb", "mist", "ground", "wash", "crackle"] as const;

/** Sky, orb, mist, ground, wash and crackle for one place: the shared helpers a stop ticket starts from. */
export function buildBackdrop(ctx: SceneContext, spec: BackdropSpec): SceneInstance {
  const { pixi, palette: p, options: o } = ctx;
  ctx.layer("sky", new pixi.Sprite(ctx.tex(bakeSky(p, spec.horizon))));

  const orbs = new pixi.Container();
  const addOrb = (kind: "sun" | "moon", x: number, y: number) => {
    const s = new pixi.Sprite(ctx.tex(bakeOrb(kind, p.haloAlpha)));
    s.anchor.set(0.5);
    s.position.set(x, y);
    orbs.addChild(s);
  };
  if (p.orb === "moon") addOrb("moon", 700, spec.horizon - 250);
  else if (p.orb === "sun") addOrb("sun", 700, spec.horizon - 200);
  if (o.ram && p.orb !== "moon") addOrb("moon", 840, spec.horizon - 280);
  ctx.depthLayer("orb", orbs, 0.05);

  ctx.layer("mist", new pixi.Graphics().rect(0, spec.horizon - 120, WORLD_W, 120).fill({ color: 0xfbf0d8, alpha: p.mist * 0.3 }));

  const ground = new pixi.Container();
  const groundSprite = new pixi.Sprite(ctx.tex(bakeGround(spec.horizon, spec.groundTop, spec.groundBottom)));
  groundSprite.y = spec.horizon;
  const edge = new pixi.Graphics().rect(0, spec.horizon, WORLD_W, 3).fill({ color: Number.parseInt(spec.edge.slice(1), 16), alpha: 0.8 });
  ground.addChild(groundSprite, edge);
  ctx.layer("ground", ground);

  const wash = new pixi.Graphics().rect(0, 0, WORLD_W, WORLD_H).fill({ color: Number.parseInt(p.wash.slice(1), 16), alpha: p.washAlpha });
  wash.blendMode = "add";
  ctx.layer("wash", wash);
  ctx.layer("crackle", new pixi.Sprite(ctx.tex(bakeCrackle())));

  return { tick() {} };
}

/** A place whose scene is just its backdrop; its stop ticket refines the spec and layers in its own file. */
export function backdropScene(spec: BackdropSpec): PlaceScene {
  return { horizon: spec.horizon, layers: BACKDROP_LAYERS, backdrop: spec, build: (ctx) => buildBackdrop(ctx, spec) };
}
