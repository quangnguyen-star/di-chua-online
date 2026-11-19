import { dailyWords } from "@/content/dailyWords";
import type { DailyWord } from "@/content/types";

export const WORD_KEY = "dc.word";

export type WordRecord = { id: string; date: string; revealed: boolean };

/** FNV-1a 32-bit; the pick is computed client-side and never sent anywhere. */
export function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function pickWord(id: string, date: string): DailyWord {
  return dailyWords[hash(id + date) % dailyWords.length];
}

export function parseRecord(raw: string | null): WordRecord | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<WordRecord>;
    if (typeof v.id === "string" && typeof v.date === "string" && typeof v.revealed === "boolean") {
      return { id: v.id, date: v.date, revealed: v.revealed };
    }
  } catch {
    return null;
  }
  return null;
}

/** Same record on the same day; a new day keeps the id but resets `revealed`. */
export function recordFor(prev: WordRecord | null, today: string, newId: () => string): WordRecord {
  if (prev && prev.date === today) return prev;
  return { id: prev?.id ?? newId(), date: today, revealed: false };
}
