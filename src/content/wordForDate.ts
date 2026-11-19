import { dailyWords } from "./dailyWords.ts";
import type { DailyWord } from "./types.ts";

const DAY_MS = 86_400_000;
const HCM_OFFSET_MS = 7 * 3_600_000;

// Asia/Ho_Chi_Minh is a fixed UTC+7 with no daylight saving, so the local
// calendar day number is floor((utc + 7h) / 1 day).
export function wordForDate(d: Date): DailyWord {
  const day = Math.floor((d.getTime() + HCM_OFFSET_MS) / DAY_MS);
  const index = ((day % dailyWords.length) + dailyWords.length) % dailyWords.length;
  return dailyWords[index];
}
