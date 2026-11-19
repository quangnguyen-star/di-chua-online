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

export type VisitStageId = "gate" | "courtyard" | "hall" | "return";

export type VisitStage = {
  id: VisitStageId;
  label: string;
  seconds: number;
  prompt: string;
};
