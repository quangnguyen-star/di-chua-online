import type { PlaceId } from "../../../content/routes.ts";

export type StageLighting = "mist" | "golden" | "moon";
export type StageQuality = "auto" | "low" | "static";

/** Frozen public API of the scene stage; the six stop tickets code against exactly this. */
export interface SceneStageProps {
  place: PlaceId;
  /** Omit to follow the clock (mist 06-11, golden 11-18, moon otherwise); the river is always moon. */
  lighting?: StageLighting;
  /** Stops the animation loop; the current frame stays on screen. */
  paused?: boolean;
  /** "auto" adapts DPR and particle count to frame time, "low" starts reduced, "static" never starts WebGL. */
  quality?: StageQuality;
  /** Prefers a still frame: no drift, no particles in motion. Defaults to the user's reduced-motion setting. */
  reduced?: boolean;
}
