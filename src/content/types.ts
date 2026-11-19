export type Practice = {
  slug: string;
  title: string;
  minutes: number;
  purpose: string;
  steps: string[];
  openingLine: string;
  closingLine: string;
  credit: string;
  alternative?: string;
  timerSeconds?: number;
};

export type DailyWord = {
  word: string;
  reflection: string;
  credit: string;
};

export type VisitStageId = "gate" | "courtyard" | "hall" | "pond" | "veranda" | "outside";

export type VisitStage = {
  id: VisitStageId;
  label: string;
  seconds: number;
  prompt: string;
  /** The shared activity this stop shortens (id in the activities registry). */
  activity: string;
  /** The config override handed to useActivity for this stop; seconds always matches the stop length. */
  config: { seconds: number };
  /** The full activity, offered after the tour. */
  href: string;
};
