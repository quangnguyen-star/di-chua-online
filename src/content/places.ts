import { routes, type PlaceId } from "./routes.ts";

export type { PlaceId };

export type Activity = {
  id: string;
  place: PlaceId;
  label: string;
  href: string;
  seconds?: number;
  ready: boolean;
  next?: string;
};

export const places: { id: PlaceId; name: string; blurb: string }[] = routes.map(({ id, name, blurb }) => ({ id, name, blurb }));

export const activities: Activity[] = [
  { id: "breathing", place: "gate", label: "Thở", href: "/practices/breathing", ready: true },
  { id: "sitting", place: "hall", label: "Ngồi yên", href: "/practices/sitting", ready: true },
  { id: "tea", place: "veranda", label: "Uống trà", href: "/practices/tea", ready: true },
  { id: "sweeping", place: "courtyard", label: "Quét sân", href: "/places/courtyard/sweeping", ready: true, next: "breathing" },
  { id: "incense", place: "hall", label: "Thắp hương", href: "/places/hall/incense", ready: true, next: "sitting" },
  { id: "lantern", place: "pond", label: "Thả đèn", href: "/places/pond/lantern", ready: true, next: "tea" },
];

/** Where a finished visit continues. */
export const visitCompletionNext = "sitting";
