/** Vertical story-format card (1080x1920). Draws the word only: no id, no network. */
export function renderStoryCard(word: string, reflection: string): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);
  ctx.fillStyle = "#f4ecd8";
  ctx.fillRect(0, 0, 1080, 1920);
  ctx.fillStyle = "#3b2a1a";
  ctx.textAlign = "center";
  ctx.font = "bold 220px serif";
  ctx.fillText(word, 540, 900, 940);
  ctx.font = "44px serif";
  const words = reflection.split(" ");
  let line = "";
  let y = 1060;
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > 860 && line) {
      ctx.fillText(line, 540, y);
      line = w;
      y += 64;
    } else line = next;
  }
  ctx.fillText(line, 540, y);
  ctx.font = "36px serif";
  ctx.fillText("Đi Chùa Online", 540, 1780);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}
