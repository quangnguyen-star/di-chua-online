import Link from "next/link";
import { listItems } from "@/lib/admin";
import { requirePageSession } from "@/lib/admin-session";
import { ReviewActions } from "./review-actions";

export const dynamic = "force-dynamic";

export default async function ReviewQueuePage() {
  await requirePageSession(["reviewer"]);
  const queue = (await listItems()).filter((i) => i.status === "in_review" || i.revision_submitted);
  return (
    <main>
      <h1>Review queue</h1>
      <Link href="/admin">Back to content</Link>
      {queue.length === 0 ? (
        <p>Nothing is waiting for review.</p>
      ) : (
        <ul>
          {queue.map((i) => (
            <li key={i.id} data-testid={`review-item-${i.id}`}>
              <strong>{i.title}</strong> ({i.revision_submitted ? `revision of v${i.version}` : "new"})
              <ReviewActions id={i.id} title={i.title} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
