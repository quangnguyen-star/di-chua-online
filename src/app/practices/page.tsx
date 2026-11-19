import Link from "next/link";
import { listPublishedPractices } from "@/lib/content";
import { PRACTICE_TYPE_LABEL } from "./labels";

export const dynamic = "force-dynamic";

export const metadata = { title: "Các bài thực hành" };

export default async function PracticesPage() {
  const practices = await listPublishedPractices();

  if (practices.length === 0) {
    return (
      <>
        <h1>Các bài thực hành</h1>
        <div className="empty" data-testid="practices-empty">
          <p>Hiện chưa có bài thực hành nào được đăng. Mời bạn quay lại sau.</p>
          <Link href="/" className="button">
            Về trang chủ
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h1>Các bài thực hành</h1>
      <ul className="cards">
        {practices.map((p) => (
          <li key={p.id} className="card" data-testid={`practice-card-${p.id}`}>
            <h2>
              <Link href={`/practices/${p.slug}`} data-testid={`practice-link-${p.id}`}>
                {p.title}
              </Link>
            </h2>
            <p className="muted">
              {PRACTICE_TYPE_LABEL[p.type]} · {Math.max(1, Math.round(p.durationSec / 60))} phút
            </p>
            <p>{p.summary}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
