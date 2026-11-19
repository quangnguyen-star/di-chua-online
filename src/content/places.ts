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
  { id: "breathing", place: "gate", label: "Thở", href: "/visit?stop=gate", ready: true },
  { id: "sitting", place: "hall", label: "Ngồi yên", href: "/visit?stop=hall", ready: true },
  { id: "tea", place: "veranda", label: "Uống trà", href: "/visit?stop=veranda", ready: true },
  { id: "sweeping", place: "courtyard", label: "Quét sân", href: "/visit?stop=courtyard", ready: true, next: "breathing" },
  { id: "incense", place: "hall", label: "Thắp hương", href: "/visit?stop=hall", ready: true, next: "sitting" },
  { id: "lantern", place: "pond", label: "Thả đèn", href: "/visit?stop=pond", ready: true, next: "tea" },
];

/** Where a finished visit continues. */
export const visitCompletionNext = "sitting";
