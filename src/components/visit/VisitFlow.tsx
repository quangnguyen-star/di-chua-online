"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { visitStages } from "@/content";
import { useVisit } from "@/lib/visit/useVisit";
import { VisitFailure } from "./VisitErrorBoundary";
import VisitScene from "./VisitScene";
import styles from "./visit.module.css";

const totalSeconds = visitStages.reduce((sum, s) => sum + s.seconds, 0);
const totalMs = totalSeconds * 1000;

export default function VisitFlow() {
  const router = useRouter();
  const { state, begin, pause, resume, skip, exit } = useVisit(visitStages);
  const [pulse, setPulse] = useState(0);
  const lastStage = useRef(-1);

  const { phase, stageIndex, remainingMs, skipped } = state;
  const stage = visitStages[stageIndex];
  const active = phase === "running" || phase === "paused";

  useEffect(() => {
    if (!active || lastStage.current === stageIndex) return;
    lastStage.current = stageIndex;
    setPulse((n) => n + 1);
  }, [active, stageIndex]);

  if (!stage) return <VisitFailure onRetry={() => router.refresh()} />;

  const doneMs = visitStages.slice(0, stageIndex).reduce((sum, s) => sum + s.seconds * 1000, 0);
  const elapsedMs =
    phase === "complete" ? totalMs : phase === "ready" ? 0 : doneMs + stage.seconds * 1000 - remainingMs;
  const percent = Math.min(100, Math.round((elapsedMs / totalMs) * 100));

  const leave = () => {
    exit();
    router.push("/");
  };

  const announcement = active ? `Chặng ${stageIndex + 1} trên ${visitStages.length}: ${stage.label}` : "";

  return (
    <div className={styles.root}>
      <h1>Ghé thăm chùa</h1>
      <VisitScene index={stageIndex} pulse={pulse} />
      <div className={styles.live} role="status" aria-live="polite" data-testid="visit-announcement">
        {announcement}
      </div>

      {phase === "ready" && (
        <>
          <p className={styles.prompt}>
            Một chuyến ghé thăm chùa qua bốn chặng: cổng, sân, chánh điện và trở ra. Không đăng nhập, không âm thanh,
            không lưu gì.
          </p>
          <div className={styles.controls}>
            <button type="button" className="button" data-testid="visit-begin" onClick={begin}>
              Bắt đầu
            </button>
            <button type="button" className="button button--quiet" data-testid="visit-exit" onClick={leave}>
              Thoát
            </button>
          </div>
        </>
      )}

      {active && (
        <>
          <h2 className={styles.label} data-testid="visit-stage">
            {stage.label}
          </h2>
          <p className={styles.prompt} data-testid="visit-prompt">
            {stage.prompt}
          </p>
          <progress
            className={styles.progress}
            max={100}
            value={percent}
            aria-label="Tiến trình chuyến ghé thăm"
            data-testid="visit-progress"
          />
          <div className={styles.controls}>
            {phase === "running" ? (
              <button type="button" className="button" data-testid="visit-pause" onClick={pause}>
                Tạm dừng
              </button>
            ) : (
              <button type="button" className="button" data-testid="visit-resume" onClick={resume}>
                Tiếp tục
              </button>
            )}
            <button type="button" className="button button--quiet" data-testid="visit-skip" onClick={skip}>
              Bỏ qua chặng này
            </button>
            <button type="button" className="button button--quiet" data-testid="visit-exit" onClick={leave}>
              Thoát
            </button>
          </div>
        </>
      )}

      {phase === "complete" && (
        <>
          <h2 className={styles.label} data-testid="visit-complete">
            Chuyến ghé thăm đã khép lại
          </h2>
          <p className={styles.prompt}>
            {skipped
              ? "Bạn đã đi qua chùa theo nhịp của riêng mình. Mang theo sự yên ổn này vào phần còn lại của ngày."
              : `Bạn đã dành ${Math.round(totalSeconds / 60)} phút ghé thăm chùa. Mang theo sự yên ổn này vào phần còn lại của ngày.`}
          </p>
          <progress className={styles.progress} max={100} value={100} aria-label="Tiến trình chuyến ghé thăm" data-testid="visit-progress" />
          <div className={styles.controls}>
            <button type="button" className="button" data-testid="visit-exit" onClick={leave}>
              Về trang chủ
            </button>
          </div>
        </>
      )}
    </div>
  );
}
