import { lunarDate } from "./lunar/index.ts";
import { daysInMonth, noonOf } from "./lunar/calendar.ts";

const LABEL = { "mung-mot": "Mùng một", ram: "Rằm" } as const;
const UID_TAG = { "mung-mot": "mung1", ram: "ram" } as const;

export function escapeIcsText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Fold a content line at 75 octets (RFC 5545 3.1) without splitting a UTF-8 character. */
export function foldLine(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let cur = "";
  let bytes = 0;
  let limit = 75;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    if (bytes + b > limit) {
      parts.push(cur);
      cur = "";
      bytes = 0;
      limit = 74;
    }
    cur += ch;
    bytes += b;
  }
  parts.push(cur);
  return parts.join("\r\n ");
}

const ymd = (y: number, m: number, d: number) => `${y}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`;

/** All-day events for every mùng một and rằm of a solar year (Asia/Ho_Chi_Minh). Deterministic: no clock reads. */
export function buildIcs(year: number): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Đi Chùa Online//Lịch âm//VI", "CALSCALE:GREGORIAN"];
  const stamp = `${ymd(year, 1, 1)}T000000Z`;
  for (let m = 1; m <= 12; m++) {
    const n = daysInMonth(year, m);
    for (let d = 1; d <= n; d++) {
      const l = lunarDate(noonOf(year, m, d));
      if (!l.note) continue;
      const next = new Date(Date.UTC(year, m - 1, d + 1));
      const summary = `${LABEL[l.note]} tháng ${l.month}${l.leap ? " nhuận" : ""} âm lịch`;
      lines.push(
        "BEGIN:VEVENT",
        `UID:dc-${ymd(year, m, d)}-${UID_TAG[l.note]}@dichua`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${ymd(year, m, d)}`,
        `DTEND;VALUE=DATE:${ymd(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate())}`,
        `SUMMARY:${escapeIcsText(summary)}`,
        "END:VEVENT",
      );
    }
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
