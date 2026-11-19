import { NextResponse } from "next/server";
import { createPractice, listItems, parseDraft } from "@/lib/admin";
import { authorize } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const auth = authorize(req, ["editor", "reviewer"]);
  if (auth.error) return auth.error;
  return NextResponse.json({ items: await listItems() });
}

export async function POST(req: Request) {
  const auth = authorize(req, ["editor"]);
  if (auth.error) return auth.error;
  const parsed = parseDraft(await req.json().catch(() => null));
  if (!parsed.draft) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    return NextResponse.json({ id: await createPractice(parsed.draft) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "slug already in use" }, { status: 409 });
  }
}
