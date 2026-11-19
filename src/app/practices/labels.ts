import { practices } from "@/content";

export type PracticeKind = "breathing" | "sitting" | "tea";

export const kindBySlug: Record<string, PracticeKind> = {
  "tho-2-phut": "breathing",
  "ngoi-yen-5-phut": "sitting",
  "tra-3-phut": "tea",
};

/** The one optional step offered after a practice; the last practice has none. */
const nextBySlug: Record<string, string> = {
  "tho-2-phut": "ngoi-yen-5-phut",
  "ngoi-yen-5-phut": "tra-3-phut",
};

export function nextPractice(slug: string) {
  const next = practices.find((p) => p.slug === nextBySlug[slug]);
  return next ? { href: `/practices/${next.slug}`, title: next.title } : null;
}

export const timerStateLabels = {
  ready: "Sẵn sàng",
  running: "Đang thực hành",
  paused: "Đang tạm dừng",
  complete: "Đã xong",
} as const;

export type TimerState = keyof typeof timerStateLabels;

export const kindCaptions: Record<PracticeKind, string> = {
  breathing: "Một vòng tròn để giữ mắt nhìn, không cần theo nhịp nào.",
  sitting: "Một ô cửa tĩnh lặng, ánh sáng đứng yên.",
  tea: "Một tách trà đặt trên đĩa, hơi nước bốc lên chậm.",
};
