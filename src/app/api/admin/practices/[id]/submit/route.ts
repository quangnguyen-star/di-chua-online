import { NextResponse } from "next/server";
import { submitPractice } from "@/lib/admin";
import { authorize } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = authorize(req, ["editor"]);
  if (auth.error) return auth.error;
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const result = await submitPractice(Number(id));
  if (result === "not_found") return NextResponse.json({ error: "not found" }, { status: 404 });
  if (result === "nothing_to_submit") return NextResponse.json({ error: "nothing to submit" }, { status: 409 });
  return NextResponse.json({ ok: true });
}
