import { NextResponse } from "next/server";
import { reviewPractice } from "@/lib/admin";
import { authorize } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = authorize(req, ["reviewer"]);
  if (auth.error) return auth.error;
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const body = (await req.json().catch(() => null)) as { decision?: unknown; note?: unknown } | null;
  if (body?.decision !== "approved" && body?.decision !== "changes_requested") {
    return NextResponse.json({ error: "decision must be approved or changes_requested" }, { status: 400 });
  }
  const note = typeof body.note === "string" ? body.note.trim() : "";
  const result = await reviewPractice(Number(id), auth.session.email, body.decision, note);
  if (!result.ok) {
    return NextResponse.json({ error: result.error, problems: result.problems }, { status: result.code });
  }
  return NextResponse.json(result);
}
