import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";

export type Role = "editor" | "reviewer";
export type Session = { email: string; role: Role; exp: number };
type SeedUser = { email: string; role: Role; hash: string };

export const SESSION_COOKIE = "admin_session";
export const SESSION_TTL_SEC = 8 * 3600;

const isRole = (v: unknown): v is Role => v === "editor" || v === "reviewer";

/** Users come from the ADMIN_SEED env var: a JSON array of {email, role, hash}. Nothing is committed. */
export function seedUsers(): SeedUser[] {
  const raw = process.env.ADMIN_SEED;
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (u): u is SeedUser =>
        !!u && typeof u.email === "string" && typeof u.hash === "string" && isRole(u.role),
    );
  } catch {
    return [];
  }
}

/** Hash format: `scrypt:<saltHex>:<keyHex>` (64-byte key). */
export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, key] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !key) return false;
  const expected = Buffer.from(key, "hex");
  const actual = scryptSync(password, Buffer.from(salt, "hex"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function authenticate(email: string, password: string): SeedUser | null {
  const user = seedUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  return user && verifyPassword(password, user.hash) ? user : null;
}

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET must be set (16+ chars)");
  return s;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export function signSession(email: string, role: Role, now = Date.now()): string {
  const payload = Buffer.from(
    JSON.stringify({ email, role, exp: Math.floor(now / 1000) + SESSION_TTL_SEC }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** Valid only if the signature matches, it has not expired and the user is still in the seed with that role. */
export function verifySession(token: string | undefined, now = Date.now()): Session | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const want = Buffer.from(sign(payload));
  const got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Session;
    if (!isRole(s.role) || typeof s.email !== "string" || s.exp * 1000 < now) return null;
    const user = seedUsers().find((u) => u.email === s.email);
    return user && user.role === s.role ? s : null;
  } catch {
    return null;
  }
}

export function sessionFromCookieHeader(header: string | null | undefined): Session | null {
  const match = (header ?? "").split(/;\s*/).find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  return verifySession(match?.slice(SESSION_COOKIE.length + 1));
}

export function sessionCookie(token: string, maxAge = SESSION_TTL_SEC): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

const json = (status: number, error: string) =>
  new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/** Server-side gate for every admin API route: 401 without a session, 403 for the wrong role. */
export function authorize(
  req: Request,
  roles: Role[],
): { session: Session; error?: undefined } | { session?: undefined; error: Response } {
  const session = sessionFromCookieHeader(req.headers.get("cookie"));
  if (!session) return { error: json(401, "unauthenticated") };
  if (!roles.includes(session.role)) return { error: json(403, "forbidden") };
  return { session };
}
