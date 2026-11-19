import { ArtCanvas, Ground, Mist, Sky } from "@/components/temple/art";

/** The veranda frame: sky, floor boards and a low rail. Follows the site theme, so evening is the dark variant. */
export function VerandaArt() {
  return (
    <ArtCanvas variant="auto" label="Hiên chùa nhìn ra sân, sàn gỗ và lan can thấp" testId="art-veranda">
      <Sky />
      <Mist y={110} height={50} opacity={0.35} />
      <Ground />
      <path d="M0 150 H400 M30 150 V190 M130 150 V190 M230 150 V190 M330 150 V190" fill="none" stroke="var(--wood)" strokeWidth="4" />
    </ArtCanvas>
  );
}
