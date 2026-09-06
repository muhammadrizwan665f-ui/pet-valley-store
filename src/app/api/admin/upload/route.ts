import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

/**
 * POST /api/admin/upload
 * multipart/form-data with a single "file" field.
 * Stores the file in the R2 "MEDIA" bucket and returns a public URL
 * (served back out through GET /api/media/[key]).
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN" && role !== "STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { env } = await getCloudflareContext({ async: true });
  if (!env?.MEDIA) {
    return NextResponse.json({ error: "Media storage is not configured on this deployment." }, { status: 500 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const isVideo = ALLOWED_VIDEO_TYPES.has(file.type);
  const isImage = ALLOWED_IMAGE_TYPES.has(file.type);
  if (!isVideo && !isImage) {
    return NextResponse.json({ error: "Unsupported file type. Use JPG, PNG, WEBP, GIF images or MP4/WEBM/MOV videos." }, { status: 400 });
  }

  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: `File too large. Max ${Math.round(maxBytes / (1024 * 1024))}MB.` }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || (isVideo ? "mp4" : "jpg");
  const key = `${isVideo ? "videos" : "images"}/${crypto.randomUUID()}.${ext}`;

  await env.MEDIA.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  return NextResponse.json({
    url: `/api/media/${key}`,
    type: isVideo ? "video" : "image",
  });
}
