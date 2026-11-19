"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAtmosphere } from "@/components/atmosphere";
import { SceneStage } from "@/components/temple/stage";
import { SceneLinks } from "@/components/temple/map/SceneLinks";
import { useActivity } from "@/lib/activity/useActivity";
import type { Embed } from "@/lib/visit/embed";
import { DEFAULT_STICK, FLICK_SPEED, LIGHT_HOLD_MS, burnProgress, incenseActivity, markSpent, phaseLabels, readSpent } from "./incense";
import styles from "./hall.module.css";

const SMOKE_CAP = 70;
const PUSH_RADIUS = 90;
const PLACED_STICKS = [18, 30, 42, 58, 70, 82];
const STICK_FULL = 5.2;

type Puff = { x: number; y: number; vx: number; vy: number; life: number };

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
  const smokeRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: -999, y: -999, t: 0, seen: false });
  const holdTimer = useRef<number | null>(null);
  const puffs = useRef<Puff[]>([]);
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

  useEffect(() => {
    const canvas = smokeRef.current;
    if (!canvas || !running || reduced) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50) / 16;
      last = now;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const tip = rootRef.current?.querySelector<HTMLElement>("[data-testid=hall-ember]")?.getBoundingClientRect();
      const box = canvas.getBoundingClientRect();
      const burning = phaseRef.current === "burning";
      const source = burning && tip ? { x: tip.left - box.left, y: tip.top - box.top } : { x: w * 0.5, y: h * 0.7 };
      if (puffs.current.length < SMOKE_CAP && Math.random() < (burning ? 0.8 : 0.35)) {
        puffs.current.push({ x: source.x + (Math.random() - 0.5) * 8, y: source.y, vx: (Math.random() - 0.5) * 0.3, vy: -0.5 - Math.random() * 0.4, life: 1 });
      }
      ctx.clearRect(0, 0, w, h);
      const p = pointer.current;
      puffs.current = puffs.current.filter((s) => {
        const dx = s.x - p.x;
        const dy = s.y - p.y;
        const d = Math.hypot(dx, dy);
        if (p.seen && d < PUSH_RADIUS && d > 0) {
          const push = (1 - d / PUSH_RADIUS) * 0.6;
          s.vx += (dx / d) * push;
          s.vy += (dy / d) * push * 0.4;
        }
        s.vx = s.vx * 0.97 + Math.sin(now / 700 + s.y / 40) * 0.01;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= 0.006 * dt;
        if (s.life <= 0) return false;
        ctx.fillStyle = `rgba(230, 225, 215, ${0.22 * s.life})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 4 + (1 - s.life) * 10, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, reduced]);

  const hint =
    phase === "ready"
      ? "Chạm vào nén hương có viền sáng để rút ra."
      : phase === "pulled"
        ? "Giữ nén hương bên ngọn đèn khoảng hai giây."
        : lit
          ? "Phẩy nhanh qua ngọn lửa để tắt, tàn hương vẫn đỏ."
          : phase === "placed"
            ? "Nén hương đã nằm trong lư."
            : "Chạm vào lư để đặt nén hương xuống.";

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
        <canvas ref={smokeRef} className={styles.smoke} aria-hidden="true" data-testid="hall-smoke" />
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
    <div className={styles.controls}>
      {(phase === "ready" || phase === "pulled") && (
        <button type="button" className="button" onClick={light} data-testid="incense-light">
          Thắp nhang
        </button>
      )}
      {lit && (
        <button type="button" className="button button--quiet" onClick={extinguish} data-testid="incense-extinguish">
          Tắt lửa
        </button>
      )}
      {(phase === "extinguished" || phase === "spent") && (
        <button type="button" className="button" onClick={place} data-testid="incense-place">
          Đặt nhang vào lư
        </button>
      )}
    </div>
  );

  const status = (
    <>
      <p className={styles.hint} role="status" data-testid="incense-state">
        {phaseLabels[phase]}
      </p>
      <p className={styles.hint} aria-hidden="true" data-testid="incense-hint">
        {hint}
      </p>
      {spentBefore && phase === "ready" && (
        <p className={styles.hint} data-testid="incense-spent-note">
          Một nén hương đã được đặt ở đây trước đó.
        </p>
      )}
    </>
  );

  if (embed) {
    return (
      <div className={styles.fullscreen} data-testid="incense-page" data-phase={phase}>
        {body}
        <div className={styles.panel}>
          {status}
          {controls}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page} data-testid="incense-page" data-phase={phase}>
      <h1>Thắp nhang</h1>
      <div className={styles.frame}>
        <SceneStage place="hall" paused={!running} />
        {body}
      </div>
      {status}
      {controls}
      <div className={styles.controls}>
        <Link className="button button--quiet" href="/" data-testid="incense-leave">
          Rời đi
        </Link>
      </div>
      <SceneLinks from="hall" />
    </div>
  );
}
