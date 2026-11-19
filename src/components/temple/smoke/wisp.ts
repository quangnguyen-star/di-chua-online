/* Smoke wisp geometry: one continuous curling polyline, never discrete particles. Pure, so it is testable
   without a canvas. Colors mirror the lacquer tokens (--lq-text-silver). */
export const MAX_SEGMENTS = 48;
export const MIN_SEGMENTS = 8;

export interface WispParams {
  lit: boolean;
  /** 0..1 */
  intensity: number;
  /** -1..1, sideways drift */
  wind: number;
  /** seconds on the animation clock */
  time: number;
  height: number;
}

export interface WispPoint {
  x: number;
  y: number;
  /** 0..1 opacity along the wisp */
  alpha: number;
  /** stroke width in px */
  width: number;
}

export const SMOKE_COLOR = "#d8d5cf";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function segmentCount(intensity: number): number {
  const n = Math.round(MIN_SEGMENTS + clamp(intensity, 0, 1) * (MAX_SEGMENTS - MIN_SEGMENTS));
  return Math.min(MAX_SEGMENTS, n);
}

/** Points from the ember (x = 0, y = 0) upward (negative y). Empty when not lit. */
export function wispPoints({ lit, intensity, wind, time, height }: WispParams): WispPoint[] {
  if (!lit) return [];
  const count = segmentCount(intensity);
  const w = clamp(wind, -1, 1);
  const points: WispPoint[] = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const sway = Math.sin(t * 5 + time * 1.3) * (4 + 10 * t) + Math.sin(t * 11 - time * 0.9) * 2 * t;
    points.push({
      x: sway + w * 30 * t * t,
      y: -t * height,
      alpha: clamp(0.5 * (1 - t) * (0.4 + 0.6 * clamp(intensity, 0, 1)), 0, 1),
      width: 1.5 + 3 * t,
    });
  }
  return points;
}
