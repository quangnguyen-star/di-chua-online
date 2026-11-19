export type PlaceId = "gate" | "courtyard" | "hall" | "pond" | "veranda" | "outside";

export type Activity = {
  id: string;
  place: PlaceId;
  label: string;
  href: string;
  seconds?: number;
  ready: boolean;
  next?: string;
};

export const places: { id: PlaceId; name: string; blurb: string }[] = [
  { id: "gate", name: "Cổng chùa", blurb: "Dừng lại một nhịp trước khi bước vào." },
  { id: "courtyard", name: "Sân chùa", blurb: "Quét lá, để tâm lắng xuống." },
  { id: "hall", name: "Chánh điện", blurb: "Nơi thắp một nén hương và ngồi yên." },
  { id: "pond", name: "Hồ sen", blurb: "Thả một ngọn đèn lên mặt nước." },
  { id: "veranda", name: "Hiên chùa", blurb: "Một chén trà trong tiếng gió." },
  { id: "outside", name: "Bên ngoài", blurb: "Mang sự tỉnh thức trở lại đời thường." },
];

export const activities: Activity[] = [
  { id: "breathing", place: "gate", label: "Thở", href: "/practices/breathing", ready: true },
  { id: "sitting", place: "hall", label: "Ngồi yên", href: "/practices/sitting", ready: true },
  { id: "tea", place: "veranda", label: "Uống trà", href: "/practices/tea", ready: true },
  { id: "sweeping", place: "courtyard", label: "Quét sân", href: "/places/courtyard/sweeping", ready: false, next: "breathing" },
  { id: "incense", place: "hall", label: "Thắp hương", href: "/places/hall/incense", ready: true, next: "sitting" },
  { id: "lantern", place: "pond", label: "Thả đèn", href: "/places/pond/lantern", ready: true, next: "tea" },
];

/** Where a finished visit continues. */
export const visitCompletionNext = "sitting";
