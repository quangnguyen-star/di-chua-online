"use client";

import { useAtmosphere } from "./index";
import type { MixerStatus } from "../../lib/audio/mixer.ts";
import styles from "./atmosphere.module.css";

/** One line describing what the audio system is really doing, from the mixer's own state. */
function describe(a: { soundOn: boolean; failed: boolean; status: MixerStatus }): string {
  const { status } = a;
  if (a.failed || status.blocked) return "Trình duyệt không cho phát âm thanh. Hãy bấm Bật âm thanh lần nữa.";
  if (!a.soundOn) return "Đang tắt tiếng. Trang vẫn đầy đủ khi không có âm thanh.";
  if (status.contextState === "running") {
    return status.assetFailed
      ? "Không tải được bản ghi, đang dùng âm thanh tổng hợp thay thế."
      : "Đang phát âm thanh tổng hợp.";
  }
  if (status.contextState === "suspended") return "Âm thanh đang chờ trình duyệt cho phép.";
  return "Âm thanh chưa sẵn sàng.";
}

export function SoundPopover() {
  const a = useAtmosphere();
  const sliders = [
    { id: "ambience", label: "Không gian", value: a.ambience, set: a.setAmbience },
    { id: "cues", label: "Hiệu ứng", value: a.cues, set: a.setCues },
    { id: "music", label: "Nhạc", value: a.music, set: a.setMusic },
  ];

  return (
    <details className={styles.more} data-testid="sound-popover">
      <summary aria-label="Âm thanh" title="Âm thanh" data-testid="sound-summary">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" />
          <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
        </svg>
      </summary>
      <div className={styles.panel}>
        <button
          type="button"
          className={styles.toggle}
          aria-pressed={a.soundOn}
          onClick={a.soundOn ? a.disable : a.enable}
          data-testid="sound-toggle"
        >
          {a.soundOn ? "Tắt tiếng" : "Bật âm thanh"}
        </button>
        {sliders.map((s) => (
          <label key={s.id}>
            {s.label}
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={s.value}
              onChange={(e) => s.set(Number(e.target.value))}
              data-testid={`sound-${s.id}`}
            />
          </label>
        ))}
        <p role="status" className={styles.note} data-testid="sound-status">
          {describe(a)}
        </p>
      </div>
    </details>
  );
}
