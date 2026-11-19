"use client";

import { useAtmosphere, type Appearance } from "./index";
import styles from "./atmosphere.module.css";

const appearances: { value: Appearance; label: string }[] = [
  { value: "system", label: "Theo thiết bị" },
  { value: "day", label: "Ban ngày" },
  { value: "evening", label: "Buổi tối" },
];

export function SoundControl() {
  const a = useAtmosphere();
  const toggleLabel = a.soundOn ? "Tắt âm thanh" : "Bật âm thanh";

  return (
    <div className={styles.control} data-testid="sound-control">
      <button
        type="button"
        className={styles.toggle}
        aria-pressed={a.soundOn}
        onClick={a.soundOn ? a.disable : a.enable}
        data-testid="sound-toggle"
      >
        {toggleLabel}
      </button>
      {a.failed ? (
        <span role="status" className={styles.note} data-testid="sound-unavailable">
          Không phát được âm thanh trên thiết bị này.
        </span>
      ) : null}
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
    </div>
  );
}
