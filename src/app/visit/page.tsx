import VisitShell from "@/components/visit/VisitShell";
import VisitErrorBoundary from "@/components/visit/VisitErrorBoundary";
import { visitStages } from "@/content";
import { resolveStart } from "@/lib/visit/deepLink";

export const metadata = { title: "Ghé thăm chùa" };

export default async function VisitPage({ searchParams }: { searchParams: Promise<{ stop?: string | string[] }> }) {
  const { stop } = await searchParams;
  const { single, index } = resolveStart(stop, visitStages);

  return (
    <VisitErrorBoundary>
      <VisitShell key={`${single ? "one" : "tour"}-${index}`} single={single} startIndex={index} />
    </VisitErrorBoundary>
  );
}
