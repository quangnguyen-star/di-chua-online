/** The river release as a pure, timed sequence. React owns the clock; nothing here listens for animation events. */
export type RiverStep = "writing" | "folding" | "placing" | "lighting" | "lowering" | "pulling" | "drifting" | "blended";
export type LanternColor = "pink" | "gold" | "white" | "red" | "violet" | "blue" | "green";

export const lanternColors: { id: LanternColor; label: string }[] = [
  { id: "pink", label: "Hồng" },
  { id: "gold", label: "Vàng" },
  { id: "white", label: "Trắng" },
  { id: "red", label: "Đỏ" },
  { id: "violet", label: "Tím" },
  { id: "blue", label: "Xanh dương" },
  { id: "green", label: "Xanh lá" },
];

export const DRIFT_MIN_MS = 60_000;
export const DRIFT_MAX_MS = 90_000;
export const DRIFT_DEFAULT_MS = 75_000;
/** The reduced-motion path holds the fold beat once, then goes straight to the settled river. */
export const REDUCED_MS = 800;

/** The order of the release, after writing. */
export const RELEASE_STEPS = ["folding", "placing", "lighting", "lowering", "pulling", "drifting", "blended"] as const;

const STEP_MS: Record<"folding" | "placing" | "lighting" | "lowering" | "pulling", number> = {
  folding: 1600,
  placing: 1400,
  lighting: 1500,
  lowering: 1800,
  pulling: 2600,
};

export function clampDrift(ms: number): number {
  return Math.min(DRIFT_MAX_MS, Math.max(DRIFT_MIN_MS, ms));
}

/** Starting the release: only a sheet that is still being written can be folded, so a repeat press changes nothing. */
export function release(step: RiverStep): RiverStep {
  return step === "writing" ? "folding" : step;
}

/** The step that follows, or the same step when nothing follows (writing waits for a person, blended is the end). */
export function nextStep(step: RiverStep, reduced = false): RiverStep {
  if (step === "writing" || step === "blended") return step;
  if (reduced) return "blended";
  return RELEASE_STEPS[RELEASE_STEPS.indexOf(step) + 1];
}

/** How long a step lasts before the clock advances it; null when it waits for a person or is finished. */
export function stepDuration(step: RiverStep, driftMs: number, reduced = false): number | null {
  if (step === "writing" || step === "blended") return null;
  if (reduced) return REDUCED_MS;
  if (step === "drifting") return clampDrift(driftMs);
  return STEP_MS[step];
}

/** Total time from folding to blended, for the tour clock and the tests. */
export function releaseDuration(driftMs: number, reduced = false): number {
  let total = 0;
  let step: RiverStep = "folding";
  while (step !== "blended") {
    total += stepDuration(step, driftMs, reduced) ?? 0;
    step = nextStep(step, reduced);
  }
  return total;
}

/** Eased camera pull-back, 0 to 1, over the pulling step. */
export function pullRatio(elapsedMs: number): number {
  const t = Math.min(1, Math.max(0, elapsedMs / STEP_MS.pulling));
  return t * t * (3 - 2 * t);
}

export const PULL_STEP_MS = STEP_MS.pulling;

export const isReleasing = (step: RiverStep): boolean => step !== "writing" && step !== "blended";
