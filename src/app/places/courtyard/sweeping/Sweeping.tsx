"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useAtmosphere } from "@/components/atmosphere";
import { usePageHidden, useReducedMotion } from "@/lib/useBrowserFlags";
import { panFromPercent } from "@/lib/audio/mix.ts";
import { SceneStage } from "@/components/temple/stage";
import StageZones from "@/components/visit/StageZones";
import { useInstruction } from "@/components/visit/useInstruction";
import { SceneLinks } from "@/components/temple/map/SceneLinks";
import type { Embed } from "@/lib/visit/embed";
import {
  KEY_ROW,
  KEY_SPEED,
  LEAF_CAP,
  LEAF_TINTS,
  MARK_CAP,
  MARK_LIFE,
  PILE,
  broomTilt,
  canCue,
  clamp,
  depthScale,
  pileScale,
  freshWorld,
  relocateLeaves,
  settleLeaf,
  stepBroom,
  stepWorld,
  type Broom,
  type World,
} from "./logic";
import styles from "./sweeping.module.css";

const SLOTS = Array.from({ length: LEAF_CAP }, (_, slot) => slot);
const MARK_SLOTS = Array.from({ length: MARK_CAP }, (_, slot) => slot);
const SETTLE_MS = 2200;
const LINES = ["Kéo chổi trên sân để gom lá về góc.", "Phím ← → cũng quét được."] as const;
const HINT = "Kéo chổi để gom lá về góc sân. Phím ← → để quét.";

/** Stop 2: sweep the courtyard; a slow broom gathers leaves into the pile, a fast one scatters them, and leaves never stop falling. */
export default function Sweeping({ embed }: { embed?: Embed } = {}) {
  const paused = embed?.paused ?? false;
  const { scene, cue } = useAtmosphere();
  const reduced = useReducedMotion();
  const hidden = usePageHidden();
  const running = !paused && !hidden;

  const yard = useRef<HTMLDivElement>(null);
  const broomEl = useRef<HTMLSpanElement>(null);
  const pileEl = useRef<HTMLSpanElement>(null);
  const markEls = useRef<(HTMLSpanElement | null)[]>([]);
  const leafEls = useRef<(HTMLSpanElement | null)[]>([]);
  const world = useRef<World>(freshWorld);
  const broom = useRef<Broom>({ x: 50, y: KEY_ROW, vx: 0, vy: 0 });
  const target = useRef<{ x: number; y: number } | null>(null);
  const keyDir = useRef<-1 | 0 | 1>(0);
  const lastCue = useRef<number | null>(null);
  const instruction = useInstruction(LINES);
  const advanced = useRef(false);
  const advance = instruction.advance;
  const swept = () => {
    if (advanced.current) return;
    advanced.current = true;
    advance();
  };

  useEffect(() => {
    scene("courtyard");
  }, [scene]);

  const paint = () => {
    const w = world.current;
    SLOTS.forEach((slot) => {
      const el = leafEls.current[slot];
      const leaf = w.leaves[slot];
      if (!el) return;
      if (!leaf) {
        el.style.display = "none";
        return;
      }
      el.style.display = "block";
      el.style.left = `${leaf.x}%`;
      el.style.top = `${leaf.y}%`;
      el.style.background = LEAF_TINTS[leaf.kind];
      el.style.transform = `scale(${depthScale(leaf.y)}) rotate(${leaf.rot}deg)`;
    });
    MARK_SLOTS.forEach((slot) => {
      const el = markEls.current[slot];
      const mark = w.marks[slot];
      if (!el) return;
      if (!mark) {
        el.style.display = "none";
        return;
      }
      el.style.display = "block";
      el.style.left = `${mark.x}%`;
      el.style.top = `${mark.y + 4}%`;
      el.style.opacity = String(0.35 * (1 - mark.age / MARK_LIFE));
      el.style.transform = `rotate(${mark.angle}deg)`;
    });
    const el = broomEl.current;
    if (el) {
      el.style.left = `${broom.current.x}%`;
      el.style.top = `${broom.current.y}%`;
      el.style.transform = `rotate(${broomTilt(broom.current)}deg)`;
    }
    if (pileEl.current) pileEl.current.style.transform = `scale(${pileScale(w.pile)})`;
  };

  const cueSweep = () => {
    const now = Date.now();
    if (!canCue(now, lastCue.current)) return;
    lastCue.current = now;
    cue("sweep", { pan: panFromPercent(broom.current.x) });
  };

  useEffect(() => {
    if (!running || reduced) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const dir = keyDir.current;
      if (dir !== 0) {
        const b = broom.current;
        broom.current = { x: clamp(b.x + dir * KEY_SPEED * Math.min(dt, 0.05), 0, 100), y: KEY_ROW, vx: dir * KEY_SPEED, vy: 0 };
      } else {
        broom.current = stepBroom(broom.current, target.current, dt);
      }
      const sweeping = dir !== 0 || target.current !== null || Math.hypot(broom.current.vx, broom.current.vy) > 4;
      if (sweeping && Math.hypot(broom.current.vx, broom.current.vy) > 4) {
        cueSweep();
        swept();
      }
      world.current = stepWorld(world.current, broom.current, dt, Math.random, sweeping);
      paint();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, reduced]);

  // Reduced motion: leaves appear already on the ground, one at a time, and never move on their own.
  useEffect(() => {
    if (!running || !reduced) return;
    world.current = settleLeaf(world.current, Math.random);
    paint();
    const id = window.setInterval(() => {
      world.current = settleLeaf(world.current, Math.random);
      paint();
    }, SETTLE_MS);
    return () => window.clearInterval(id);
  }, [running, reduced]);

  useEffect(() => {
    const editable = (t: EventTarget | null) => t instanceof HTMLElement && t.closest("input, textarea, select") !== null;
    const down = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (editable(e.target) || !running) return;
      e.preventDefault();
      const dir = e.key === "ArrowLeft" ? -1 : 1;
      if (reduced) {
        if (e.repeat) return;
        const x = clamp(broom.current.x + dir * 8, 0, 100);
        broom.current = { x, y: KEY_ROW, vx: 0, vy: 0 };
        world.current = relocateLeaves(world.current, x, dir);
        paint();
        cueSweep();
        swept();
      } else {
        keyDir.current = dir;
        target.current = null;
      }
    };
    const up = (e: KeyboardEvent) => {
      if ((e.key === "ArrowLeft" && keyDir.current === -1) || (e.key === "ArrowRight" && keyDir.current === 1)) keyDir.current = 0;
    };
    const blur = () => {
      keyDir.current = 0;
      target.current = null;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [running, reduced]);

  const pointToTarget = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = yard.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return null;
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    };
  };

  const body = (
    <div
      ref={yard}
      className={styles.yard}
      data-testid="sweep-yard"
      onPointerDown={(e) => {
        if (reduced || !running) return;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        const point = pointToTarget(e);
        if (point) target.current = point;
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
      <span ref={pileEl} className={styles.pile} style={{ left: `${PILE.x}%`, top: `${PILE.y}%` }} aria-hidden="true" data-testid="sweep-pile" />
      {MARK_SLOTS.map((slot) => (
        <span key={slot} ref={(el) => { markEls.current[slot] = el; }} className={styles.mark} style={{ display: "none" }} aria-hidden="true" />
      ))}
      {SLOTS.map((slot) => (
        <span key={slot} ref={(el) => { leafEls.current[slot] = el; }} className={styles.leaf} style={{ display: "none" }} aria-hidden="true" />
      ))}
      <span ref={broomEl} className={styles.broom} aria-hidden="true" data-testid="sweep-broom">
        <span className={styles.bristles} />
      </span>
    </div>
  );

  if (embed) {
    return (
      <div className={styles.fullscreen} data-testid="sweep-root">
        {body}
        <StageZones instruction={instruction} />
      </div>
    );
  }

  return (
    <div className={styles.page} data-testid="sweep-root">
      <h1>Quét sân</h1>
      <div className={styles.frame}>
        <SceneStage place="courtyard" paused={!running} />
        {body}
      </div>
      <p className={styles.hint} data-testid="sweep-hint">
        {HINT}
      </p>
      {!embed && (
        <>
          <div className={styles.controls}>
            <Link className="button button--quiet" href="/" data-testid="sweep-map">
              Bản đồ chùa
            </Link>
          </div>
          <SceneLinks from="courtyard" />
        </>
      )}
    </div>
  );
}
