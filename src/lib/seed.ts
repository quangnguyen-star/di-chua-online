import type { Pool } from "pg";

const PRACTICES = [
  {
    slug: "tho-hai-phut",
    kind: "breathing",
    title: "Thở chậm hai phút",
    summary: "Hai phút để thở chậm lại và trở về với hiện tại.",
    body: "Ngồi thoải mái, thả lỏng vai. Hít vào chậm rãi đếm bốn, thở ra chậm rãi đếm sáu. Khi tâm trí đi lạc, nhẹ nhàng đưa sự chú ý trở lại hơi thở.",
    durationSec: 120,
  },
  {
    slug: "quet-co-the",
    kind: "practice",
    title: "Quét cơ thể",
    summary: "Đi qua từng phần cơ thể bằng sự chú ý dịu dàng.",
    body: "Nằm hoặc ngồi yên. Đưa sự chú ý từ bàn chân lên đến đỉnh đầu, dừng lại ở mỗi vùng một nhịp thở và chỉ quan sát, không cần thay đổi điều gì.",
    durationSec: 300,
  },
  {
    slug: "di-bo-cham",
    kind: "practice",
    title: "Đi bộ chậm",
    summary: "Mỗi bước chân là một lần trở về.",
    body: "Đi chậm trong một khoảng ngắn. Cảm nhận gót chân chạm đất, bàn chân lăn về phía trước. Khi đến cuối đường, dừng lại, thở, rồi quay đầu và tiếp tục.",
    durationSec: 300,
  },
];

const REFLECTIONS = [
  { text: "Hơi thở là cây cầu nối thân và tâm.", attribution: "Thích Nhất Hạnh" },
  { text: "Không có con đường đến bình an, bình an chính là con đường.", attribution: "Thích Nhất Hạnh" },
  { text: "Hãy để mọi thứ chậm lại một chút, bạn đã đủ rồi.", attribution: "Lời nhắc" },
];

/** Seeds an empty database. Rows are drafts unless SEED_PUBLISHED=1 outside production. */
export async function seedIfEmpty(db: Pool): Promise<void> {
  const publish = process.env.SEED_PUBLISHED === "1" && process.env.NODE_ENV !== "production";
  const status = publish ? "published" : "draft";

  const practices = await db.query("SELECT 1 FROM practice LIMIT 1");
  if (practices.rowCount === 0) {
    for (const [i, p] of PRACTICES.entries()) {
      await db.query(
        `INSERT INTO practice (slug, kind, title, summary, body, duration_sec, sort_order, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (slug) DO NOTHING`,
        [p.slug, p.kind, p.title, p.summary, p.body, p.durationSec, i, status],
      );
    }
  }

  const reflections = await db.query("SELECT 1 FROM reflection LIMIT 1");
  if (reflections.rowCount === 0) {
    for (const r of REFLECTIONS) {
      await db.query("INSERT INTO reflection (text, attribution, status) VALUES ($1, $2, $3)", [
        r.text,
        r.attribution,
        status,
      ]);
    }
  }
}
