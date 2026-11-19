/** Passed by the tour to a shared activity: the tour owns the clock, pause and navigation; the activity only renders. */
export type Embed = {
  /** The stop's shortened duration in seconds. */
  seconds: number;
  /** True while the tour clock is frozen (pause or hidden tab). */
  paused: boolean;
  /** The activity fills the viewport over the scene stage and draws no page chrome of its own. */
  fullscreen: true;
};
