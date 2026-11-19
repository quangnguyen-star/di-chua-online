import { vnNow } from "../../../lib/clock.ts";
import { lunarDate } from "../../../lib/lunar/index.ts";
import type { PlaceId } from "../../../content/routes.ts";
import type { StageLighting } from "./types.ts";

const MIST_START_HOUR = 6;
const GOLDEN_START_HOUR = 11;
const MOON_START_HOUR = 18;

/** Mist 06:00-11:00, golden 11:00-18:00, moon otherwise. */
export function lightingForHour(hour: number): StageLighting {
  if (hour >= MIST_START_HOUR && hour < GOLDEN_START_HOUR) return "mist";
  if (hour >= GOLDEN_START_HOUR && hour < MOON_START_HOUR) return "golden";
  return "moon";
}

/** The river (pond) is always night, whatever was asked for or the clock says. */
export function resolveLighting(place: PlaceId, requested: StageLighting | undefined, now: Date = new Date()): StageLighting {
  if (place === "pond") return "moon";
  return requested ?? lightingForHour(vnNow(now).hour);
}

/** Whether today (Vietnam civil day) is rằm, the full-moon day of the lunar month. */
export function isRam(now: Date = new Date()): boolean {
  const [y, m, d] = vnNow(now).iso.split("-").map(Number);
  return lunarDate(new Date(Date.UTC(y, m - 1, d, 5))).note === "ram";
}

export interface LightingPalette {
  skyTop: string;
  skyBottom: string;
  farMountain: string;
  midMountain: string;
  /** Warm additive wash laid over the whole scene. */
  wash: string;
  washAlpha: number;
  /** Mist band opacity over the mountains. */
  mist: number;
  orb: "sun" | "moon" | "none";
  haloAlpha: number;
  lanterns: number;
  fireflies: number;
}

export const palettes: Record<StageLighting, LightingPalette> = {
  moon: {
    skyTop: "#0b0706", skyBottom: "#22140c", farMountain: "#3b1610", midMountain: "#6e1d12",
    wash: "#f0b450", washAlpha: 0.04, mist: 0.12, orb: "moon", haloAlpha: 0.32, lanterns: 5, fireflies: 14,
  },
  golden: {
    skyTop: "#3a1d0e", skyBottom: "#a8642a", farMountain: "#5a2412", midMountain: "#7e2a16",
    wash: "#ffc86a", washAlpha: 0.14, mist: 0.2, orb: "sun", haloAlpha: 0.4, lanterns: 3, fireflies: 10,
  },
  mist: {
    skyTop: "#2a1d18", skyBottom: "#7d6a58", farMountain: "#58352a", midMountain: "#7a3a2a",
    wash: "#f4e0b0", washAlpha: 0.1, mist: 0.5, orb: "sun", haloAlpha: 0.25, lanterns: 2, fireflies: 6,
  },
};

/** Rằm adds the full moon (to any lighting that has none) and more lanterns. */
export function lanternCount(lighting: StageLighting, ram: boolean): number {
  return palettes[lighting].lanterns + (ram ? 6 : 0);
}
