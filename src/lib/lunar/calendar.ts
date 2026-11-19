import { lunarDate } from "./index.ts";
import type { LunarDate } from "./index.ts";


export type CalendarDay = { iso: string; solarDay: number; lunar: LunarDate; special?: string };

/** Fixed-date observances on the lunar calendar (non-leap months only). */
const SPECIAL: Record<string, string> = {
  "1-1": "Tết Nguyên Đán",
  "15-1": "Rằm tháng Giêng",
  "10-3": "Giỗ Tổ Hùng Vương",
  "15-4": "Phật Đản",
  "5-5": "Tết Đoan Ngọ",
  "15-7": "Vu Lan",
  "15-8": "Trung Thu",
  "23-12": "Ông Táo chầu trời",
};

export function specialDay(l: LunarDate): string | undefined {
  return l.leap ? undefined : SPECIAL[`${l.day}-${l.month}`];
}

/** Local noon of a Vietnam civil day, as a Date (UTC+7). */
export function noonOf(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 5));
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Every day of a solar month (month 1..12) with its lunar date and observance. */
export function monthCalendar(year: number, month: number): CalendarDay[] {
  const out: CalendarDay[] = [];
  const n = daysInMonth(year, month);
  for (let d = 1; d <= n; d++) {
    const lunar = lunarDate(noonOf(year, month, d));
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    out.push({ iso, solarDay: d, lunar, special: specialDay(lunar) });
  }
  return out;
}
