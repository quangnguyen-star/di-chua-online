import assert from "node:assert/strict";
import { randomBytes, scryptSync } from "node:crypto";
import { test } from "node:test";
import { authorize, signSession } from "../src/lib/auth.ts";
import { publishProblems } from "../src/lib/publish.ts";
import { sanitizeHtml } from "../src/lib/sanitize.ts";

const hash = (pw: string) => `scrypt:${"ab".repeat(8)}:${scryptSync(pw, Buffer.from("ab".repeat(8), "hex"), 64).toString("hex")}`;

process.env.SESSION_SECRET = randomBytes(24).toString("hex");
process.env.ADMIN_SEED = JSON.stringify([
  { email: "ed@example.test", role: "editor", hash: hash("x") },
  { email: "rev@example.test", role: "reviewer", hash: hash("y") },
]);

const reqWith = (token?: string) =>
  new Request("http://localhost/api/admin/x", { headers: token ? { cookie: `admin_session=${token}` } : {} });

test("unauthenticated request gets 401", () => {
  assert.equal(authorize(reqWith(), ["editor"]).error?.status, 401);
  assert.equal(authorize(reqWith("garbage.token"), ["editor"]).error?.status, 401);
});

test("tampered session is rejected", () => {
  const token = signSession("ed@example.test", "editor");
  const [payload, sig] = token.split(".");
  const forged = Buffer.from(JSON.stringify({ email: "ed@example.test", role: "reviewer", exp: 9999999999 })).toString("base64url");
  assert.equal(authorize(reqWith(`${forged}.${sig}`), ["reviewer"]).error?.status, 401);
  assert.ok(payload);
});

test("editor cannot use reviewer routes, reviewer can", () => {
  const editor = signSession("ed@example.test", "editor");
  const reviewer = signSession("rev@example.test", "reviewer");
  assert.equal(authorize(reqWith(editor), ["reviewer"]).error?.status, 403);
  assert.ok(authorize(reqWith(reviewer), ["reviewer"]).session);
});

test("publish requires transcript with audio, rights and credits", () => {
  const base = { slug: "a", kind: "practice" as const, title: "T", summary: "", body: "<p>x</p>", duration_sec: 60, audio_key: "audio/a.mp3", transcript: "", rights_record: "", credits: "" };
  assert.equal(publishProblems(base).length, 3);
  assert.deepEqual(publishProblems({ ...base, transcript: "t", rights_record: "r", credits: "c" }), []);
  assert.equal(publishProblems({ ...base, audio_key: null, rights_record: "r", credits: "c" }).length, 0);
});

test("sanitizer strips scripts, handlers and unsafe links", () => {
  const out = sanitizeHtml('<p onclick="x()">Hi</p><script>alert(1)</script><a href="javascript:alert(1)">l</a><img src=x onerror=y><b>ok</b>');
  assert.equal(out, "<p>Hi</p><a>l</a><b>ok</b>");
  assert.equal(sanitizeHtml('<a href="https://e.test/a?b=1">l</a>'), '<a href="https://e.test/a?b=1" rel="noopener noreferrer">l</a>');
});
