import VisitFlow from "@/components/visit/VisitFlow";
import VisitErrorBoundary from "@/components/visit/VisitErrorBoundary";
import StopView from "@/components/visit/StopView";
import { visitStages } from "@/content";

export const metadata = { title: "Ghé thăm chùa" };

export default async function VisitPage({ searchParams }: { searchParams: Promise<{ stop?: string | string[] }> }) {
  const { stop } = await searchParams;
  const stopId = typeof stop === "string" ? stop : undefined;
  const known = stopId !== undefined && visitStages.some((s) => s.id === stopId);

  return (
    <VisitErrorBoundary>
      {known ? <StopView stopId={stopId} /> : <VisitFlow />}
    </VisitErrorBoundary>
  );
}
