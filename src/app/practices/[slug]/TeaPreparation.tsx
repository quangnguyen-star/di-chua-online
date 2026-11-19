"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAtmosphere } from "@/components/atmosphere";
import { SceneStage } from "@/components/temple/stage";
import type { Embed } from "@/lib/visit/embed";
import type { PracticeKind } from "../labels";
import styles from "./TeaPreparation.module.css";

const POUR_MS = 4000;
const SIP_MS = 2500;
const SIPS = 3;
/** A sip counts when the held breath got at least this far before release. */
const COUNT_AT = 0.7;
const LIFT_HOLD_MS = 1200;
const CUP_TOP = 126;
const CUP_BOTTOM = 178;
const RAIN_RINGS = Array.from({ length: 7 }, (_, i) => i);

type Phase = "pour" | "lift" | "sip" | "done";

type Props = {
  slug: string;
  seconds: number;
  closingLine: string;
  kind: PracticeKind;
  next: { href: string; title: string } | null;
  /** Set by the tour: fill the viewport over the scene stage and let the tour own pause, clock and skip. */
  embed?: Embed;
};

const CUES: Record<Phase, string> = {
  pour: "Giữ để nghiêng ấm và rót trà",
  lift: "Nâng chén bằng hai tay",
  sip: "Giữ một hơi thở để nhấp một ngụm",
  done: "",
};

const HINTS: Record<Phase, string> = {
  pour: "Nhấn giữ chuột hoặc ngón tay, hoặc giữ phím Space để rót.",
  lift: "Chạm hai ngón tay cùng lúc, hoặc nhấn giữ một ngón tay, hoặc bấm nút Nâng chén, hoặc phím L.",
  sip: "Nhấn giữ hoặc giữ phím Space trong một hơi thở, rồi thả ra.",
  done: "",
};

/** Stop 5: pour from the pot while held, lift the cup with two touches, then take three sips, each a held breath. */
export function TeaPreparation({ closingLine, embed }: Props) {
  const paused = embed?.paused ?? false;
  const { scene, cue } = useAtmosphere();
  const [phase, setPhase] = useState<Phase>("pour");
  const [sips, setSips] = useState(0);
  const [holding, setHolding] = useState(false);

  const phaseRef = useRef<Phase>("pour");
  const holdRef = useRef(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const poured = useRef(0);
  const sipProgress = useRef(0);
  const sipsRef = useRef(0);
  const lifted = useRef(0);
  const liftHeld = useRef(0);
  const pointers = useRef(new Set<number>());
  const potEl = useRef<SVGGElement>(null);
  const cupEl = useRef<SVGGElement>(null);
  const streamEl = useRef<SVGLineElement>(null);
  const teaEl = useRef<SVGRectElement>(null);
  const cueRef = useRef(cue);
  cueRef.current = cue;

  useEffect(() => {
    scene("veranda");
  }, [scene]);

  const go = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const lift = useCallback(() => {
    if (phaseRef.current === "lift") go("sip");
  }, [go]);

  const setHold = useCallback((on: boolean) => {
    if (on && (phaseRef.current === "done" || phaseRef.current === "lift")) return;
    holdRef.current = on;
    setHolding(on);
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      if (!pausedRef.current) {
        const p = phaseRef.current;
        if (p === "pour") {
          if (holdRef.current) poured.current = Math.min(1, poured.current + dt / POUR_MS);
          if (poured.current >= 1) {
            holdRef.current = false;
            setHolding(false);
            go("lift");
          }
        } else if (p === "lift") {
          const single = pointers.current.size === 1;
          liftHeld.current = single ? liftHeld.current + dt : 0;
          if (pointers.current.size >= 2 || liftHeld.current >= LIFT_HOLD_MS) {
            liftHeld.current = 0;
            go("sip");
          }
        } else if (p === "sip") {
          if (holdRef.current) {
            sipProgress.current = Math.min(1, sipProgress.current + dt / SIP_MS);
          } else if (sipProgress.current > 0) {
            if (sipProgress.current >= COUNT_AT) {
              sipsRef.current += 1;
              setSips(sipsRef.current);
              cueRef.current("cup");
              if (sipsRef.current >= SIPS) go("done");
            }
            sipProgress.current = 0;
          }
        }
        const raised = phaseRef.current === "pour" || phaseRef.current === "lift" ? 0 : 1;
        lifted.current += (raised - lifted.current) * Math.min(1, dt / 160);
        const pouring = phaseRef.current === "pour" && holdRef.current;
        const tilt = pouring ? 1 : 0;
        if (potEl.current) potEl.current.style.transform = `rotate(${tilt * 24}deg)`;
        if (cupEl.current) cupEl.current.style.transform = `translateY(${-30 * lifted.current - 12 * sipProgress.current}px)`;
        if (streamEl.current) streamEl.current.style.opacity = pouring ? "0.85" : "0";
        if (teaEl.current) {
          const shown = phaseRef.current === "pour" ? poured.current : 1 - sipsRef.current / SIPS - (sipProgress.current >= COUNT_AT ? 0.1 : 0);
          const h = (CUP_BOTTOM - CUP_TOP) * Math.max(0, shown);
          teaEl.current.setAttribute("y", String(CUP_BOTTOM - h));
          teaEl.current.setAttribute("height", String(h));
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [go]);

  useEffect(() => {
    const isControl = (t: EventTarget | null) => t instanceof HTMLElement && t.closest("button, a, input, textarea, select") !== null;
    const down = (e: KeyboardEvent) => {
      if (isControl(e.target)) return;
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        setHold(true);
      } else if (e.code === "KeyL" && !e.repeat) {
        lift();
      }
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
    };
  }, [setHold, lift]);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) return;
    pointers.current.add(e.pointerId);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setHold(true);
  };
  const onPointerEnd = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) setHold(false);
  };

  const done = phase === "done";
  const body = (
    <div
      className={styles.table}
      data-testid="tea-preparation"
      data-phase={phase}
      data-sips={sips}
      data-holding={holding}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className={styles.pond} aria-hidden="true" data-paused={paused} data-testid="tea-pond">
        {RAIN_RINGS.map((i) => (
          <span key={i} className={styles.ring} style={{ left: `${8 + i * 13}%`, top: `${20 + ((i * 37) % 60)}%`, animationDelay: `${i * 0.7}s` }} />
        ))}
        <span className={styles.lotus} style={{ left: "22%" }} />
        <span className={styles.lotus} style={{ left: "68%", top: "55%" }} />
        <span className={styles.leaf} data-paused={paused} />
      </div>
      <svg className={styles.set} viewBox="0 0 400 220" role="img" aria-label="Ấm trà và chén trà trên khay gỗ" data-testid="tea-set">
        <defs>
          <clipPath id="tea-cup-clip">
            <path d="M190 120 H290 Q290 178 240 178 Q190 178 190 120 Z" />
          </clipPath>
        </defs>
        <rect x="40" y="184" width="320" height="10" rx="4" fill="var(--wood)" opacity="0.85" />
        <g ref={potEl} className={styles.pot}>
          <ellipse cx="110" cy="160" rx="38" ry="26" fill="var(--surface)" stroke="var(--wood)" strokeWidth="4" />
          <path d="M146 150 Q164 138 170 126" fill="none" stroke="var(--wood)" strokeWidth="5" strokeLinecap="round" />
          <path d="M72 150 Q50 150 54 170 Q58 182 76 176" fill="none" stroke="var(--wood)" strokeWidth="4" strokeLinecap="round" />
          <rect x="92" y="130" width="36" height="8" rx="4" fill="var(--wood)" />
        </g>
        <line ref={streamEl} className={styles.stream} x1="204" y1="132" x2="204" y2="176" stroke="var(--moss)" strokeWidth="3" strokeLinecap="round" style={{ opacity: 0 }} />
        <g ref={cupEl} className={styles.cup} data-testid="tea-cup">
          <rect ref={teaEl} x="180" y={CUP_BOTTOM} width="120" height="0" clipPath="url(#tea-cup-clip)" fill="var(--moss)" opacity="0.8" data-testid="tea-level" />
          <ellipse cx="240" cy="121" rx="50" ry="5" fill="var(--sky, #bcd)" opacity="0.45" data-testid="tea-reflection" />
          <path d="M190 120 H290 Q290 178 240 178 Q190 178 190 120 Z" fill="none" stroke="var(--wood)" strokeWidth="4" strokeLinejoin="round" />
          <path d="M290 132 Q316 132 312 152 Q308 166 284 162" fill="none" stroke="var(--wood)" strokeWidth="4" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );

  const controls = (
    <div className={styles.panel}>
      {done ? (
        <p className={styles.closing} role="status" data-testid="tea-closing">
          <em>{closingLine}</em>
        </p>
      ) : (
        <>
          <p className={styles.cue} aria-live="polite" data-testid="tea-cue">
            {CUES[phase]}
          </p>
          <p className={styles.hint} data-testid="tea-hint">
            {HINTS[phase]}
          </p>
          {phase === "lift" && (
            <button type="button" className="button" onClick={lift} data-testid="tea-lift">
              Nâng chén
            </button>
          )}
        </>
      )}
    </div>
  );

  if (embed) {
    return (
      <div className={styles.fullscreen} data-testid="tea-root">
        <SceneStage place="veranda" paused={paused} />
        {body}
        {controls}
      </div>
    );
  }

  return (
    <div className={styles.page} data-testid="tea-root">
      <div className={styles.frame}>
        <SceneStage place="veranda" paused={paused} />
        {body}
        {controls}
      </div>
      <p className="actions">
        <Link href="/" className="button button--quiet" data-testid="veranda-map">
          Về bản đồ chùa
        </Link>
      </p>
    </div>
  );
}
