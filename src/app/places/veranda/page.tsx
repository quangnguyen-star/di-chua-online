import { SceneLinks } from "@/components/temple/map/SceneLinks";
import TeaPreparationSlot from "../../practices/[slug]/compositions/TeaPreparationSlot";

export const metadata = { title: "Hiên chùa" };

export default function VerandaPage() {
  return (
    <>
      <TeaPreparationSlot />
      <SceneLinks from="veranda" />
    </>
  );
}
