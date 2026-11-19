"use client";

import { useEffect, useRef } from "react";
import { createLanternCanvas, lanternBake, type LanternColor } from "./bake";

export interface LotusLanternProps {
  color: LanternColor;
  prominent?: boolean;
  className?: string;
  label?: string;
}

export function LotusLantern({ color, prominent = false, className, label }: LotusLanternProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { width, height } = lanternBake(color, prominent);

  useEffect(() => {
    const target = ref.current?.getContext("2d");
    if (!target) return;
    target.clearRect(0, 0, width, height);
    target.drawImage(createLanternCanvas(color, prominent), 0, 0);
  }, [color, prominent, width, height]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
