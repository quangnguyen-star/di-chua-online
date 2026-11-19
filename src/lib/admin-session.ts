import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { sessionFromCookieHeader, type Role, type Session } from "./auth";

/** Server-side page guard: redirects to the login page without a valid session or with the wrong role. */
export async function requirePageSession(roles: Role[] = ["editor", "reviewer"]): Promise<Session> {
  const session = sessionFromCookieHeader((await headers()).get("cookie"));
  if (!session) redirect("/admin/login");
  if (!roles.includes(session.role)) redirect("/admin");
  return session;
}
