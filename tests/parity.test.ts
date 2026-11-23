import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { SCENES } from "../src/components/temple/stage/scenes/registry.ts";
import { lanternColors } from "../src/components/temple/river/sequence.ts";
import { routes } from "../src/content/routes.ts";

/*
 * V1 parity (DCO-86): the static reference under reference/di-chua-online-site/ against the sources on main. The reference
 * has no CSS or JS behaviour, so this is a source-level check of routes, titles, headings, copy and test ids. It does not
 * render anything; see reports/v1-parity-verification.md for what that leaves unverified.
 */
const ROOT = resolve(import.meta.dirname, "..");
const REF = join(ROOT, "reference/di-chua-online-site");
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
const SRC = walk(join(ROOT, "src")).filter((f) => /\.(tsx?|css)$/.test(f) && !/\.test\.ts$/.test(f));
const allSrc = SRC.map((f) => readFileSync(f, "utf8")).join("\n");
const squash = (s: string) => s.replace(/\s+/g, " ");
const flatSrc = squash(allSrc);
const decode = (s: string) =>
  s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

type Page = { path: string; ref: string; files: string[]; testids?: boolean };
const PAGES: Page[] = [
  { path: "/", ref: "index.html", files: ["src/app/page.tsx", "src/app/layout.tsx"] },
  { path: "/places", ref: "places/index.html", files: ["src/app/places/page.tsx"] },
  { path: "/places/hall", ref: "places/hall/index.html", files: ["src/app/places/hall/page.tsx"] },
  { path: "/places/hall/incense", ref: "places/hall/incense/index.html", files: ["src/app/places/hall/incense/page.tsx"] },
  { path: "/places/courtyard/sweeping", ref: "places/courtyard/sweeping/index.html", files: ["src/app/places/courtyard/sweeping/page.tsx"] },
  { path: "/places/pond/lantern", ref: "places/pond/lantern/index.html", files: ["src/app/places/pond/lantern/page.tsx"] },
  { path: "/places/veranda", ref: "places/veranda/index.html", files: ["src/app/places/veranda/page.tsx"] },
  { path: "/places/word", ref: "places/word/index.html", files: ["src/app/places/word/page.tsx"] },
  { path: "/visit", ref: "visit/index.html", files: ["src/app/visit/page.tsx"] },
  { path: "/about", ref: "about/index.html", files: ["src/app/about/page.tsx"] },
  { path: "/privacy", ref: "privacy/index.html", files: ["src/app/privacy/page.tsx"] },
  { path: "404", ref: "404.html", files: ["src/app/not-found.tsx"] },
];

/** Ids the reference spells differently from main, on purpose. Each maps to the main spelling. */
const RENAMED: Record<string, string> = {
  "sweep-pile-0": "sweep-pile",
};

const idsOf = (html: string) => [...new Set([...html.matchAll(/data-testid="([^"]*)"/g)].map((m) => m[1]))];

/** An id is produced by main when its literal is in the source, or a template prefix before `${` matches it. */
function produced(id: string): boolean {
  const want = RENAMED[id] ?? id;
  if (allSrc.includes(`"${want}"`) || allSrc.includes(`'${want}'`) || allSrc.includes("`" + want + "`")) return true;
  for (const m of allSrc.matchAll(/`([a-z][a-z0-9-]*-)\$\{/g)) if (want.startsWith(m[1])) return true;
  return false;
}

test("every reference page has a route on main", () => {
  for (const p of PAGES) {
    assert.ok(existsSync(join(REF, p.ref)), `reference ${p.ref} exists`);
    for (const f of p.files) assert.ok(existsSync(join(ROOT, f)), `${p.path}: ${f} missing`);
  }
});

test("every reference page title is set on main", () => {
  for (const p of PAGES) {
    const title = decode(readFileSync(join(REF, p.ref), "utf8").match(/<title>([^<]*)/)?.[1] ?? "");
    assert.ok(title, `${p.ref} has a title`);
    assert.ok(allSrc.includes(title), `${p.path}: title "${title}" not in src`);
  }
});

test("every reference h1 is on main", () => {
  for (const p of PAGES) {
    const h1 = readFileSync(join(REF, p.ref), "utf8").match(/<h1[^>]*>([^<]+)/)?.[1];
    if (h1) assert.ok(allSrc.includes(decode(h1)), `${p.path}: h1 "${h1}" not in src`);
  }
});

test("every reference test id is produced by main", () => {
  const missing: string[] = [];
  for (const p of PAGES) {
    for (const id of idsOf(readFileSync(join(REF, p.ref), "utf8"))) if (!produced(id)) missing.push(`${p.path}: ${id}`);
  }
  assert.deepEqual(missing, []);
});

test("dynamic id families cover every place and every colour the reference lists", () => {
  const ids = (page: string) => idsOf(readFileSync(join(REF, page), "utf8"));
  const placeIds = routes.map((r) => r.id).sort();
  for (const [page, prefix] of [["index.html", "map-place-"], ["places/index.html", "place-card-"]] as const) {
    const got = ids(page).filter((i) => i.startsWith(prefix)).map((i) => i.slice(prefix.length)).sort();
    assert.deepEqual(got, placeIds, `${page} ${prefix}*`);
  }
  const colours = ids("places/pond/lantern/index.html").filter((i) => i.startsWith("lantern-color-")).map((i) => i.slice(14));
  // Main offers three of the reference's seven lantern colours (see the report); each one it offers must exist there.
  for (const c of lanternColors) assert.ok(colours.includes(c.id), `lantern colour ${c.id} is not in the reference`);
  for (const s of ["ambience", "cues", "music"]) assert.ok(allSrc.includes(`id: "${s}"`), `sound ${s}`);
});

test("the copy of the static pages is unchanged from the reference", () => {
  for (const p of ["about/index.html", "privacy/index.html", "404.html"]) {
    const html = readFileSync(join(REF, p), "utf8");
    const main = html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? "";
    const texts = [...main.matchAll(/<(?:h1|h2|p|li)\b[^>]*>([^<]{12,})/g)].map((m) => squash(decode(m[1]).trim()));
    assert.ok(texts.length > 0, `${p} has copy`);
    for (const t of texts) assert.ok(flatSrc.includes(t), `${p}: "${t.slice(0, 60)}" not in src`);
  }
});

test("privacy wording stays true to what the code stores", () => {
  const privacy = readFileSync(join(ROOT, "src/app/privacy/page.tsx"), "utf8");
  const keys = [...allSrc.matchAll(/(?:WORD_KEY|SPENT_KEY)\s*=\s*"([^"]+)"/g)].map((m) => m[1]).sort();
  assert.deepEqual(keys, ["dc.incense.spent", "dc.word"]);
  for (const k of keys) assert.ok(privacy.includes(`<code>${k}</code>`), k);
  const users = SRC.filter((f) => /localStorage|sessionStorage|document\.cookie|indexedDB/.test(readFileSync(f, "utf8")) && !/privacy/.test(f))
    .map((f) => f.slice(ROOT.length + 1))
    .sort();
  assert.deepEqual(users, ["src/app/places/hall/incense.ts", "src/app/places/word/WordBooth.tsx"]);
  assert.doesNotMatch(allSrc, /sessionStorage|document\.cookie|indexedDB/);
});

/** What each stop must draw, from the DCO-86 plan checklist. Order is not checked here, only presence. */
const CHECKLIST: Record<string, string[]> = {
  gate: ["moon", "ridges", "umbrella-trees", "tam-quan", "hanging-lamps", "stairs", "stair-lamps"],
  courtyard: ["moon", "hall", "hanging-lamps", "ground", "banyans", "fallen-leaves", "broom"],
  hall: ["columns", "statue", "hanging-lamps", "altar", "incense-bowl", "incense-stick"],
  pond: ["moon", "ridges", "bank-and-gate", "umbrella-trees", "water", "lily-pads", "boat", "lanterns", "reeds"],
  veranda: ["moon", "ridges", "window-frame", "table", "teapot", "cup", "railing", "rain"],
  outside: ["moon", "mountains", "skyline", "umbrella-trees", "stairway", "path-lamps"],
};

test("each stop declares the named layers its still needs", () => {
  for (const [place, want] of Object.entries(CHECKLIST)) {
    const have = SCENES[place as keyof typeof SCENES].layers;
    for (const l of want) assert.ok(have.includes(l), `${place} lacks layer "${l}" (has ${have.join(", ")})`);
  }
});

test("declared layers are unique and each one is drawn by its scene file", () => {
  for (const place of Object.keys(SCENES) as (keyof typeof SCENES)[]) {
    const layers = SCENES[place].layers;
    assert.equal(new Set(layers).size, layers.length, `${place} repeats a layer`);
    const src = readFileSync(join(ROOT, `src/components/temple/stage/scenes/${place}.ts`), "utf8");
    const drawn = [...src.matchAll(/"([a-z][A-Za-z-]*)"/g)].map((m) => m[1]);
    const inherited = ["backdrop.ts", "common.ts"].map((f) => readFileSync(join(ROOT, `src/components/temple/stage/scenes/${f}`), "utf8")).join("\n");
    for (const l of layers) assert.ok(drawn.includes(l) || inherited.includes(`"${l}"`), `${place}: "${l}" declared, never named in its file`);
  }
});

test("no river layer outside the pond", () => {
  const RIVER = /lantern|water|lily|mote|river/;
  for (const place of Object.keys(SCENES) as (keyof typeof SCENES)[]) {
    if (place === "pond") continue;
    for (const l of SCENES[place].layers) assert.doesNotMatch(l, RIVER, `${place}: ${l}`);
  }
});
