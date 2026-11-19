import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "node:stream";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

let client: S3Client | undefined;

function s3(): S3Client {
  client ??= new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.AWS_REGION ?? "us-east-1",
    forcePathStyle: true,
  });
  return client;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return new Response("Not found", { status: 404 });

  const rows = await query<{ audio_key: string | null }>(
    "SELECT audio_key FROM practice WHERE id = $1 AND status = 'published'",
    [Number(id)],
  );
  const key = rows[0]?.audio_key;
  if (!key || !process.env.S3_BUCKET) return new Response("Not found", { status: 404 });

  const range = req.headers.get("range");
  try {
    const obj = await s3().send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Range: range && /^bytes=\d*-\d*$/.test(range) ? range : undefined,
      }),
    );
    if (!obj.Body) return new Response("Not found", { status: 404 });

    const headers = new Headers({
      "Content-Type": obj.ContentType ?? "audio/mpeg",
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=3600",
    });
    if (obj.ContentLength !== undefined) headers.set("Content-Length", String(obj.ContentLength));
    if (obj.ContentRange) headers.set("Content-Range", obj.ContentRange);

    const body = Readable.toWeb(obj.Body as Readable) as ReadableStream;
    return new Response(body, { status: obj.ContentRange ? 206 : 200, headers });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
