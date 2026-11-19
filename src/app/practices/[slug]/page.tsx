import Link from "next/link";
import { notFound } from "next/navigation";
import AudioPlayer from "@/components/AudioPlayer";
import { getPublishedPractice } from "@/lib/content";
import { PRACTICE_TYPE_LABEL } from "../labels";

export const dynamic = "force-dynamic";

export default async function PracticeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const practice = await getPublishedPractice(slug);
  if (!practice) notFound();

  return (
    <article data-testid={`practice-${practice.id}`}>
      <h1>{practice.title}</h1>
      <p className="muted" data-testid={`practice-type-${practice.id}`}>
        {PRACTICE_TYPE_LABEL[practice.type]} · {Math.max(1, Math.round(practice.durationSec / 60))} phút
      </p>
      <p>{practice.summary}</p>
      {practice.audioUrl && (
        <AudioPlayer id={practice.id} src={practice.audioUrl} title={practice.title} />
      )}
      <section aria-labelledby="transcript-title">
        <h2 id="transcript-title">Lời dẫn</h2>
        <div className="transcript" data-testid={`practice-transcript-${practice.id}`}>
          {practice.body.split(/\n{2,}/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>
      <p className="muted" data-testid={`practice-attribution-${practice.id}`}>
        Nội dung do đội ngũ Chánh niệm mỗi ngày biên soạn.
      </p>
      <p>
        <Link href="/practices" data-testid="practice-return">
          Quay lại các bài thực hành
        </Link>
      </p>
    </article>
  );
}
