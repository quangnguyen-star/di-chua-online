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
          Tiếng nền
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={a.ambience}
            onChange={(e) => a.setAmbience(Number(e.target.value))}
          />
        </label>
        <label>
          Nhạc
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={a.music}
            onChange={(e) => a.setMusic(Number(e.target.value))}
          />
        </label>
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
