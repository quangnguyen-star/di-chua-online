"use client";

import { SettingsPopover } from "../nav/SettingsPopover";
import { SoundPopover } from "./SoundPopover";
import styles from "./atmosphere.module.css";

export function SoundControl() {
  return (
    <div className={styles.control} data-testid="sound-control">
      <SoundPopover />
      <SettingsPopover />
    </div>
  );
}
