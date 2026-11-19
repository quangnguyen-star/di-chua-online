import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 25 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/ogg": "ogg",
};

let client: S3Client | undefined;

function s3(): S3Client {
  client ??= new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.AWS_REGION ?? "us-east-1",
    forcePathStyle: true,
  });
  return client;
}

export async function POST(req: Request) {
  const auth = authorize(req, ["editor"]);
  if (auth.error) return auth.error;
  if (!process.env.S3_BUCKET) return NextResponse.json({ error: "storage not configured" }, { status: 503 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "file is required" }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "only mp3, m4a or ogg audio is accepted" }, { status: 415 });
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: `file must be between 1 byte and ${MAX_BYTES} bytes` }, { status: 413 });
  }

  const key = `audio/${randomUUID()}.${ext}`;
  await s3().send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    }),
  );
  return NextResponse.json({ audio_key: key }, { status: 201 });
}
