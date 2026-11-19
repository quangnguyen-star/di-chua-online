"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { routes } from "@/content/routes";
import { useAtmosphere } from "@/components/atmosphere";
import { useActivity, type ActivityDefinition } from "@/lib/activity/useActivity";
import { ArtCanvas, Ground, PaperTexture, Sky } from "@/components/temple/art";
import {
  CLEARED_LINE,
  PILE,
  PILE_CAP,
  WIND_PAUSE_SECONDS,
  canCue,
  freshState,
  isBroomAtRest,
  isComplete,
  isWaiting,
  reduceSweep,
  remaining,
  stepBroom,
  tickSweep,
  type Broom,
  type SweepEvent,
  type SweepState,
} from "./logic";
import { SceneLinks } from "@/components/temple/map/SceneLinks";
import styles from "./sweeping.module.css";

const definition: ActivityDefinition<SweepState, SweepEvent> = {
  initial: () => freshState,
  reduce: reduceSweep,
  tick: tickSweep,
  seconds: WIND_PAUSE_SECONDS,
};

const courtyard = routes.find((r) => r.id === "courtyard");
const nextPlace = routes.find((r) => r.id === courtyard?.next && r.ready);

const STONES = Array.from({ length: 5 }, (_, row) =>
  Array.from({ length: 8 }, (_, col) => ({ key: `${row}-${col}`, x: col * 50 + (row % 2) * 25 - 25, y: 120 + row * 24 })),
).flat();

function Helper({ x, label }: { x: number; label: string }) {
  return (
    <g transform={`translate(${x} 110)`} data-testid="sweep-helper">
      <title>{label}</title>
      <path className={styles.robe} d="M-9 34 Q-11 12 0 6 Q11 12 9 34 Z" />
      <circle className={styles.head} cx="0" cy="0" r="6" />
      <line className={styles.handle} x1="10" y1="32" x2="22" y2="8" />
    </g>
  );
}

export default function Sweeping() {
  const { state, send, resume } = useActivity(definition);
  const { scene, cue } = useAtmosphere();
  const yard = useRef<HTMLDivElement>(null);
  const broomEl = useRef<HTMLSpanElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const broom = useRef<Broom>({ x: 50, y: 50, vx: 0, vy: 0 });
  const target = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef<number | null>(null);
  const lastFrame = useRef(0);
  const lastCue = useRef<number | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    scene("courtyard");
  }, [scene]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);

  // Reduced motion: no animated sweeping, every set is cleared immediately.
  useEffect(() => {
    if (reduced && !isComplete(state)) send({ type: "pass" });
  }, [reduced, state, send]);

  // The quiet pause only runs while the set is cleared; hidden tabs pause it via useActivity.
  const waiting = isWaiting(state);
  useEffect(() => {
    if (waiting) resume();
  }, [waiting, resume]);

  const cueSweep = () => {
    const now = Date.now();
    if (!canCue(now, lastCue.current)) return;
    lastCue.current = now;
    cue("sweep");
  };

  const apply = (event: SweepEvent) => {
    const before = stateRef.current;
    send(event);
    if (stateRef.current !== before || event.type !== "sweep") cueSweep();
  };

  const place = () => {
    const el = broomEl.current;
    if (el) {
      el.style.left = `${broom.current.x}%`;
      el.style.top = `${broom.current.y}%`;
    }
  };

  const animate = (time: number) => {
    const dt = lastFrame.current ? (time - lastFrame.current) / 1000 : 0.016;
    lastFrame.current = time;
    const from = broom.current;
    const to = stepBroom(from, target.current, dt);
    broom.current = to;
    place();
    const before = stateRef.current;
    send({ type: "path", from, to });
    if (stateRef.current !== before) cueSweep();
    if (target.current === null && isBroomAtRest(broom.current, null)) {
      frame.current = null;
      lastFrame.current = 0;
      return;
    }
    frame.current = requestAnimationFrame(animate);
  };

  const startLoop = () => {
    if (reduced || frame.current !== null) return;
    frame.current = requestAnimationFrame(animate);
  };

  const pointToTarget = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = yard.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return null;
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    };
  };

  const done = isComplete(state);

  return (
    <div className={styles.root} data-testid="sweep-root">
      <h1>Quét sân</h1>
      <p className={styles.prompt}>
        Kéo ngón tay hoặc con trỏ qua sân để quét lá, hoặc dùng nút &ldquo;Quét một nhịp&rdquo;. Không tính giờ, không điểm.
      </p>
      <PaperTexture className={styles.frame}>
        <div
          ref={yard}
          className={styles.yard}
          data-testid="sweep-yard"
          onPointerDown={(e) => {
            if (reduced) return;
            e.currentTarget.setPointerCapture?.(e.pointerId);
            const point = pointToTarget(e);
            if (point) {
              target.current = point;
              startLoop();
            }
          }}
          onPointerMove={(e) => {
            if (target.current === null) return;
            const point = pointToTarget(e);
            if (point) target.current = point;
          }}
          onPointerUp={() => {
            target.current = null;
          }}
          onPointerCancel={() => {
            target.current = null;
          }}
        >
          <ArtCanvas className={styles.art} testId="sweep-art">
            <Sky height={130} />
            <Ground y={110} height={130} />
            {STONES.map((stone) => (
              <rect key={stone.key} className={styles.stone} x={stone.x} y={stone.y} width={46} height={20} rx={4} />
            ))}
            <Helper x={60} label="Một người quét sân" />
            <Helper x={330} label="Một người quét sân" />
          </ArtCanvas>
          <span
            className={styles.pile}
            style={{
              left: `${PILE.x}%`,
              top: `${PILE.y}%`,
              transform: `scale(${0.4 + (state.pile / PILE_CAP) * 1.2})`,
            }}
            data-testid="sweep-pile"
            data-count={state.pile}
          />
          {state.leaves.map((leaf) => {
            const swept = state.cleared.includes(leaf.id);
            return (
              <span
                key={leaf.id}
                className={`${styles.leaf} ${swept ? styles.swept : ""}`}
                style={{ left: `${swept ? PILE.x : leaf.x}%`, top: `${swept ? PILE.y : leaf.y}%` }}
                data-testid={`leaf-${leaf.id}`}
                data-swept={swept}
              />
            );
          })}
          <span ref={broomEl} className={styles.broom} aria-hidden="true" data-testid="sweep-broom" />
        </div>
      </PaperTexture>
      <p className={styles.status} role="status" aria-live="polite" data-testid="sweep-status">
        {done ? "" : `Còn ${remaining(state)} chiếc lá`}
      </p>
      {!done && (
        <div className={styles.controls}>
          <button type="button" className="button" data-testid="sweep-stroke" onClick={() => apply({ type: "stroke" })}>
            Quét một nhịp
          </button>
          <button type="button" className="button button--quiet" data-testid="sweep-pass" onClick={() => apply({ type: "pass" })}>
            Quét một lượt
          </button>
        </div>
      )}
      {state.lineShown && (
        <p className={styles.line} data-testid="sweep-line">
          {CLEARED_LINE}
        </p>
      )}
      {done && (
        <h2 className={styles.complete} data-testid="sweep-complete">
          Sân đã sạch lá.
        </h2>
      )}
      {done && nextPlace && (
        <div className={styles.next} data-testid="sweep-next-preview">
          <p>Nếu muốn, bạn có thể bước tiếp: {nextPlace.name}. {nextPlace.blurb}</p>
          <div className={styles.controls}>
            <Link className="button button--quiet" href={nextPlace.href} data-testid="sweep-next">
              {nextPlace.name}
            </Link>
          </div>
        </div>
      )}
      <div className={styles.controls}>
        <Link className="button button--quiet" href="/" data-testid="sweep-map">
          Bản đồ chùa
        </Link>
      </div>
      <SceneLinks from="courtyard" />
    </div>
  );
}
