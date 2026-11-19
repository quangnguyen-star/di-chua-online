import { authenticate, sessionCookie, signSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const email = String(form?.get("email") ?? "");
  const password = String(form?.get("password") ?? "");
  const user = authenticate(email, password);
  const target = new URL(user ? "/admin" : "/admin/login?error=1", req.url);
  const headers = new Headers({ Location: target.pathname + target.search });
  if (user) headers.append("Set-Cookie", sessionCookie(signSession(user.email, user.role)));
  return new Response(null, { status: 303, headers });
}
