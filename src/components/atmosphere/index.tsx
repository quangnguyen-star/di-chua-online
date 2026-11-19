"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { mixer, type MixerStatus } from "../../lib/audio/mixer.ts";
import {
  audioReducer,
  canPlay,
  initialAudioState,
  type Appearance,
  type Cue,
  type Scene,
} from "../../lib/audio/mix.ts";
import { SoundControl } from "./SoundControl";

export type { Appearance, Cue, Scene };

export interface Atmosphere {
  soundOn: boolean;
  enable(): void;
  disable(): void;
  ambience: number;
  music: number;
  setAmbience(n: number): void;
  setMusic(n: number): void;
  cues: number;
  setCues(n: number): void;
  /** Live mixer/AudioContext state, refreshed while sound is on. */
  status: MixerStatus;
  scene(s: Scene): void;
  cue(c: Cue): void;
  failed: boolean;
  appearance: Appearance;
  setAppearance(a: Appearance): void;
}

const idleStatus: MixerStatus = { enabled: false, contextState: "none", assetFailed: false, blocked: false };

const silent: Atmosphere = {
  soundOn: false,
  enable() {},
  disable() {},
  ambience: initialAudioState.ambience,
  music: initialAudioState.music,
  setAmbience() {},
  setMusic() {},
  cues: 0.75,
  setCues() {},
  status: idleStatus,
  scene() {},
  cue() {},
  failed: false,
  appearance: "system",
  setAppearance() {},
};

const AtmosphereContext = createContext<Atmosphere>(silent);

export function useAtmosphere(): Atmosphere {
  return useContext(AtmosphereContext);
}

export function AtmosphereProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(audioReducer, initialAudioState);
  const latest = useRef(state);
  const lastScene = useRef<Scene>("gate");
  const [cues, setCues] = useState(0.75);
  const [status, setStatus] = useState<MixerStatus>(idleStatus);
  const refreshStatus = useCallback(() => setStatus(mixer.status), []);

  useEffect(() => {
    latest.current = state;
    mixer.setBus("ambience", state.ambience);
    mixer.setBus("music", state.music);
  }, [state]);

  useEffect(() => {
    mixer.setBus("cues", cues);
  }, [cues]);

  useEffect(() => {
    if (!state.soundOn) return;
    const id = window.setInterval(refreshStatus, 1000);
    return () => window.clearInterval(id);
  }, [state.soundOn, refreshStatus]);

  const disable = useCallback(() => {
    dispatch({ type: "disable" });
    void mixer.disable().finally(refreshStatus);
  }, [refreshStatus]);

  const enable = useCallback(() => {
    mixer.setScene(lastScene.current);
    mixer
      .enable()
      .then(() => dispatch({ type: "enable" }))
      .catch(() => dispatch({ type: "fail" }))
      .finally(refreshStatus);
  }, [refreshStatus]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && canPlay(latest.current)) disable();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      void mixer.dispose();
    };
  }, [disable]);

  const scene = useCallback((s: Scene) => {
    lastScene.current = s;
    if (canPlay(latest.current)) mixer.setScene(s);
  }, []);

  const cue = useCallback((c: Cue) => {
    if (canPlay(latest.current)) mixer.cue(c);
  }, []);

  const value = useMemo<Atmosphere>(
    () => ({
      soundOn: state.soundOn,
      enable,
      disable,
      ambience: state.ambience,
      music: state.music,
      setAmbience: (n) => dispatch({ type: "ambience", value: n }),
      setMusic: (n) => dispatch({ type: "music", value: n }),
      cues,
      setCues,
      status,
      scene,
      cue,
      failed: state.failed,
      appearance: state.appearance,
      setAppearance: (a) => dispatch({ type: "appearance", value: a }),
    }),
    [state, cues, status, enable, disable, scene, cue],
  );

  return <AtmosphereContext.Provider value={value}>{children}</AtmosphereContext.Provider>;
}

export { SoundControl };
