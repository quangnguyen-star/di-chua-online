"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { visitStages } from "@/content";
import { useAtmosphere, type Scene } from "@/components/atmosphere";
import { SceneStage } from "@/components/temple/stage";
import { useVisit } from "@/lib/visit/useVisit";
import { VisitFailure } from "./VisitErrorBoundary";
import StopActivity, { embeddedStops } from "./StopActivity";
import { UNMOUNT_AFTER_MS } from "./crossfade";
import { StageHandleProvider } from "./StageZones";
import { withHandle, type StageHandles } from "./stageHandles";
import styles from "./visit.module.css";

const HUD_IDLE_MS = 3000;
const SUBTITLE_MS = 6000;
const SWIPE_MIN_PX = 70;
const verandaIndex = visitStages.findIndex((s) => s.id === "veranda");

const stageScene: Record<string, Scene> = {
  gate: "gate",
  courtyard: "courtyard",
  hall: "hall",
  pond: "pond",
  veranda: "veranda",
  outside: "outside",
};

/*
 * Navigation rule: while a stop runs in the tour, ArrowRight / swipe left go on and ArrowLeft / swipe right go back.
 * An activity that claims a key (the courtyard sweep claims both arrows and calls preventDefault) wins, so there the
 * shell skips swipe and the labeled "Đi tiếp" button, always shown, is the way on. Typing never navigates.
 */
const isEditable = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

type Props = { single: boolean; startIndex: number };

/** The full-viewport visit: the shell owns the clock, HUD and navigation; activities render inside it. */
export default function VisitShell({ single: singleStart, startIndex }: Props) {
  const router = useRouter();
  const { soundOn, enable, disable, scene, cue } = useAtmosphere();
  const [single, setSingle] = useState(singleStart);
  const [singleEnded, setSingleEnded] = useState(false);
  const [untimed, setUntimed] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [hudIdle, setHudIdle] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [fadingOut, setFadingOut] = useState<number | null>(null);
  const [subtitleOn, setSubtitleOn] = useState(true);
  const [handles, setHandles] = useState<StageHandles>({});
  const inputSeen = useRef(false);
  const { state, begin, next, prev, stay, exit } = useVisit(visitStages, { startIndex, untimed });
  const { phase, stageIndex, activeMs, due, nudge } = state;
  const stage = visitStages[stageIndex];

  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const closingRef = useRef<HTMLHeadingElement>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const lastIndex = useRef(stageIndex);

  const poke = useCallback(() => {
    setHudIdle(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setHudIdle(true), HUD_IDLE_MS);
  }, []);

  useEffect(() => {
    poke();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [poke]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setCanFullscreen(Boolean(document.fullscreenEnabled));
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("fullscreenchange", onChange);
    };
  }, []);

  useEffect(() => {
    if (lastIndex.current !== stageIndex) {
      setFadingOut(lastIndex.current);
      lastIndex.current = stageIndex;
      const id = setTimeout(() => setFadingOut(null), UNMOUNT_AFTER_MS);
      return () => clearTimeout(id);
    }
  }, [stageIndex]);

  // The stop subtitle shows ~6s on entry, then fades; once the visitor has acted it stays hidden.
  useEffect(() => {
    setSubtitleOn(!inputSeen.current);
    if (inputSeen.current) return;
    const id = setTimeout(() => setSubtitleOn(false), SUBTITLE_MS);
    return () => clearTimeout(id);
  }, [stageIndex]);

  // Every stop change returns to the top and moves focus to the stop heading.
  useEffect(() => {
    window.scrollTo(0, 0);
    titleRef.current?.focus({ preventScroll: true });
  }, [stageIndex]);

  const stageId = stage?.id;
  useEffect(() => {
    if (stageId) scene(stageScene[stageId] ?? "gate");
  }, [stageId, scene]);

  // The next stop's stage engine is fetched ahead so the cross-fade never waits on it.
  useEffect(() => {
    void import("pixi.js");
  }, [stageIndex]);

  // Small bell marks only the nudge.
  const nudgeShown = due && nudge === "shown";
  useEffect(() => {
    if (nudgeShown && soundOn) cue("bell");
  }, [nudgeShown, soundOn, cue]);

  // Large bell: once on entering, once at the end.
  const enterRung = useRef(false);
  useEffect(() => {
    if (!soundOn || enterRung.current) return;
    enterRung.current = true;
    cue("bigBell", { intensity: 0.7 });
  }, [soundOn, cue]);

  const finished = phase === "complete" && !leaving;
  const endRung = useRef(false);
  useEffect(() => {
    if (!finished || !soundOn || endRung.current) return;
    endRung.current = true;
    cue("bigBell");
  }, [finished, soundOn, cue]);
  useEffect(() => {
    if (finished) closingRef.current?.focus({ preventScroll: true });
  }, [finished]);

  const leave = useCallback(() => {
    setLeaving(true);
    exit();
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    router.push("/");
  }, [exit, router]);

  const advance = useCallback(() => {
    if (single) setSingleEnded(true);
    else next();
  }, [single, next]);

  const canNavigate = !single && !untimed && phase === "running";
  const claimsArrows = stage?.id === "courtyard";
  const showNudge = canNavigate && due && nudge === "shown";
  const showArrow = canNavigate && !showNudge && ((due && nudge !== "idle") || claimsArrows);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      inputSeen.current = true;
      setSubtitleOn(false);
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "Escape") {
        leave();
        return;
      }
      if (!canNavigate || isEditable(e.target)) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        advance();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canNavigate, leave, advance, prev]);

  if (!stage) return <VisitFailure onRetry={() => router.refresh()} />;

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void rootRef.current?.requestFullscreen().catch(() => {});
  };

  const onPointerDown = (e: React.PointerEvent) => {
    poke();
    inputSeen.current = true;
    setSubtitleOn(false);
    swipeStart.current = canNavigate && !claimsArrows && !isEditable(e.target) ? { x: e.clientX, y: e.clientY } : null;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || !canNavigate) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dy) > Math.abs(dx) / 2) return;
    if (dx < 0) advance();
    else prev();
  };

  const nextStage = visitStages[stageIndex + 1];
  const embedded = (embeddedStops as readonly string[]).includes(stage.id);
  const frozen = phase !== "running";
  const stopEnd = single && (singleEnded || (due && phase !== "complete"));
  const closing = finished && !single;
  const leavingStage = fadingOut === null ? undefined : visitStages[fadingOut];

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-testid="visit-shell"
      data-phase={phase}
      data-stop={stage.id}
      onPointerMove={poke}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onTouchStart={poke}
    >
      {leavingStage && (
        <div className={`${styles.layer} ${styles.leave}`} aria-hidden="true" data-testid="visit-leaving">
          <SceneStage place={leavingStage.id} paused onHandle={(h) => setHandles((m) => withHandle(m, leavingStage.id, h))} />
        </div>
      )}
      <div key={stage.id} className={`${styles.layer} ${fadingOut === null ? "" : styles.enter}`} data-testid="visit-stage-layer">
        <SceneStage place={stage.id} paused={frozen} onHandle={(h) => setHandles((m) => withHandle(m, stage.id, h))} />
        {embedded && (
          <div className={styles.activity} data-testid="visit-activity" data-stop={stage.id}>
            <StageHandleProvider value={{ handle: handles[stage.id] ?? null, handleFor: (id) => handles[id] ?? null }}>
              <StopActivity key={stage.id} stopId={stage.id} seconds={stage.config.seconds} paused={frozen} onNext={advance} />
            </StageHandleProvider>
          </div>
        )}
      </div>

      <div className={styles.subtitle} data-visible={subtitleOn && !showNudge} data-testid="visit-subtitle-band">
        <p aria-live="polite" data-testid="visit-subtitle">
          {stage.prompt}
        </p>
      </div>

      {showNudge && (
        <div className={styles.nudge} role="group" aria-label="Đi tiếp" data-testid="visit-nudge">
          <button type="button" onClick={advance} data-testid="visit-nudge-next">
            Sẵn sàng thì đi tiếp → {nextStage ? nextStage.label : "khép chuyến đi"}
          </button>
          <button type="button" onClick={stay} data-testid="visit-nudge-stay">
            Ở lại thêm chút
          </button>
        </div>
      )}
      {showArrow && (
        <button type="button" className={styles.arrow} onClick={advance} aria-label="Đi tiếp" data-testid="visit-nudge-arrow">
          →
        </button>
      )}

      <div className={styles.hud} data-idle={hudIdle && !closing && !stopEnd} onFocus={poke} data-testid="visit-hud">
        <div className={styles.top}>
          <h1 ref={titleRef} className={styles.where} tabIndex={-1} data-testid="visit-where">
            {stageIndex + 1}/{visitStages.length} · {stage.label}
          </h1>
          <div className={styles.tools}>
            <button type="button" className={styles.tool} aria-pressed={soundOn} onClick={soundOn ? disable : enable} data-testid="visit-sound">
              {soundOn ? "Tắt tiếng" : "Bật âm thanh"}
            </button>
            {canFullscreen && (
              <button type="button" className={styles.tool} aria-pressed={fullscreen} onClick={toggleFullscreen} data-testid="visit-fullscreen">
                {fullscreen ? "Thu nhỏ" : "Toàn màn hình"}
              </button>
            )}
            <button type="button" className={styles.tool} onClick={leave} data-testid="visit-exit">
              Thoát
            </button>
          </div>
        </div>
        <ol className={styles.bar} aria-label="Tiến trình chuyến ghé thăm" data-testid="visit-progress">
          {visitStages.map((s, i) => {
            const fill = i < stageIndex ? 1 : i === stageIndex ? Math.min(1, activeMs / (s.seconds * 1000)) : 0;
            return (
              <li key={s.id} className={styles.seg} data-testid={`visit-seg-${s.id}`}>
                <span className={styles.segFill} style={{ transform: `scaleX(${untimed && i === stageIndex ? 0 : fill})` }} />
              </li>
            );
          })}
        </ol>
      </div>

      {stopEnd && (
        <div className={styles.closing} role="group" aria-label={`Kết thúc ${stage.label}`} data-testid="stop-end">
          <h2>{stage.label}</h2>
          <div className={styles.choices}>
            <button
              type="button"
              className={styles.primary}
              data-testid="stop-tour"
              onClick={() => {
                setSingle(false);
                setSingleEnded(false);
                next();
              }}
            >
              Đi tiếp cả chuyến
            </button>
            <Link href="/" data-testid="stop-map">
              Về bản đồ
            </Link>
          </div>
        </div>
      )}

      {closing && (
        <div className={styles.closing} data-testid="visit-closing">
          <h2 ref={closingRef} tabIndex={-1} data-testid="visit-complete">
            Chuyến ghé thăm đã khép lại
          </h2>
          <p>Mang theo sự yên ổn này vào phần còn lại của ngày.</p>
          <div className={styles.choices}>
            <button
              type="button"
              data-testid="visit-sit"
              onClick={() => {
                setUntimed(true);
                begin(verandaIndex);
              }}
            >
              Ngồi yên thêm
            </button>
            <button type="button" className={styles.primary} data-testid="visit-home" onClick={leave}>
              Về trang chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
