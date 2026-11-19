import type { PlaceId } from "../../../../content/routes.ts";
import { courtyardScene } from "./courtyard.ts";
import { gateScene } from "./gate.ts";
import { hallScene } from "./hall.ts";
import { outsideScene } from "./outside.ts";
import { pondScene } from "./pond.ts";
import type { PlaceScene, SceneRegistry } from "./types.ts";
import { verandaScene } from "./veranda.ts";

/** One scene per place; a stop ticket edits only its own scenes/<place>.ts. */
export const SCENES: SceneRegistry = {
  gate: gateScene,
  courtyard: courtyardScene,
  hall: hallScene,
  pond: pondScene,
  veranda: verandaScene,
  outside: outsideScene,
};

export const HORIZON: Record<PlaceId, number> = {
  gate: gateScene.horizon,
  courtyard: courtyardScene.horizon,
  hall: hallScene.horizon,
  pond: pondScene.horizon,
  veranda: verandaScene.horizon,
  outside: outsideScene.horizon,
};

export function sceneFor(place: PlaceId): PlaceScene {
  return SCENES[place];
}
