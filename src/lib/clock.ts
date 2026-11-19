/** Single time authority (Asia/Ho_Chi_Minh, fixed UTC+7, no DST) for lunar, word, theme and ics. */
const VN_OFFSET_MS = 7 * 3600_000;
const HOUR_MS = 3600_000;
const DAY_MS = 24 * HOUR_MS;
const DAY_START_HOUR = 6;
const EVENING_START_HOUR = 18;

export type AppearanceMode = "auto" | "day" | "evening";

export function vnNow(now: Date = new Date()): { iso: string; hour: number } {
  const vn = new Date(now.getTime() + VN_OFFSET_MS);
  return { iso: vn.toISOString().slice(0, 10), hour: vn.getUTCHours() };
}

/** Day runs from 06:00 up to, but not including, 18:00. */
export function appearanceFor(mode: AppearanceMode, hour: number): "day" | "evening" {
  if (mode !== "auto") return mode;
  return hour >= DAY_START_HOUR && hour < EVENING_START_HOUR ? "day" : "evening";
}

/** Milliseconds until the next 06:00, 18:00 or 00:00 in Vietnam; always positive. */
export function msUntilNextBoundary(now: Date = new Date()): number {
  const sinceMidnight = (((now.getTime() + VN_OFFSET_MS) % DAY_MS) + DAY_MS) % DAY_MS;
  for (const at of [DAY_START_HOUR * HOUR_MS, EVENING_START_HOUR * HOUR_MS, DAY_MS]) {
    if (at > sinceMidnight) return at - sinceMidnight;
  }
  return DAY_MS - sinceMidnight;
}
