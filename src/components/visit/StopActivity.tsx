"use client";

import { practices } from "@/content";
import type { Embed } from "@/lib/visit/embed";
import Gate from "@/components/temple/scenes/Gate";
import Sweeping from "@/app/places/courtyard/sweeping/Sweeping";
import IncenseHall from "@/app/places/hall/IncenseHall";
import LanternFlow from "@/app/places/pond/lantern/LanternFlow";
import WordBooth from "@/app/places/word/WordBooth";
import { TeaPreparation } from "@/app/practices/[slug]/TeaPreparation";

const tea = practices.find((p) => p.slug === "tra-3-phut");

/** Stop ids that run a shared activity inside the tour. */
export const embeddedStops = ["gate", "courtyard", "hall", "pond", "veranda", "outside"] as const;

/**
 * The shared activity for a stop, run with the stop's shortened config. Callers key it by stop so each
 * entry mounts fresh: nothing (least of all the lantern thought) is carried from one stop to the next.
 */
export default function StopActivity({ stopId, seconds, paused, onNext }: { stopId: string; seconds: number; paused: boolean; onNext?: () => void }) {
  const embed: Embed = { seconds, paused, fullscreen: true };
  switch (stopId) {
    case "gate":
      return <Gate embed={embed} onNext={onNext} />;
    case "courtyard":
      return <Sweeping embed={embed} />;
    case "hall":
      return <IncenseHall embed={embed} />;
    case "pond":
      return <LanternFlow embed={embed} />;
    case "veranda":
      return <TeaPreparation slug="tra-3-phut" seconds={seconds} closingLine={tea?.closingLine ?? "Tách trà đã vơi."} kind="tea" next={null} embed={embed} />;
    case "outside":
      return <WordBooth embed={embed} />;
    default:
      return null;
  }
}
