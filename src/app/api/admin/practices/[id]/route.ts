import { NextResponse } from "next/server";
import { getWorkingCopy, parseDraft, updatePractice } from "@/lib/admin";
import { authorize } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const auth = authorize(req, ["editor", "reviewer"]);
  if (auth.error) return auth.error;
  const { id } = await params;
  const item = /^\d+$/.test(id) ? await getWorkingCopy(Number(id)) : undefined;
  return item ? NextResponse.json(item) : NextResponse.json({ error: "not found" }, { status: 404 });
}

export async function PUT(req: Request, { params }: Ctx) {
  const auth = authorize(req, ["editor"]);
  if (auth.error) return auth.error;
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const parsed = parseDraft(await req.json().catch(() => null));
  if (!parsed.draft) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    const result = await updatePractice(Number(id), parsed.draft);
    return result === "ok" ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "slug already in use" }, { status: 409 });
  }
}
