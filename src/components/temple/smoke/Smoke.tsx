"use client";

import { useEffect, useRef } from "react";
import { drawSmoke } from "./draw";

export interface SmokeProps {
  lit: boolean;
  /** 0..1, default 0.6 */
  intensity?: number;
  /** -1..1, default 0 */
  wind?: number;
  paused?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export function Smoke({ lit, intensity = 0.6, wind = 0, paused = false, width = 64, height = 120, className }: SmokeProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frame = (time: number) => drawSmoke(ctx, width, height, { lit, intensity, wind, time });
    if (!lit || paused || reduced) {
      frame(0);
      return;
    }
    let raf = 0;
    const loop = (now: number) => {
      frame(now / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [lit, intensity, wind, paused, width, height]);

  return <canvas ref={ref} width={width} height={height} className={className} aria-hidden="true" />;
}
