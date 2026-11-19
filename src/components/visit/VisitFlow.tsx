"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { visitStages } from "@/content";
import { activities } from "@/content/places";
import { useAtmosphere, type Scene } from "@/components/atmosphere";
import { useVisit } from "@/lib/visit/useVisit";
import { VisitFailure } from "./VisitErrorBoundary";
import StopActivity, { embeddedStops } from "./StopActivity";
import VisitScene from "./VisitScene";
import styles from "./visit.module.css";

const totalSeconds = visitStages.reduce((sum, s) => sum + s.seconds, 0);
const totalMs = totalSeconds * 1000;

const stageScene: Record<string, Scene> = {
  gate: "gate",
  courtyard: "courtyard",
  hall: "hall",
  pond: "pond",
  veranda: "veranda",
  outside: "outside",
};

/** The one optional continuation, read from the registry's next field on the hall activity. */
const nextId = activities.find((a) => a.id === "incense")?.next;
const nextStep = activities.find((a) => a.id === nextId && a.ready);

export default function VisitFlow() {
  const router = useRouter();
  const { state, begin, pause, resume, skip, exit } = useVisit(visitStages);
  const [ready, setReady] = useState(false);
  const [pulse, setPulse] = useState(0);
  const lastStage = useRef(-1);
  const rang = useRef({ start: false, end: false });
  const { scene, cue } = useAtmosphere();

  // A private thought is never kept: the tour holds none, and each lantern stop mounts fresh and empty.
  useEffect(() => setReady(true), []);

  const { phase, stageIndex, remainingMs, skipped } = state;
  const stage = visitStages[stageIndex];
  const active = phase === "running" || phase === "paused";

  useEffect(() => {
    if (!active || lastStage.current === stageIndex) return;
    lastStage.current = stageIndex;
    setPulse((n) => n + 1);
  }, [active, stageIndex]);

  const stageId = visitStages[stageIndex]?.id;
  useEffect(() => {
    if (!active || !stageId) return;
    scene(stageScene[stageId] ?? "gate");
  }, [active, stageId, scene]);

  useEffect(() => {
    if (phase === "ready") rang.current = { start: false, end: false };
    if (active && !rang.current.start) {
      rang.current.start = true;
      cue("bell");
    }
    if (phase === "complete" && !rang.current.end) {
      rang.current.end = true;
      cue("bell");
    }
  }, [phase, active, cue]);

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
      <div className={styles.layout}>
      <VisitScene index={stageIndex} pulse={pulse} />
      <div className={styles.guidance}>
      <div className={styles.live} role="status" aria-live="polite" data-testid="visit-announcement">
        {announcement}
      </div>

      {phase === "ready" && (
        <>
          <p className={styles.prompt}>
            Một chuyến ghé thăm chùa qua sáu chặng, vừa đủ năm phút: cổng, sân, chánh điện, bến sông, hiên chùa và trở ra. Không đăng nhập,
            âm thanh là tuỳ chọn, không lưu gì.
          </p>
          <div className={styles.controls}>
            <button type="button" className="button" data-testid="visit-begin" onClick={begin} disabled={!ready}>
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
          <p className="muted" data-testid="visit-stop-count">
            Chặng {stageIndex + 1}/{visitStages.length} · {stage.config.seconds} giây
          </p>
          <p className={styles.prompt} data-testid="visit-prompt">
            {stage.prompt}
          </p>
          {(embeddedStops as readonly string[]).includes(stage.id) && (
            <div className={styles.activity} data-testid="visit-activity" data-stop={stage.id}>
              <StopActivity key={stage.id} stopId={stage.id} seconds={stage.config.seconds} paused={phase === "paused"} />
            </div>
          )}
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
              : `Bạn đã dành đủ ${Math.round(totalSeconds / 60)} phút ghé thăm chùa. Mang theo sự yên ổn này vào phần còn lại của ngày.`}
          </p>
          <progress className={styles.progress} max={100} value={100} aria-label="Tiến trình chuyến ghé thăm" data-testid="visit-progress" />
          {nextStep && (
            <div className={styles.next}>
              <p>Nếu muốn, bạn có thể ở lại thêm một chút:</p>
              <div className={styles.controls}>
                <Link className="button button--quiet" href={nextStep.href} data-testid="visit-next">
                  {nextStep.label}
                </Link>
              </div>
            </div>
          )}
          <div className={styles.controls}>
            <button type="button" className="button" data-testid="visit-exit" onClick={leave}>
              Về trang chủ
            </button>
          </div>
        </>
      )}
      </div>
      </div>
    </div>
  );
}
