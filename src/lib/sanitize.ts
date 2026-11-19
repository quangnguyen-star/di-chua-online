const ALLOWED = new Set(["p", "br", "strong", "em", "b", "i", "u", "ul", "ol", "li", "h2", "h3", "blockquote", "a"]);
const SAFE_HREF = /^(https?:\/\/|mailto:)[^\s"'<>]*$/i;

const escapeText = (s: string) => s.replace(/&(?!(?:amp|lt|gt|quot|#\d+);)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Allowlist sanitizer: keeps a handful of formatting tags, drops every attribute except a safe <a href>. */
export function sanitizeHtml(input: string): string {
  const withoutBlocks = input.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  let out = "";
  let last = 0;
  const tag = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
  for (let m = tag.exec(withoutBlocks); m; m = tag.exec(withoutBlocks)) {
    out += escapeText(withoutBlocks.slice(last, m.index));
    last = m.index + m[0].length;
    const name = m[2].toLowerCase();
    if (!ALLOWED.has(name)) continue;
    if (m[1]) {
      if (name !== "br") out += `</${name}>`;
      continue;
    }
    if (name === "a") {
      const href = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(m[3]);
      const url = (href?.[1] ?? href?.[2] ?? "").trim();
      out += SAFE_HREF.test(url) ? `<a href="${url.replace(/&/g, "&amp;")}" rel="noopener noreferrer">` : "<a>";
    } else {
      out += `<${name}>`;
    }
  }
  return out + escapeText(withoutBlocks.slice(last).replace(/<[^>]*$/, ""));
}
