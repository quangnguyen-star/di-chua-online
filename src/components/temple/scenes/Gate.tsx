"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Embed } from "@/lib/visit/embed";
import styles from "./gate.module.css";

const INHALE_MS = 4000;
const EXHALE_MS = 6000;
const BREATHS = 3;
/** A breath counts when the inhale got at least this far before release. */
const COUNT_AT = 0.75;
const DOLLY_MS = 1400;
const MAX_ZOOM = 0.22;

type Props = {
  embed?: Embed;
  /** Hands over to the visit shell's next stop; called once the dolly into the courtyard ends. */
  onNext?: () => void;
};

const prefersReduced = () => typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Stop 1: hold to inhale as the mist parts, release to exhale; three breaths open the middle gate. */
export default function Gate({ embed, onNext }: Props) {
  const paused = embed?.paused ?? false;
  const [holding, setHolding] = useState(false);
  const [breaths, setBreaths] = useState(0);
  const [stepping, setStepping] = useState(false);
  const [reduced, setReduced] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const level = useRef(0);
  const peak = useRef(0);
  const holdRef = useRef(false);
  const pointer = useRef({ x: 0, y: 0, seen: false });
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const breathsRef = useRef(0);
  const steppingRef = useRef(false);
  const doneRef = useRef(false);
  const dollyStart = useRef<number | null>(null);
  const onNextRef = useRef(onNext);
  onNextRef.current = onNext;

  const ready = breaths >= BREATHS;

  useEffect(() => {
    setReduced(prefersReduced());
  }, []);

  const paint = useCallback((still: boolean, dolly: number) => {
    const l = level.current;
    const shown = still ? breathsRef.current / BREATHS : l;
    if (mistRef.current) mistRef.current.style.opacity = String(0.85 - 0.8 * shown);
    if (cameraRef.current) cameraRef.current.style.transform = `scale(${1 + (still ? 0 : MAX_ZOOM * l) + dolly * 1.4})`;
    const ring = ringRef.current;
    if (ring) {
      ring.style.transform = `translate(${pointer.current.x}px, ${pointer.current.y}px) scale(${0.55 + 0.9 * l})`;
      ring.style.opacity = pointer.current.seen && !steppingRef.current ? String(0.35 + 0.6 * l) : "0";
    }
  }, []);

  useEffect(() => {
    const still = reduced;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      if (!pausedRef.current) {
        const before = level.current;
        if (holdRef.current && !steppingRef.current && !doneRef.current) {
          level.current = Math.min(1, before + dt / INHALE_MS);
          peak.current = Math.max(peak.current, level.current);
        } else {
          level.current = Math.max(0, before - dt / EXHALE_MS);
          if (before > 0 && level.current === 0 && !holdRef.current) {
            if (peak.current >= COUNT_AT && !doneRef.current) {
              breathsRef.current += 1;
              setBreaths(breathsRef.current);
              if (breathsRef.current >= BREATHS) doneRef.current = true;
            }
            peak.current = 0;
          }
        }
        if (steppingRef.current) {
          dollyStart.current ??= now;
          const t = Math.min(1, (now - dollyStart.current) / (still ? 1 : DOLLY_MS));
          paint(still, t * t);
          if (t >= 1) {
            steppingRef.current = false;
            onNextRef.current?.();
            return;
          }
        } else {
          paint(still, 0);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, paint]);

  const setHold = useCallback((on: boolean) => {
    if (on && (doneRef.current || steppingRef.current)) return;
    holdRef.current = on;
    setHolding(on);
  }, []);

  const track = (e: React.PointerEvent) => {
    const box = rootRef.current?.getBoundingClientRect();
    if (!box) return;
    pointer.current = { x: e.clientX - box.left, y: e.clientY - box.top, seen: true };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    track(e);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setHold(true);
  };
  const release = () => setHold(false);

  useEffect(() => {
    const isButton = (t: EventTarget | null) => t instanceof HTMLElement && t.closest("button, input, textarea, select") !== null;
    const down = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat || isButton(e.target)) return;
      e.preventDefault();
      if (!pointer.current.seen) {
        const box = rootRef.current?.getBoundingClientRect();
        if (box) pointer.current = { x: box.width / 2, y: box.height * 0.58, seen: true };
      }
      setHold(true);
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") setHold(false);
    };
    const blur = () => setHold(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      holdRef.current = false;
      steppingRef.current = false;
    };
  }, [setHold]);

  const step = () => {
    if (!ready || steppingRef.current) return;
    steppingRef.current = true;
    dollyStart.current = null;
    setStepping(true);
    holdRef.current = false;
    setHolding(false);
  };

  const cue = ready ? "Cổng giữa đã mở." : holding ? "Hít vào…" : breaths > 0 ? "Thở ra…" : "Giữ để hít vào";

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-testid="gate"
      data-breaths={breaths}
      data-holding={holding}
      data-ready={ready}
      onPointerDown={onPointerDown}
      onPointerMove={track}
      onPointerUp={release}
      onPointerCancel={release}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div ref={cameraRef} className={styles.camera} aria-hidden="true">
        <div className={styles.gates}>
          <div className={styles.passage} />
          <div className={`${styles.passage} ${styles.middle} ${ready ? styles.lit : ""}`} data-testid="gate-middle" data-lit={ready}>
            <div className={styles.glow} />
          </div>
          <div className={styles.passage} />
        </div>
        <div ref={mistRef} className={styles.mist} />
      </div>
      <div ref={ringRef} className={styles.ring} aria-hidden="true" data-testid="gate-ring" />

      <div className={styles.panel}>
        <p className={styles.cue} aria-live="polite" data-testid="gate-cue">
          {cue}
        </p>
        <ol className={styles.count} aria-label={`${breaths} trên ${BREATHS} hơi thở`} data-testid="gate-count">
          {Array.from({ length: BREATHS }, (_, i) => (
            <li key={i} className={`${styles.dot} ${i < breaths ? styles.dotOn : ""}`} data-on={i < breaths} />
          ))}
        </ol>
        {ready ? (
          <button type="button" className={styles.step} onClick={step} disabled={stepping} data-testid="gate-step">
            Bước qua cổng
          </button>
        ) : (
          <p className={styles.hint} data-testid="gate-hint">
            Nhấn giữ chuột hoặc ngón tay, hoặc giữ phím Space để hít vào 4 nhịp; thả ra để thở ra 6 nhịp.
          </p>
        )}
        <p className={styles.headphones} data-testid="gate-headphones">
          Nếu có thể, hãy đeo tai nghe để nghe rõ tiếng chùa.
        </p>
      </div>
    </div>
  );
}
