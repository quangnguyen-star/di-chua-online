import type { PondApi } from "../stage/scenes/types.ts";
import type { LanternColor, RiverStep } from "./sequence.ts";

/** Where the visitor's lantern touches the water, in the pond scene's world frame. Colour and place only: nothing the visitor typed crosses this seam. */
export const LOWER_AT = { x: 330, y: 470 } as const;
const BEFORE_RELEASE_DRIFT = 0.4;

/** Draws one step on the scene. Takes the colour and the step and nothing else, so typed text cannot reach the renderer. */
export function applyStep(pond: PondApi | null, step: RiverStep, color: LanternColor, reduced = false): void {
  if (!pond) return;
  if (reduced && step === "folding") {
    pond.setLantern(color);
    pond.light();
    pond.lower(LOWER_AT.x, LOWER_AT.y);
    pond.setDrift(1);
    pond.pullBack(1);
    return;
  }
  switch (step) {
    case "folding":
      pond.setLantern(color);
      pond.setDrift(BEFORE_RELEASE_DRIFT);
      break;
    case "lighting":
      pond.light();
      break;
    case "lowering":
      pond.lower(LOWER_AT.x, LOWER_AT.y);
      break;
    case "drifting":
      pond.pullBack(1);
      pond.setDrift(1);
      break;
    default:
      break;
  }
}

/** Puts the scene back as it was found: nothing held, camera home, normal drift. Safe to call more than once. */
export function resetScene(pond: PondApi | null): void {
  if (!pond) return;
  pond.setLantern(null);
  pond.setDrift(1);
  pond.pullBack(0);
}
