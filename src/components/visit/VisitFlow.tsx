"use client";

import Link from "next/link";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import {
  BREATHING_MS,
  INTENTION_MAX,
  SKIPPABLE,
  STEPS,
  breathElapsed,
  durationBucket,
  initialState,
  stepIndex,
  visitReducer,
  type Step,
} from "@/lib/visitMachine";
import type { VisitSnapshot } from "@/lib/content";
import Illustration from "./Illustration";

const END_CONFIRM_VI = "Kết thúc chuyến ghé thăm? Điều bạn định tâm sẽ bị xóa.";
const END_CONFIRM_EN = "End this visit? Your intention will be cleared.";

const STEP_LABEL: Record<Step, string> = {
  arrive: "Đến chùa",
  offering: "Dâng hương",
  intention: "Định tâm",
  breathing: "Hít thở",
  reflection: "Lời nhắc",
  close: "Kết thúc",
};

const reducedMotionCss = `
@media (prefers-reduced-motion: no-preference) {
  .visit-ember { animation: visit-glow 2s ease-in-out infinite; }
}
@keyframes visit-glow { 50% { opacity: 0.4; } }
`;

const SNAPSHOT_TIMEOUT_MS = 10_000;

type Load = { status: "loading" } | { status: "error" } | { status: "ready"; snapshot: VisitSnapshot };

export default function VisitFlow() {
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), SNAPSHOT_TIMEOUT_MS);
    fetch("/api/visit-snapshot", { signal: ctl.signal })
      .then((r) => (r.ok ? (r.json() as Promise<VisitSnapshot>) : Promise.reject(new Error("snapshot"))))
      .then((snapshot) => setLoad({ status: "ready", snapshot }))
      .catch(() => setLoad({ status: "error" }))
      .finally(() => clearTimeout(timer));
  }, []);

  if (load.status === "loading") return <p role="status">Đang chuẩn bị chuyến ghé thăm…</p>;
  if (load.status === "error") {
    return (
      <section>
        <h1>Chưa thể mở chuyến ghé thăm</h1>
        <p>Nội dung chưa sẵn sàng. Vui lòng thử lại sau.</p>
        <Link href="/" className="button">
          Về trang chủ
        </Link>
      </section>
    );
  }
  return <Visit snapshot={load.snapshot} />;
}

function Visit({ snapshot }: { snapshot: VisitSnapshot }) {
  const [state, dispatch] = useReducer(visitReducer, initialState);
  const [now, setNow] = useState(() => Date.now());
  const [announce, setAnnounce] = useState("");
  const [audioOn, setAudioOn] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);
  const [audioKey, setAudioKey] = useState(0);
  const visitId = useRef(crypto.randomUUID());
  const startedAt = useRef(Date.now());
  const { step, breath } = state;
  const index = stepIndex(step);
  const practiceId = snapshot.breathing.id;
  const base = { contentVersion: snapshot.version, visitId: visitId.current };

  const next = useCallback(() => dispatch({ type: "next", now: Date.now() }), []);
  const skip = useCallback(() => dispatch({ type: "skip", now: Date.now() }), []);

  useEffect(() => {
    track("visit_started", base);
  }, []);

  const prevStep = useRef<Step | null>(null);
  useEffect(() => {
    if (state.ended) return;
    const prev = prevStep.current;
    prevStep.current = step;
    if (prev && prev !== step) track("step_completed", { ...base, step: stepIndex(prev) + 1 });
    track("step_viewed", { ...base, step: index + 1 });
    if (step === "breathing") track("practice_opened", { ...base, practiceId });
    if (step === "close") {
      track("visit_completed", {
        ...base,
        durationBucket: durationBucket(Date.now() - startedAt.current),
      });
    }
    setAnnounce(step === "close" ? "Chuyến ghé thăm đã hoàn tất." : `Bước ${index + 1}: ${STEP_LABEL[step]}`);
  }, [step, state.ended]);

  useEffect(() => {
    if (step !== "breathing" || breath.paused) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      dispatch({ type: "tick", now: t });
    }, 250);
    return () => clearInterval(id);
  }, [step, breath.paused]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden") dispatch({ type: "hidden", now: Date.now() });
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (step !== "breathing") {
      setAudioOn(false);
      setAudioFailed(false);
    }
  }, [step]);

  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    document.getElementById("visit-title")?.focus();
  }, [step]);

  useEffect(() => () => dispatch({ type: "clear" }), []);

  if (state.ended) {
    return (
      <section>
        <h1>Đã kết thúc chuyến ghé thăm</h1>
        <p>Hẹn gặp lại bạn.</p>
        <Link href="/" className="button">
          Về trang chủ
        </Link>
      </section>
    );
  }

  const remainingSec = Math.ceil((BREATHING_MS - breathElapsed(breath, now)) / 1000);
  const mm = String(Math.floor(remainingSec / 60)).padStart(2, "0");
  const ss = String(remainingSec % 60).padStart(2, "0");
  const audioUrl = snapshot.breathing.audioUrl;

  return (
    <section aria-labelledby="visit-title">
      <style>{reducedMotionCss}</style>
      <div role="status" aria-live="polite" style={SR_ONLY}>
        {announce}
      </div>
      <p>
        Bước {index + 1}/{STEPS.length}
      </p>
      <h1 id="visit-title" tabIndex={-1}>{STEP_LABEL[step]}</h1>

      {step === "arrive" && (
        <>
          <p>Hãy dừng lại một chút. Bạn có hai phút cho chính mình.</p>
          <button type="button" className="button" onClick={next}>
            Bắt đầu
          </button>
        </>
      )}

      {step === "offering" && (
        <>
          <Illustration lit={state.offered} />
          {state.offered ? (
            <p data-testid="offered-state">Bạn đã dâng hương.</p>
          ) : (
            <button
              type="button"
              className="button"
              onClick={() => dispatch({ type: "offer" })}
              disabled={state.offered}
            >
              Dâng hương
            </button>
          )}
          <button type="button" className="button" onClick={next} disabled={!state.offered}>
            Tiếp tục
          </button>
        </>
      )}

      {step === "intention" && (
        <>
          <label htmlFor="intention">Điều bạn muốn gửi gắm hôm nay</label>
          <textarea
            id="intention"
            rows={4}
            maxLength={INTENTION_MAX}
            autoComplete="off"
            spellCheck={false}
            value={state.intention}
            onChange={(e) => dispatch({ type: "setIntention", text: e.target.value })}
          />
          <p>
            {state.intention.length}/{INTENTION_MAX}
          </p>
          <button type="button" className="button" onClick={next}>
            Tiếp tục
          </button>
        </>
      )}

      {step === "breathing" && (
        <>
          <p>{snapshot.breathing.title}</p>
          <p>{snapshot.breathing.body}</p>
          <p data-testid="breathing-timer" aria-label="Thời gian còn lại">
            {mm}:{ss}
          </p>
          {breath.paused ? (
            <button type="button" className="button" onClick={() => dispatch({ type: "resume", now: Date.now() })}>
              Tiếp tục thở
            </button>
          ) : (
            <button type="button" className="button" onClick={() => dispatch({ type: "pause", now: Date.now() })}>
              Tạm dừng
            </button>
          )}
          {audioUrl && !audioOn && (
            <button type="button" className="button" onClick={() => {
              setAudioFailed(false);
              setAudioOn(true);
            }}>
              Nghe âm thanh
            </button>
          )}
          {audioUrl && audioOn && (
            <audio
              key={audioKey}
              src={audioUrl}
              controls
              onPlay={() => track("audio_played", { ...base, practiceId })}
              onEnded={() => track("audio_completed", { ...base, practiceId })}
              onError={() => setAudioFailed(true)}
            />
          )}
          {audioFailed && (
            <p role="alert">
              Không phát được âm thanh. Bạn vẫn có thể đọc lời hướng dẫn ở trên.{" "}
              <button
                type="button"
                className="button"
                onClick={() => {
                  setAudioFailed(false);
                  setAudioKey((k) => k + 1);
                }}
              >
                Retry Audio
              </button>
            </p>
          )}
        </>
      )}

      {step === "reflection" && (
        <>
          <blockquote>
            <p>{snapshot.reflection.text}</p>
            <footer>{snapshot.reflection.attribution}</footer>
          </blockquote>
          <button type="button" className="button" onClick={next}>
            Tiếp tục
          </button>
        </>
      )}

      {step === "close" && (
        <>
          <p>Cảm ơn bạn đã dừng lại. Chúc bạn một ngày bình an.</p>
          <Link href="/" className="button">
            Về trang chủ
          </Link>
        </>
      )}

      {SKIPPABLE.includes(step) && (
        <button type="button" className="button" onClick={skip}>
          Bỏ qua
        </button>
      )}
      {step !== "close" && (
        <button type="button" className="button" onClick={() => dispatch({ type: "requestEnd" })}>
          Kết thúc chuyến ghé thăm
        </button>
      )}

      {state.confirmingEnd && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="end-confirm"
          onKeyDown={(e) => {
            if (e.key === "Escape") dispatch({ type: "cancelEnd" });
          }}
        >
          <p id="end-confirm">
            {END_CONFIRM_VI}
            <br />
            <span lang="en">{END_CONFIRM_EN}</span>
          </p>
          <button type="button" className="button" onClick={() => dispatch({ type: "confirmEnd" })}>
            Kết thúc
          </button>
          <button type="button" className="button" autoFocus onClick={() => dispatch({ type: "cancelEnd" })}>
            Ở lại
          </button>
        </div>
      )}
    </section>
  );
}

const SR_ONLY: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};
