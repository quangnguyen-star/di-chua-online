"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import styles from "./river.module.css";

export type RiverPhase = "writing" | "releasing" | "released";
export type LanternColor = "pink" | "gold" | "white";

export const lanternColors: { id: LanternColor; label: string }[] = [
  { id: "pink", label: "Hồng" },
  { id: "gold", label: "Vàng" },
  { id: "white", label: "Trắng" },
];

const FIELD_MAX = 12;
const FIELD_MIN = 3;
const SLOW_FRAME_MS = 30;
const SAMPLE_FRAMES = 60;
const NUDGE_DECAY = 0.96;
const RIPPLE_MS = 1400;
const WATER_TOP = 0.5;

/** Procedural lanterns: positions come from a fixed formula, so the field is scenery and never stands for other visitors. */
const FIELD = Array.from({ length: FIELD_MAX }, (_, i) => ({
  id: i,
  x: ((i * 37 + 11) % 100) / 100,
  y: 0.58 + ((i * 53) % 34) / 100,
  hue: (["pink", "gold", "white"] as const)[i % 3],
  delay: -((i * 7) % 11),
}));

type Ripple = { id: number; x: number; y: number };

type Props = {
  phase: RiverPhase;
  color: LanternColor;
  /** How long the drift lasts; only the visuals use it, the caller owns the clock. */
  driftMs: number;
  paused?: boolean;
  /** Fires when the lantern is dropped on the water (tap-to-light then drag). */
  onDrop?: () => void;
};

/** Night river overlay: the player's lantern, tap ripples, a drifting camera and a field of procedural lanterns. Takes no text. */
export function RiverScene({ phase, color, driftMs, paused = false, onDrop }: Props) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const lanternRef = useRef<HTMLSpanElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const nudge = useRef({ x: 0, v: 0 });
  const startedAt = useRef(0);
  const elapsed = useRef(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [density, setDensity] = useState(FIELD_MAX);
  const [reduced, setReduced] = useState(false);
  const [lit, setLit] = useState(false);
  const rippleId = useRef(0);
  const drag = useRef(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setReduced(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  }, []);

  useEffect(() => {
    if (phase === "writing") {
      setLit(false);
      setDragPos(null);
      elapsed.current = 0;
      nudge.current = { x: 0, v: 0 };
    }
  }, [phase]);

  // One loop for the drift, the nudge and the camera; it also samples frame time to thin the field on slow devices.
  useEffect(() => {
    if (phase === "writing" || reduced || paused) return;
    let raf = 0;
    let last = performance.now();
    startedAt.current = last - elapsed.current;
    let slow = 0;
    let frames = 0;
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      elapsed.current = now - startedAt.current;
      frames += 1;
      if (dt > SLOW_FRAME_MS) slow += 1;
      if (frames >= SAMPLE_FRAMES) {
        if (slow > frames / 3) setDensity((d) => Math.max(FIELD_MIN, d - 3));
        frames = 0;
        slow = 0;
      }
      const t = Math.min(1, elapsed.current / driftMs);
      const n = nudge.current;
      n.x += n.v;
      n.v *= NUDGE_DECAY;
      n.x *= 0.995;
      const lantern = lanternRef.current;
      const camera = cameraRef.current;
      if (lantern) {
        const x = 12 + t * 70 + n.x;
        const y = 70 - Math.sin(t * Math.PI) * 6 + Math.sin(elapsed.current / 900) * 0.6;
        lantern.style.left = `${x}%`;
        lantern.style.top = `${y}%`;
        lantern.style.opacity = String(t > 0.9 ? 1 - (t - 0.9) * 6 : 1);
        // The camera trails the lantern through the middle of the drift, then eases home as it blends into the field.
        const follow = Math.sin(t * Math.PI);
        if (camera) camera.style.transform = `translateX(${(-(x - 50) * follow * 0.5).toFixed(2)}%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, reduced, paused, driftMs]);

  const onWaterTap = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (phase === "writing" || paused) return;
    const box = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * 100;
    const y = ((e.clientY - box.top) / box.height) * 100;
    const id = (rippleId.current += 1);
    setRipples((r) => [...r.slice(-5), { id, x, y }]);
    window.setTimeout(() => setRipples((r) => r.filter((p) => p.id !== id)), RIPPLE_MS);
    const lantern = lanternRef.current;
    if (lantern && !reduced) {
      const lb = lantern.getBoundingClientRect();
      const dx = lb.left + lb.width / 2 - e.clientX;
      const reach = Math.max(0, 1 - Math.hypot(dx, lb.top - e.clientY) / 320);
      nudge.current.v += Math.sign(dx || 1) * reach * 0.12;
    }
  };

  const light = () => {
    if (phase === "writing") setLit(true);
  };

  const startDrag = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!lit || phase !== "writing") return;
    const box = sceneRef.current?.getBoundingClientRect();
    if (!box) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = true;
    setDragPos({ x: ((e.clientX - box.left) / box.width) * 100, y: ((e.clientY - box.top) / box.height) * 100 });
  };
  const moveDrag = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const box = sceneRef.current?.getBoundingClientRect();
    if (!drag.current || !box) return;
    setDragPos({ x: ((e.clientX - box.left) / box.width) * 100, y: ((e.clientY - box.top) / box.height) * 100 });
  };
  const endDrag = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const box = sceneRef.current?.getBoundingClientRect();
    if (!drag.current || !box) return;
    drag.current = false;
    const y = (e.clientY - box.top) / box.height;
    setDragPos(null);
    if (y > WATER_TOP) onDrop?.();
  };

  const shown = FIELD.slice(0, density);
  const settled = phase === "released";

  return (
    <div ref={sceneRef} className={styles.scene} data-phase={phase} data-reduced={reduced} data-testid="lantern-scene">
      <div ref={cameraRef} className={styles.camera} aria-hidden="true">
        {shown.map((l) => (
          <span
            key={l.id}
            className={`${styles.light} ${styles[l.hue]}`}
            data-testid="river-field-lantern"
            style={{ left: `${l.x * 100}%`, top: `${l.y * 100}%`, animationDelay: `${l.delay}s` }}
          />
        ))}
        {phase !== "writing" && (
          <span
            ref={lanternRef}
            className={`${styles.lantern} ${styles[color]} ${settled ? styles.blended : ""}`}
            data-testid="river-lantern"
            style={reduced ? { left: settled ? "82%" : "14%", top: "68%" } : undefined}
          >
            <span className={styles.soak} />
          </span>
        )}
      </div>
      {phase !== "writing" && <div className={styles.water} onPointerDown={onWaterTap} data-testid="river-water" aria-hidden="true" />}
      {ripples.map((r) => (
        <span key={r.id} className={styles.ripple} style={{ left: `${r.x}%`, top: `${r.y}%` }} data-testid="river-ripple" aria-hidden="true" />
      ))}
      {phase === "writing" && (
        <button
          type="button"
          className={`${styles.pickup} ${styles[color]} ${lit ? styles.lit : ""}`}
          style={dragPos ? { left: `${dragPos.x}%`, top: `${dragPos.y}%`, bottom: "auto" } : undefined}
          data-testid="river-lantern-draft"
          aria-label={lit ? "Ngọn đèn đã sáng. Kéo xuống mặt nước để thả" : "Chạm để thắp đèn"}
          onClick={light}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        />
      )}
    </div>
  );
}
