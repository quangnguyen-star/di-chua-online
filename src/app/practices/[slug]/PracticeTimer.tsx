"use client";

import { useActiveTimer } from "@/lib/useActiveTimer";

function format(ms: number) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function PracticeTimer({ slug, seconds, closingLine }: { slug: string; seconds: number; closingLine: string }) {
  const { remainingMs, running, done, start, pause, reset } = useActiveTimer(seconds);
  const untouched = !running && !done && remainingMs === seconds * 1000;

  return (
    <section aria-labelledby={`timer-title-${slug}`} data-testid={`practice-timer-${slug}`}>
      <h2 id={`timer-title-${slug}`}>Bắt đầu thực hành</h2>
      <p role="timer" aria-live="off" data-testid={`practice-remaining-${slug}`}>
        {format(remainingMs)}
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
        <p role="status" data-testid={`practice-closing-${slug}`}>
          <em>{closingLine}</em>
        </p>
      )}
    </section>
  );
}
