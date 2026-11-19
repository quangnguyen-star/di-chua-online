export type PlaceId = "gate" | "courtyard" | "hall" | "pond" | "veranda" | "outside";

export type Place = {
  id: PlaceId;
  slug: string;
  name: string;
  blurb: string;
  href: string;
  scene: "day" | "night";
  next?: PlaceId;
  ready: boolean;
  legacyHrefs: string[];
};

/** The one route table: canonical href per place, plus every older href that must keep resolving. */
export const routes: Place[] = [
  {
    id: "gate", slug: "gate", name: "Cổng chùa", blurb: "Dừng lại một nhịp trước khi bước vào.",
    href: "/practices/breathing", scene: "day", next: "courtyard", ready: true,
    legacyHrefs: ["/practices/tho-2-phut", "/places/gate"],
  },
  {
    id: "courtyard", slug: "courtyard", name: "Sân chùa", blurb: "Quét lá, để tâm lắng xuống.",
    href: "/places/courtyard/sweeping", scene: "day", next: "hall", ready: true,
    legacyHrefs: ["/places/courtyard"],
  },
  {
    id: "hall", slug: "hall", name: "Chánh điện", blurb: "Nơi thắp một nén hương và ngồi yên.",
    href: "/places/hall", scene: "night", next: "pond", ready: true,
    legacyHrefs: ["/places/hall/incense", "/practices/sitting", "/practices/ngoi-yen-5-phut"],
  },
  {
    id: "pond", slug: "pond", name: "Bến sông", blurb: "Thả một ngọn đèn lên mặt nước.",
    href: "/places/pond/lantern", scene: "night", next: "veranda", ready: true,
    legacyHrefs: ["/places/pond", "/places/river"],
  },
  {
    id: "veranda", slug: "veranda", name: "Hiên chùa", blurb: "Một chén trà trong tiếng gió.",
    href: "/places/veranda", scene: "day", next: "outside", ready: true,
    legacyHrefs: ["/practices/tea", "/practices/tra-3-phut"],
  },
  {
    id: "outside", slug: "word", name: "Bên ngoài", blurb: "Mang sự tỉnh thức trở lại đời thường.",
    href: "/places/word", scene: "day", ready: true,
    legacyHrefs: [],
  },
];

/** Hrefs with no page of their own: [from, to] pairs served as permanent redirects by next.config.ts. */
export const redirects: [from: string, to: string][] = [
  ["/practices/breathing", "/practices/tho-2-phut"],
  ["/practices/sitting", "/places/hall"],
  ["/practices/tea", "/places/veranda"],
  ["/places/gate", "/practices/tho-2-phut"],
  ["/places/courtyard", "/places/courtyard/sweeping"],
  ["/places/pond", "/places/pond/lantern"],
  ["/places/river", "/places/pond/lantern"],
];

/** Resolve any canonical or legacy href to its place, or undefined. */
export function placeForHref(href: string): Place | undefined {
  return routes.find((r) => r.href === href || r.legacyHrefs.includes(href));
}

/** Only ready places are linked anywhere. */
export const readyRoutes = routes.filter((r) => r.ready);
