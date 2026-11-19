import { backdropScene } from "./backdrop.ts";

/** First backdrop for the outside; its stop ticket owns and refines this file. */
export const outsideScene = backdropScene({ horizon: 320, groundTop: "#2c2a1c", groundBottom: "#0e0d08", edge: "#8f8a52" });
