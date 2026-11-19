import { practices } from "@/content";
import { TeaPreparation } from "../TeaPreparation";

const tea = practices.find((p) => p.slug === "tra-3-phut");

/** The veranda's tea flow with the practice's own duration and closing line. */
export default function TeaPreparationSlot() {
  return (
    <>
      <h1>Hiên chùa</h1>
      <TeaPreparation
        slug="tra-3-phut"
        seconds={tea?.timerSeconds ?? 180}
        closingLine={tea?.closingLine ?? "Tách trà đã vơi."}
        kind="tea"
        next={null}
      />
    </>
  );
}
