import { lunarDate } from "@/lib/lunar";
import type { LunarDate } from "@/lib/lunar";

function todaysLunarDate(): LunarDate | null {
  try {
    return lunarDate(new Date());
  } catch {
    return null;
  }
}

const NOTE_LABEL = { "mung-mot": "mùng một", ram: "rằm" } as const;

function Lantern() {
  return (
    <svg width="14" height="20" viewBox="0 0 14 20" aria-hidden="true" focusable="false" style={{ flex: "none" }}>
      <path d="M7 0v3" stroke="var(--wood)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <rect x="3" y="3" width="8" height="2" rx="1" fill="var(--wood)" />
      <ellipse cx="7" cy="11" rx="5.5" ry="6" fill="var(--gold)" opacity="0.7" />
      <rect x="3" y="16" width="8" height="2" rx="1" fill="var(--wood)" />
    </svg>
  );
}

export function LunarNote() {
  const date = todaysLunarDate();
  if (!date) return null;

  const text = `Hôm nay là ngày ${date.day} tháng ${date.month}${date.leap ? " nhuận" : ""} âm lịch`;
  const label = date.note ? NOTE_LABEL[date.note] : null;

  return (
    <p
      className="muted"
      data-testid="lunar-note"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        minHeight: "1.5rem",
        margin: "0.5rem auto 0",
        fontSize: "0.95rem",
      }}
    >
      {label ? <Lantern /> : null}
      <span>{label ? `${text} — ${label}` : text}</span>
    </p>
  );
}
