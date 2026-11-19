"use client";

import Link from "next/link";
import { useActiveTimer } from "@/lib/useActiveTimer";
import { timerStateLabels, type PracticeKind, type TimerState } from "../labels";
import { PracticeComposition } from "./compositions/PracticeComposition";

function format(ms: number) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Props = {
  slug: string;
  seconds: number;
  closingLine: string;
  kind: PracticeKind;
  next: { href: string; title: string } | null;
};

export function PracticeTimer({ slug, seconds, closingLine, kind, next }: Props) {
  const { remainingMs, running, done, start, pause, reset } = useActiveTimer(seconds);
  const untouched = !running && !done && remainingMs === seconds * 1000;
  const state: TimerState = done ? "complete" : running ? "running" : untouched ? "ready" : "paused";
  const progress = Math.min(1, Math.max(0, 1 - remainingMs / (seconds * 1000)));

  return (
    <section aria-labelledby={`timer-title-${slug}`} data-testid={`practice-timer-${slug}`}>
      <h2 id={`timer-title-${slug}`}>Bắt đầu thực hành</h2>
      <PracticeComposition kind={kind} progress={progress} running={running} />
      <p role="timer" aria-live="off" data-testid={`practice-remaining-${slug}`}>
        {format(remainingMs)}
      </p>
      <p className="muted" role="status" data-testid={`practice-state-${slug}`} data-state={state}>
        {timerStateLabels[state]}
      </p>
      <div className="actions">
        {done ? (
          <button type="button" className="button" onClick={reset} data-testid={`practice-restart-${slug}`}>
            Thực hành lại
          </button>
        ) : running ? (
          <button type="button" className="button" onClick={pause} data-testid={`practice-pause-${slug}`}>
            Tạm dừng
          </button>
        ) : (
          <button type="button" className="button" onClick={start} data-testid={`practice-start-${slug}`}>
            {untouched ? "Bắt đầu" : "Tiếp tục"}
          </button>
        )}
        {!untouched && !done && (
          <button type="button" className="button button--quiet" onClick={reset} data-testid={`practice-reset-${slug}`}>
            Đặt lại
          </button>
        )}
      </div>
      {done && (
        <div data-testid={`practice-complete-${slug}`}>
          <p role="status" data-testid={`practice-closing-${slug}`}>
            <em>{closingLine}</em>
          </p>
          <p className="actions">
            {next && (
              <Link href={next.href} className="button button--quiet" data-testid={`practice-next-${slug}`}>
                Tùy chọn, bài tiếp theo: {next.title}
              </Link>
            )}
            <Link href="/practices" data-testid={`practice-back-${slug}`}>
              Quay lại các bài thực hành
            </Link>
          </p>
        </div>
      )}
    </section>
  );
}
