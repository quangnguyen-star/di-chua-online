"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PlaceId } from "../../content/places";

export type Cue = "bell" | "sweep" | "water" | "cup";
export type Appearance = "system" | "day" | "evening";

export type Atmosphere = {
  soundOn: boolean;
  enable(): void;
  ambience: number;
  music: number;
  setAmbience(n: number): void;
  setMusic(n: number): void;
  scene(s: PlaceId): void;
  cue(c: Cue): void;
  failed: boolean;
  appearance: Appearance;
  setAppearance(a: Appearance): void;
};

const noop = () => {};

const passthrough: Atmosphere = {
  soundOn: false,
  enable: noop,
  ambience: 0,
  music: 0,
  setAmbience: noop,
  setMusic: noop,
  scene: noop,
  cue: noop,
  failed: false,
  appearance: "system",
  setAppearance: noop,
};

const AtmosphereContext = createContext<Atmosphere>(passthrough);

export function AtmosphereProvider({ children }: { children: ReactNode }) {
  return <AtmosphereContext.Provider value={passthrough}>{children}</AtmosphereContext.Provider>;
}

export function useAtmosphere(): Atmosphere {
  return useContext(AtmosphereContext);
}

export function SoundControl() {
  return null;
}
