import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

/**
 * GET /api/media/<key>
 * Streams a previously-uploaded file straight out of the R2 "MEDIA" bucket.
 * Public — product/variant/banner media needs to be viewable by any visitor.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const objectKey = key.join("/");

  const { env } = await getCloudflareContext({ async: true });
  if (!env?.MEDIA) return NextResponse.json({ error: "Media storage is not configured" }, { status: 500 });

  const rangeHeader = req.headers.get("range") ?? undefined;
  const object = await env.MEDIA.get(objectKey, rangeHeader ? { range: req.headers } as any : undefined);
  if (!object) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("accept-ranges", "bytes");

  const isPartial = "range" in object && (object as any).range;
  if (isPartial) {
    const { offset, length } = (object as any).range;
    headers.set("content-range", `bytes ${offset}-${offset + length - 1}/${(object as any).size}`);
    return new NextResponse(object.body as any, { status: 206, headers });
  }

  return new NextResponse(object.body as any, { headers });
}
