import Link from "next/link";
import { listItems } from "@/lib/admin";
import { requirePageSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export default async function ContentListPage() {
  const session = await requirePageSession();
  const items = await listItems();
  return (
    <main>
      <h1>Content</h1>
      <p>
        Signed in as {session.email} ({session.role})
      </p>
      <form method="post" action="/api/admin/logout">
        <button type="submit">Sign out</button>
      </form>
      <nav>
        {session.role === "editor" ? <Link href="/admin/editor/new">New practice</Link> : null}{" "}
        {session.role === "reviewer" ? <Link href="/admin/review">Review queue</Link> : null}
      </nav>
      {items.length === 0 ? (
        <p>No content yet. Editors can create the first practice with New practice.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Version</th>
              <th>Pending revision</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} data-testid={`content-row-${i.id}`}>
                <td>{i.title}</td>
                <td>{i.status}</td>
                <td>{i.version}</td>
                <td>{i.pending_revision ? (i.revision_submitted ? "in review" : "draft") : "none"}</td>
                <td>{session.role === "editor" ? <Link href={`/admin/editor/${i.id}`}>Edit</Link> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
