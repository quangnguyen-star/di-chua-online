/** "auto" follows the site theme; "day"/"night" pin the art regardless of theme. */
export type ArtVariant = "auto" | "day" | "night";

export interface ArtCanvasProps {
  /** SVG viewBox; layers assume the default 400x240. */
  viewBox?: string;
  variant?: ArtVariant;
  /** Accessible description. Omit for purely decorative art (hidden from assistive tech). */
  label?: string;
  className?: string;
  testId?: string;
  children?: React.ReactNode;
}

export interface LayerProps {
  /** Layer rectangle in viewBox units. Defaults fill the 400x240 canvas. */
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface MistProps extends LayerProps {
  /** 0..1, default 0.5. */
  opacity?: number;
}

export interface ArtSceneProps {
  variant?: ArtVariant;
  /** Accessible description; every scene has a default Vietnamese description. */
  label?: string;
  className?: string;
  testId?: string;
}
