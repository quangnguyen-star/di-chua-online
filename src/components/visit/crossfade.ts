export const CROSSFADE_MS = 1800;

/** The outgoing layer is unmounted only after its fade has finished, so nothing lingers at low opacity. */
export const UNMOUNT_AFTER_MS = CROSSFADE_MS + 50;

/** Opacity of the outgoing layer `elapsedMs` into the crossfade: 1 to 0, linear, clamped. */
export function outgoingOpacity(elapsedMs: number): number {
  return Math.min(1, Math.max(0, 1 - elapsedMs / CROSSFADE_MS));
}
