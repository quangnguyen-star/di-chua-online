/** Passed by the tour to a shared activity: the tour owns the clock, pause and skip; the activity only renders. */
export type Embed = {
  /** The stop's shortened duration in seconds. */
  seconds: number;
  /** True while the tour clock is frozen (pause or hidden tab). */
  paused: boolean;
};
