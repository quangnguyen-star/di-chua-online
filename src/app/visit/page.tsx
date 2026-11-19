import VisitFlow from "@/components/visit/VisitFlow";
import VisitErrorBoundary from "@/components/visit/VisitErrorBoundary";

export const metadata = { title: "Ghé thăm chùa" };

export default function VisitPage() {
  return (
    <VisitErrorBoundary>
      <VisitFlow />
    </VisitErrorBoundary>
  );
}
