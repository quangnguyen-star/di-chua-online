import { useId } from "react";
import styles from "./art.module.css";
import type { ArtCanvasProps, LayerProps, MistProps } from "./types";

export function ArtCanvas({ viewBox = "0 0 400 240", variant = "auto", label, className, testId, children }: ArtCanvasProps) {
  return (
    <svg
      className={[styles.canvas, className].filter(Boolean).join(" ")}
      viewBox={viewBox}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      data-art={variant === "auto" ? undefined : variant}
      data-testid={testId}
    >
      {children}
    </svg>
  );
}

export function Sky({ x = 0, y = 0, width = 400, height = 240 }: LayerProps) {
  const id = useId();
  return (
    <g data-testid="art-sky">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--art-sky-top)" />
          <stop offset="1" stopColor="var(--art-sky-bottom)" />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={width} height={height} fill={`url(#${id})`} />
    </g>
  );
}

export function Ground({ x = 0, y = 190, width = 400, height = 50 }: LayerProps) {
  return (
    <g data-testid="art-ground">
      <rect x={x} y={y} width={width} height={height} fill="var(--art-ground)" />
      <rect x={x} y={y} width={width} height={4} fill="var(--art-ground-shade)" />
    </g>
  );
}

export function Mist({ x = 0, y = 150, width = 400, height = 60, opacity = 0.5 }: MistProps) {
  const id = useId();
  return (
    <g data-testid="art-mist">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--art-mist)" stopOpacity="0" />
          <stop offset="0.5" stopColor="var(--art-mist)" stopOpacity={opacity} />
          <stop offset="1" stopColor="var(--art-mist)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={width} height={height} fill={`url(#${id})`} />
    </g>
  );
}

/** Wraps children with a paper grain overlay (public/art/paper.svg). Children render beneath the grain. */
export function PaperTexture({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={[styles.paperHost, className].filter(Boolean).join(" ")} data-testid="art-paper">
      {children}
      <span className={styles.paper} aria-hidden="true" />
    </div>
  );
}
