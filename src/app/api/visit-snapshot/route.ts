import { NextResponse } from "next/server";
import { getVisitSnapshot } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await getVisitSnapshot();
    if (!snapshot) return NextResponse.json({ error: "no published content" }, { status: 404 });
    return NextResponse.json(snapshot);
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
