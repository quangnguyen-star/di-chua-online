export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.DATABASE_URL) return;
  const { ensureReady } = await import("./lib/db");
  try {
    await ensureReady();
  } catch (err) {
    console.error("schema bootstrap failed", err instanceof Error ? err.message : "unknown error");
  }
}
