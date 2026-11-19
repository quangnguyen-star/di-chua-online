export type Scene = "gate" | "courtyard" | "hall" | "pond" | "veranda" | "outside";
export type Bus = "ambience" | "cues" | "music";
/** "bell" is the small nudge bell; "bigBell" rings only on entering and at the end. */
export type Cue = "bell" | "bigBell" | "sweep" | "water" | "cup";

export interface CueOptions {
  /** Stereo position, -1 (left) to 1 (right). */
  pan?: number;
  /** Strength 0..1; scales the cue's loudness. */
  intensity?: number;
}
export type Appearance = "system" | "day" | "evening";

export interface AudioState {
  soundOn: boolean;
  failed: boolean;
  ambience: number;
  music: number;
  appearance: Appearance;
}

export type AudioAction =
  | { type: "enable" }
  | { type: "disable" }
  | { type: "fail" }
  | { type: "ambience"; value: number }
  | { type: "music"; value: number }
  | { type: "appearance"; value: Appearance };

export const initialAudioState: AudioState = {
  soundOn: false,
  failed: false,
  ambience: 0.5,
  music: 0.35,
  appearance: "system",
};

export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export function audioReducer(state: AudioState, action: AudioAction): AudioState {
  switch (action.type) {
    case "enable":
      return { ...state, soundOn: true, failed: false };
    case "disable":
      return { ...state, soundOn: false };
    case "fail":
      return { ...state, soundOn: false, failed: true };
    case "ambience":
      return { ...state, ambience: clamp01(action.value) };
    case "music":
      return { ...state, music: clamp01(action.value) };
    case "appearance":
      return { ...state, appearance: action.value };
  }
}

/** Whether scene() and cue() may produce sound at all. */
export function canPlay(state: Pick<AudioState, "soundOn" | "failed">): boolean {
  return state.soundOn && !state.failed;
}

export interface SceneMix {
  /** Wind bed level, 0..1 of the ambience channel. */
  wind: number;
  /** Leaf rustle bed level, 0..1 of the ambience channel. */
  leaves: number;
  /** Low-pass cutoff of the wind bed in Hz. */
  windCutoff: number;
  /** Music level, 0..1 of the music channel. */
  music: number;
  /** Reverb send, 0 (dry) to 1; outdoors stays dry, the hall is warm. */
  reverb: number;
  /** Music root shift in semitones, so each stop has its own quiet tonal colour. */
  musicShift: number;
}

export const sceneMixes: Record<Scene, SceneMix> = {
  gate: { wind: 0.5, leaves: 0.3, windCutoff: 500, music: 0.7, reverb: 0, musicShift: 0 },
  courtyard: { wind: 0.4, leaves: 0.6, windCutoff: 700, music: 0.6, reverb: 0, musicShift: 2 },
  hall: { wind: 0.15, leaves: 0.1, windCutoff: 300, music: 0.9, reverb: 0.55, musicShift: -5 },
  pond: { wind: 0.25, leaves: 0.35, windCutoff: 450, music: 0.7, reverb: 0.05, musicShift: 4 },
  veranda: { wind: 0.45, leaves: 0.5, windCutoff: 600, music: 0.6, reverb: 0.1, musicShift: 7 },
  outside: { wind: 0.6, leaves: 0.2, windCutoff: 800, music: 0.3, reverb: 0, musicShift: 0 },
};

/** Master ceiling so the summed channels never approach clipping. */
export const MASTER_GAIN = 0.4;
export const AMBIENCE_CEILING = 0.25;
export const MUSIC_CEILING = 0.18;
export const CUE_CEILING = 0.22;
export const CROSSFADE_SECONDS = 2.5;

export function ambienceGain(level: number): number {
  const v = clamp01(level);
  return v * v * AMBIENCE_CEILING;
}

export function musicGain(level: number): number {
  const v = clamp01(level);
  return v * v * MUSIC_CEILING;
}

export function cueGain(ambienceLevel: number): number {
  return CUE_CEILING * (0.5 + 0.5 * clamp01(ambienceLevel));
}

/** Cue bus level 0..1 to gain; 0 is fully silent. */
export function cueBusGain(level: number): number {
  return CUE_CEILING * clamp01(level);
}

/** Pentatonic (major) intervals in semitones from the root. */
export const PENTATONIC = [0, 2, 4, 7, 9] as const;

export function noteFrequency(root: number, degree: number): number {
  const len = PENTATONIC.length;
  const octave = Math.floor(degree / len);
  const step = ((degree % len) + len) % len;
  return root * 2 ** ((PENTATONIC[step] + 12 * octave) / 12);
}

/** Sparse, wordless melody: next scale degree by a small step, with long rests. `rand` is in [0,1). */
export function nextNote(prev: number, rand: () => number): { degree: number; waitSeconds: number } {
  const move = Math.floor(rand() * 5) - 2;
  const degree = Math.min(7, Math.max(-2, prev + move));
  return { degree, waitSeconds: 5 + rand() * 7 };
}

export const CUE_PITCHES: Record<Cue, { freq: number; decay: number; noise: boolean }> = {
  bell: { freq: 784, decay: 2.2, noise: false },
  bigBell: { freq: 130.81, decay: 7, noise: false },
  sweep: { freq: 330, decay: 1.6, noise: true },
  water: { freq: 880, decay: 0.5, noise: false },
  cup: { freq: 698.46, decay: 1.2, noise: false },
};

/** Audio may only (re)start after an explicit user action; a hidden tab always suspends. */
export function shouldSuspend(hidden: boolean): boolean {
  return hidden;
}

export function nextAppearance(current: Appearance): Appearance {
  return current === "system" ? "day" : current === "day" ? "evening" : "system";
}

/** Pitch and volume variants per cue; each firing picks one, so repeats never sound identical. */
export const CUE_VARIANTS: readonly { pitch: number; volume: number }[] = [
  { pitch: 1, volume: 1 },
  { pitch: 0.944, volume: 0.88 },
  { pitch: 1.059, volume: 0.94 },
  { pitch: 1.122, volume: 0.8 },
];

/** `rand` is in [0,1). */
export function pickVariant(rand: () => number): { pitch: number; volume: number } {
  const i = Math.min(CUE_VARIANTS.length - 1, Math.floor(clamp01(rand()) * CUE_VARIANTS.length));
  return CUE_VARIANTS[i];
}

export function clampPan(pan: number | undefined): number {
  if (pan === undefined || !Number.isFinite(pan)) return 0;
  return Math.min(1, Math.max(-1, pan));
}

/** Stereo pan for a scene position given as a percentage across the stage (0 left, 100 right). */
export function panFromPercent(x: number): number {
  return clampPan((x - 50) / 50);
}

export function cueIntensity(intensity: number | undefined): number {
  return intensity === undefined ? 1 : clamp01(intensity);
}
