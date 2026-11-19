import { SceneLinks } from "@/components/temple/map/SceneLinks";
import WordBooth from "./WordBooth";

export const metadata = { title: "Quầy chữ" };

export default function WordPage() {
  return (
    <>
      <WordBooth />
      <SceneLinks from="outside" />
    </>
  );
}
