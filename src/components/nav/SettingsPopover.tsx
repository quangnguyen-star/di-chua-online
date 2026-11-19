"use client";

import { useAtmosphere, type Appearance } from "../atmosphere";
import styles from "../atmosphere/atmosphere.module.css";

const appearances: { value: Appearance; label: string }[] = [
  { value: "system", label: "Theo thiết bị" },
  { value: "day", label: "Ban ngày" },
  { value: "evening", label: "Buổi tối" },
];

export function SettingsPopover() {
  const a = useAtmosphere();

  return (
    <details className={styles.more}>
      <summary aria-label="Giao diện và âm lượng" title="Giao diện và âm lượng" data-testid="settings-summary">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
        </svg>
      </summary>
      <div className={styles.panel}>
        <label>
          Giao diện
          <select value={a.appearance} onChange={(e) => a.setAppearance(e.target.value as Appearance)}>
            {appearances.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </details>
  );
}
