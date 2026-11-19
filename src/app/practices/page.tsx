import Link from "next/link";
import { practices } from "@/content";

export const metadata = { title: "Các bài thực hành" };

export default function PracticesPage() {
  return (
    <>
      <h1>Các bài thực hành</h1>
      <ul className="cards">
        {practices.map((p) => (
          <li key={p.slug} className="card" data-testid={`practice-card-${p.slug}`}>
            <h2>
              <Link href={`/practices/${p.slug}`} data-testid={`practice-link-${p.slug}`}>
                {p.title}
              </Link>
            </h2>
            <p className="muted" data-testid={`practice-duration-${p.slug}`}>
              {p.minutes} phút
            </p>
            <p data-testid={`practice-purpose-${p.slug}`}>{p.purpose}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
