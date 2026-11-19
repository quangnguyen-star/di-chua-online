import type { SceneHandle } from "@/components/temple/stage/scenes/types";

export type StageHandle = SceneHandle;

/** The live handle of each mounted layer, keyed by stop id; a destroyed scene reports null and is dropped. */
export type StageHandles = Readonly<Record<string, StageHandle>>;

export function withHandle(handles: StageHandles, id: string, handle: StageHandle | null): StageHandles {
  if (handle) return { ...handles, [id]: handle };
  if (!(id in handles)) return handles;
  const rest: Record<string, StageHandle> = { ...handles };
  delete rest[id];
  return rest;
}
