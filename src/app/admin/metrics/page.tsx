import { query } from "@/lib/db";
import { requirePageSession } from "@/lib/admin-session";
import { ensureEventsTable } from "@/app/api/events/table";

export const dynamic = "force-dynamic";

type Row = { name: string; step: number; total: string };

export default async function MetricsPage() {
  await requirePageSession(["editor", "reviewer"]);

  await ensureEventsTable();
  const rows = await query<Row>(
    "SELECT name, step, SUM(count)::text AS total FROM event_counts GROUP BY name, step",
  );
  const sum = (name: string) =>
    rows.filter((r) => r.name === name).reduce((acc, r) => acc + Number(r.total), 0);

  const started = sum("visit_started");
  const completed = sum("visit_completed");
  const played = sum("audio_played");
  const audioDone = sum("audio_completed");
  const pct = (n: number, d: number) => (d > 0 ? `${((n / d) * 100).toFixed(1)}%` : "n/a");

  const viewed = new Map<number, number>();
  const finished = new Map<number, number>();
  for (const r of rows) {
    if (r.step < 0) continue;
    if (r.name === "step_viewed") viewed.set(r.step, Number(r.total));
    if (r.name === "step_completed") finished.set(r.step, Number(r.total));
  }
  const steps = [...viewed.keys()].sort((a, b) => a - b);

  return (
    <section>
      <h1>Metrics</h1>
      <p>Completion rate: {pct(completed, started)} ({completed} of {started} visits)</p>
      <p>Audio failure rate: {pct(Math.max(played - audioDone, 0), played)} ({Math.max(played - audioDone, 0)} of {played} plays)</p>
      <h2>Abandonment by step</h2>
      {steps.length === 0 ? (
        <p>No step data recorded yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Step</th>
              <th>Viewed</th>
              <th>Completed</th>
              <th>Abandoned</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s) => {
              const v = viewed.get(s) ?? 0;
              const c = finished.get(s) ?? 0;
              return (
                <tr key={s}>
                  <td>{s}</td>
                  <td>{v}</td>
                  <td>{c}</td>
                  <td>{pct(Math.max(v - c, 0), v)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
