import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";

const SRC = resolve(import.meta.dirname, "../src");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

function cssKeys(file: string): Set<string> {
  const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const keys = new Set<string>();
  for (const m of css.matchAll(/\.(-?[A-Za-z_][\w-]*)/g)) keys.add(m[1]);
  return keys;
}

test("every styles.X reference names a key that exists in its CSS module", () => {
  const problems: string[] = [];
  const sources = walk(SRC).filter((f) => /\.(tsx?|jsx?)$/.test(f) && !f.endsWith(".d.ts"));
  for (const file of sources) {
    const src = readFileSync(file, "utf8");
    for (const imp of src.matchAll(/import\s+(\w+)\s+from\s+["'](\.[^"']+\.module\.css)["']/g)) {
      const [, local, rel] = imp;
      const cssFile = resolve(dirname(file), rel);
      if (!existsSync(cssFile)) {
        problems.push(`${file}: imports missing ${rel}`);
        continue;
      }
      const keys = cssKeys(cssFile);
      const used = [
        ...[...src.matchAll(new RegExp(`\\b${local}\\.(\\w+)`, "g"))].map((m) => m[1]),
        ...[...src.matchAll(new RegExp(`\\b${local}\\[\\s*["']([\\w-]+)["']\\s*\\]`, "g"))].map((m) => m[1]),
      ];
      for (const key of used) if (!keys.has(key)) problems.push(`${file}: ${local}.${key} is not defined in ${rel}`);
    }
  }
  assert.deepEqual(problems, []);
});

test("next.config does not route CSS modules through a global-CSS loader", () => {
  const cfg = readFileSync(resolve(SRC, "../next.config.ts"), "utf8");
  assert.doesNotMatch(cfg, /@tailwindcss\/turbopack/);
});
