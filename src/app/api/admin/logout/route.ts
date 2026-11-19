import { sessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  return new Response(null, {
    status: 303,
    headers: { Location: "/admin/login", "Set-Cookie": sessionCookie("", 0) },
  });
}
