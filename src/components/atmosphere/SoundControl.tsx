"use client";

import { useAtmosphere } from "./index";
import { SettingsPopover } from "../nav/SettingsPopover";
import styles from "./atmosphere.module.css";

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
      <SettingsPopover />
    </div>
  );
}
