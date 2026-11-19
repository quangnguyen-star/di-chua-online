import Link from "next/link";
import { notFound } from "next/navigation";
import { practices } from "@/content";
import { ErrorState } from "@/components/shell/ErrorState";
import { kindBySlug, nextPractice } from "../labels";
import { PracticeTimer } from "./PracticeTimer";
import { TeaPreparationSlot } from "./compositions/TeaPreparationSlot";

export const dynamicParams = false;

export function generateStaticParams() {
  return practices.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const practice = practices.find((p) => p.slug === slug);
  return { title: practice?.title ?? "Các bài thực hành" };
}

export default async function PracticeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const practice = practices.find((p) => p.slug === slug);
  if (!practice) notFound();

  if (practice.steps.length === 0) {
    return (
      <ErrorState
        title={practice.title}
        body="Bài thực hành này đang được chuẩn bị. Mời bạn quay lại sau."
        actions={[{ label: "Quay lại các bài thực hành", href: "/practices" }]}
      />
    );
  }

  const kind = kindBySlug[practice.slug];

  return (
    <article className="practice" data-testid={`practice-${practice.slug}`}>
      <h1>{practice.title}</h1>
      <p className="muted" data-testid={`practice-duration-${practice.slug}`}>
        {practice.minutes} phút
      </p>
      <p>{practice.purpose}</p>
      <p data-testid={`practice-opening-${practice.slug}`}>
        <em>{practice.openingLine}</em>
      </p>
      <section aria-labelledby="steps-title">
        <h2 id="steps-title">Các bước</h2>
        {kind === "sitting" ? (
          <div data-testid={`practice-steps-${practice.slug}`}>
            <details>
              <summary>Chuẩn bị chỗ ngồi</summary>
              <ol>
                {practice.steps.slice(0, 3).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </details>
            <ol start={4}>
              {practice.steps.slice(3).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        ) : (
          <ol data-testid={`practice-steps-${practice.slug}`}>
            {practice.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        )}
        {kind === "tea" && <TeaPreparationSlot />}
      </section>
      {practice.alternative && (
        <section aria-labelledby="alt-title">
          <h2 id="alt-title">Cách khác</h2>
          <p data-testid={`practice-alternative-${practice.slug}`}>{practice.alternative}</p>
        </section>
      )}
      {practice.timerSeconds ? (
        <PracticeTimer
          slug={practice.slug} seconds={practice.timerSeconds}
          closingLine={practice.closingLine}
          kind={kind}
          next={nextPractice(practice.slug)}
        />
      ) : (
        <p data-testid={`practice-closing-${practice.slug}`}>
          <em>{practice.closingLine}</em>
        </p>
      )}
      <p className="muted" data-testid={`practice-credit-${practice.slug}`}>
        {practice.credit}
      </p>
      <p>
        <Link href="/practices" data-testid={`practice-return-${practice.slug}`}>
          Quay lại các bài thực hành
        </Link>
      </p>
    </article>
  );
}
