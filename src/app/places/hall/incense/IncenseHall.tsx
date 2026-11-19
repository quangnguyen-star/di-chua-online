"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAtmosphere } from "@/components/atmosphere";
import { useActiveTimer } from "@/lib/useActiveTimer";
import { INCENSE_SECONDS, burnProgress, formatRemaining, incensePhase, phaseLabels } from "./incense";
import styles from "./incense.module.css";

export default function IncenseHall() {
  const { scene } = useAtmosphere();
  const { remainingMs, running, start, pause, resume } = useActiveTimer(INCENSE_SECONDS);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    scene("hall");
  }, [scene]);

  const phase = incensePhase(lit, running, remainingMs);
  const progress = burnProgress(remainingMs);
  const stickHeight = 120 * (1 - progress);

  function light() {
    if (lit) return;
    setLit(true);
    start();
  }

  return (
    <section className={styles.root} aria-labelledby="incense-title" data-testid="incense-page" data-phase={phase}>
      <h1 id="incense-title">Thắp nhang</h1>
      <svg className={styles.scene} viewBox="0 0 200 200" role="img" aria-label="Một nén hương trong lư" data-testid="incense-scene">
        <rect x="60" y="160" width="80" height="24" rx="6" className={styles.censer} />
        <rect x="98" y={160 - stickHeight} width="4" height={stickHeight} className={styles.stick} data-testid="incense-stick" />
        {phase !== "ready" && phase !== "finished" && (
          <>
            <circle cx="100" cy={160 - stickHeight} r="3.5" className={styles.ember} data-testid="incense-ember" />
            <path
              d={`M100 ${160 - stickHeight - 6} C 92 ${160 - stickHeight - 26}, 110 ${160 - stickHeight - 44}, 100 ${160 - stickHeight - 70}`}
              className={`${styles.smoke} ${phase === "burning" ? styles.smokeMoving : ""}`}
              data-testid="incense-smoke"
            />
          </>
        )}
      </svg>
      <p role="timer" aria-live="off" data-testid="incense-remaining">
        {formatRemaining(remainingMs)}
      </p>
      <p className="muted" role="status" data-testid="incense-state">
        {phaseLabels[phase]}
      </p>
      <div className="actions">
        {phase === "ready" && (
          <button type="button" className="button" onClick={light} data-testid="incense-light">
            Thắp nhang
          </button>
        )}
        {phase === "burning" && (
          <button type="button" className="button" onClick={pause} data-testid="incense-pause">
            Tạm dừng
          </button>
        )}
        {phase === "paused" && (
          <button type="button" className="button" onClick={resume} data-testid="incense-resume">
            Tiếp tục
          </button>
        )}
        {phase !== "finished" && (
          <Link href="/" className="button button--quiet" data-testid="incense-leave">
            Rời đi
          </Link>
        )}
      </div>
      {phase === "finished" && (
        <div data-testid="incense-finished">
          <p>Bạn có thể ngồi yên một lát, hoặc quay lại khi muốn.</p>
          <p className="actions">
            <Link href="/practices/sitting" className="button button--quiet" data-testid="incense-next">
              Tùy chọn: ngồi yên
            </Link>
            <Link href="/" data-testid="incense-back">
              Quay lại
            </Link>
          </p>
        </div>
      )}
    </section>
  );
}
