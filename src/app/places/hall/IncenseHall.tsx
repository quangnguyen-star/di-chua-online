"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAtmosphere } from "@/components/atmosphere";
import { SceneStage } from "@/components/temple/stage";
import { SceneLinks } from "@/components/temple/map/SceneLinks";
import { useActivity } from "@/lib/activity/useActivity";
import type { Embed } from "@/lib/visit/embed";
import { DEFAULT_STICK, FLICK_SPEED, LIGHT_HOLD_MS, burnProgress, incenseActivity, markSpent, phaseLabels, readSpent } from "./incense";
import { Smoke } from "@/components/temple/smoke";
import StageZones from "@/components/visit/StageZones";
import { useInstruction } from "@/components/visit/useInstruction";
import styles from "./hall.module.css";

const PLACED_STICKS = [18, 30, 42, 58, 70, 82];
const STICK_FULL = 5.2;

const prefersReduced = () => typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Stop 3: pull your stick from the bowl, hold it at the lamp, flick the flame out, and place the ember back. */
export default function IncenseHall({ embed }: { embed?: Embed } = {}) {
  const { scene } = useAtmosphere();
  const seconds = embed?.seconds ?? DEFAULT_STICK;
  const tourPaused = embed?.paused ?? false;
  const { state, send, pause, resume } = useActivity(incenseActivity, { seconds });
  const { phase, remainingMs } = state;
  const [spentBefore, setSpentBefore] = useState(false);
  const [holding, setHolding] = useState(false);
  const [reduced, setReduced] = useState(false);
  const frozenByTour = useRef(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: -999, y: -999, t: 0, seen: false });
  const holdTimer = useRef<number | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    scene("hall");
  }, [scene]);

  useEffect(() => {
    setSpentBefore(readSpent());
    setReduced(prefersReduced());
  }, []);

  useEffect(() => {
    const onHide = () => {
      if (document.hidden) send({ type: "pause" });
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [send]);

  // Embedded, the tour clock decides: freeze the burn with it and resume only what the tour froze.
  useEffect(() => {
    if (!embed) return;
    if (tourPaused && phase === "burning") {
      frozenByTour.current = true;
      send({ type: "pause" });
      pause();
    } else if (!tourPaused && frozenByTour.current && phase === "paused") {
      frozenByTour.current = false;
      send({ type: "resume" });
      resume();
    }
  }, [embed, tourPaused, phase, send, pause, resume]);

  const cancelHold = useCallback(() => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
    setHolding(false);
  }, []);

  useEffect(() => cancelHold, [cancelHold]);

  const pull = () => {
    if (phaseRef.current === "ready") send({ type: "pull" });
  };
  const light = () => {
    if (phaseRef.current !== "ready" && phaseRef.current !== "pulled") return;
    cancelHold();
    send({ type: "light" });
    resume();
  };
  const extinguish = () => {
    if (phaseRef.current !== "burning" && phaseRef.current !== "paused") return;
    send({ type: "extinguish" });
    pause();
  };
  const place = () => {
    if (phaseRef.current !== "extinguished" && phaseRef.current !== "spent") return;
    markSpent();
    setSpentBefore(true);
    send({ type: "place" });
  };

  const startHold = () => {
    if (phaseRef.current !== "pulled" || holdTimer.current !== null || tourPaused) return;
    setHolding(true);
    holdTimer.current = window.setTimeout(light, reduced ? 0 : LIGHT_HOLD_MS);
  };

  const track = (e: React.PointerEvent) => {
    const box = rootRef.current?.getBoundingClientRect();
    if (!box) return;
    const now = performance.now();
    const prev = pointer.current;
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    if (prev.seen && phaseRef.current === "burning" && !tourPaused) {
      const dt = Math.max(1, now - prev.t);
      const speed = Math.hypot(x - prev.x, y - prev.y) / dt;
      const flame = rootRef.current?.querySelector<HTMLElement>("[data-testid=hall-stick]")?.getBoundingClientRect();
      const near = flame && e.clientX > flame.left - 60 && e.clientX < flame.right + 60 && e.clientY > flame.top - 60 && e.clientY < flame.bottom + 60;
      if (speed >= FLICK_SPEED && near) extinguish();
    }
    pointer.current = { x, y, t: now, seen: true };
  };

  const running = !tourPaused;
  const lit = phase === "burning" || phase === "paused";
  const progress = burnProgress(remainingMs, seconds);
  const length = phase === "placed" ? 1.6 : lit || phase === "extinguished" || phase === "pulled" ? STICK_FULL * (1 - progress) + 1.2 : STICK_FULL;
  const ember = lit || phase === "extinguished";

  const instruction = useInstruction([phase === "ready" && spentBefore ? `${phaseLabels.ready} Một nén hương đã được đặt ở đây trước đó.` : phaseLabels[phase]]);
  const replayInstruction = instruction.replay;
  useEffect(() => {
    replayInstruction();
  }, [phase, replayInstruction]);

  const body = (
    <div
      ref={rootRef}
      className={styles.hall}
      data-testid="hall-room"
      data-phase={phase}
      onPointerMove={track}
      onPointerLeave={() => {
        pointer.current = { ...pointer.current, seen: false };
      }}
    >
      <div className={`${styles.camera} ${phase === "placed" ? styles.tilted : ""}`} data-testid="hall-camera" data-tilted={phase === "placed"}>
        <div className={styles.altar} aria-hidden="true">
          <span className={styles.halo} />
          <span className={styles.buddha} data-testid="hall-buddha" />
        </div>
        <div className={styles.smoke} style={{ bottom: `calc(8% + 3.2rem + ${length}rem)` }} data-testid="hall-smoke">
          <Smoke lit={lit} paused={phase === "paused" || !running} intensity={0.6} />
        </div>
        <button
          type="button"
          className={`${styles.lamp} ${holding ? styles.lampHeld : ""}`}
          aria-label="Ngọn đèn dầu: giữ nén hương bên đèn"
          disabled={phase !== "pulled"}
          data-testid="hall-lamp"
          data-holding={holding}
          onPointerDown={startHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onPointerCancel={cancelHold}
          onContextMenu={(e) => e.preventDefault()}
        >
          <span className={styles.flame} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={styles.bowl}
          aria-label="Lư hương: đặt nén hương vào lư"
          disabled={phase !== "extinguished" && phase !== "spent"}
          onClick={place}
          data-testid="hall-bowl"
        >
          {PLACED_STICKS.map((x) => (
            <span key={x} className={styles.placed} style={{ left: `${x}%` }} aria-hidden="true" />
          ))}
          {spentBefore && phase !== "placed" && <span className={styles.residue} aria-hidden="true" data-testid="hall-residue" />}
        </button>
        <button
          type="button"
          className={`${styles.stick} ${styles[`stick_${phase}`] ?? ""}`}
          style={{ height: `${length}rem` }}
          aria-label="Nén hương của bạn"
          disabled={phase !== "ready"}
          onClick={pull}
          data-testid="hall-stick"
          data-length={length.toFixed(2)}
        >
          {ember && <span className={`${styles.ember} ${phase === "extinguished" ? styles.emberDim : ""}`} aria-hidden="true" data-testid="hall-ember" />}
        </button>
      </div>
      <div className={styles.vignette} aria-hidden="true" />
    </div>
  );

  const controls = (
    <>
      {(phase === "ready" || phase === "pulled") && (
        <button type="button" onClick={light} data-testid="incense-light">
          Thắp nhang
        </button>
      )}
      {lit && (
        <button type="button" onClick={extinguish} data-testid="incense-extinguish">
          Tắt lửa
        </button>
      )}
      {(phase === "extinguished" || phase === "spent") && (
        <button type="button" onClick={place} data-testid="incense-place">
          Đặt nhang vào lư
        </button>
      )}
    </>
  );

  const zones = (
    <StageZones instruction={instruction} actions={controls}>
      <span className={styles.srOnly} role="status" data-testid="incense-state">
        {phaseLabels[phase]}
      </span>
      {spentBefore && phase === "ready" && (
        <span className={styles.srOnly} data-testid="incense-spent-note">
          Một nén hương đã được đặt ở đây trước đó.
        </span>
      )}
    </StageZones>
  );

  if (embed) {
    return (
      <div className={styles.fullscreen} data-testid="incense-page" data-phase={phase}>
        {body}
        {zones}
      </div>
    );
  }

  return (
    <div className={styles.page} data-testid="incense-page" data-phase={phase}>
      <h1>Thắp nhang</h1>
      <div className={styles.frame}>
        <SceneStage place="hall" paused={!running} />
        {body}
        {zones}
      </div>
      <div className={styles.controls}>
        <Link className="button button--quiet" href="/" data-testid="incense-leave">
          Rời đi
        </Link>
      </div>
      <SceneLinks from="hall" />
    </div>
  );
}
