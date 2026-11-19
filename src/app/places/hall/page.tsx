import { SceneLinks } from "@/components/temple/map/SceneLinks";
import IncenseHall from "./IncenseHall";
import { parseVariant } from "./incense";

export const metadata = { title: "Chánh điện" };

export default async function HallPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { variant } = await searchParams;
  return (
    <>
      <IncenseHall variant={parseVariant(variant)} />
      <SceneLinks from="hall" />
    </>
  );
}
