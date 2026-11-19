"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { activities } from "@/content/places";
import { useAtmosphere } from "@/components/atmosphere";
import { LEAVES, canCue, freshState, isComplete, remaining, sweepAll, sweepAt, type SweepState } from "./logic";
import styles from "./sweeping.module.css";

/** The one optional continuation, read from the registry's next field on the sweeping activity. */
const nextId = activities.find((a) => a.id === "sweeping")?.next;
const nextStep = activities.find((a) => a.id === nextId && a.ready);

export default function Sweeping() {
  const [state, setState] = useState<SweepState>(freshState);
  const { scene, cue } = useAtmosphere();
  const yard = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const lastCue = useRef<number | null>(null);

  useEffect(() => {
    scene("courtyard");
  }, [scene]);

  const play = () => {
    const now = Date.now();
    if (!canCue(now, lastCue.current)) return;
    lastCue.current = now;
    cue("sweep");
  };

  const apply = (next: SweepState) => {
    if (next === state) return;
    setState(next);
    play();
  };

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !yard.current) return;
    const rect = yard.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setState((current) => {
      const next = sweepAt(current, x, y);
      if (next !== current) play();
      return next;
    });
  };

  const done = isComplete(state);
  const left = remaining(state);

  return (
    <div className={styles.root}>
      <h1>Quét sân</h1>
      <p className={styles.prompt}>
        Kéo ngón tay hoặc con trỏ qua sân để quét lá, hoặc chọn &ldquo;Quét một lượt&rdquo;. Không tính giờ, không điểm.
      </p>
      <div
        ref={yard}
        className={styles.yard}
        data-testid="sweep-yard"
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture?.(e.pointerId);
          onMove(e);
        }}
        onPointerMove={onMove}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        {LEAVES.map((leaf) => (
          <span
            key={leaf.id}
            className={`${styles.leaf} ${state.cleared.includes(leaf.id) ? styles.swept : ""}`}
            style={{ left: `${leaf.x}%`, top: `${leaf.y}%` }}
            data-testid={`leaf-${leaf.id}`}
            data-swept={state.cleared.includes(leaf.id)}
          />
        ))}
      </div>
      <p className={styles.status} role="status" aria-live="polite" data-testid="sweep-status">
        {done ? "" : `Còn ${left} chiếc lá`}
      </p>
      {done ? (
        <>
          <h2 data-testid="sweep-complete">Sân đã sạch lá.</h2>
          {nextStep && (
            <div className={styles.next}>
              <p>Nếu muốn, bạn có thể tiếp tục:</p>
              <div className={styles.controls}>
                <Link className="button button--quiet" href={nextStep.href} data-testid="sweep-next">
                  {nextStep.label}
                </Link>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={styles.controls}>
          <button type="button" className="button" data-testid="sweep-pass" onClick={() => apply(sweepAll(state))}>
            Quét một lượt
          </button>
        </div>
      )}
      <div className={styles.controls}>
        <Link className="button button--quiet" href="/" data-testid="sweep-back">
          Quay lại
        </Link>
      </div>
    </div>
  );
}
