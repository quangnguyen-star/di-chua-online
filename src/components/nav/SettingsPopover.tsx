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
      <summary>Tuỳ chỉnh</summary>
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
