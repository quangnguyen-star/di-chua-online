import PracticeDetailPage from "../../practices/[slug]/page";

export const metadata = { title: "Hiên chùa" };

export default function VerandaPage() {
  return <PracticeDetailPage params={Promise.resolve({ slug: "tra-3-phut" })} />;
}
