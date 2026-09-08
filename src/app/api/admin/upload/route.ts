import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_VIDEO_BYTES = 90 * 1024 * 1024; // 90MB — now that uploads are truly streamed
// end-to-end (no formData buffering, no arrayBuffer copy), the Worker's 128MB
// memory ceiling is no longer the binding constraint since memory usage
// stays low regardless of file size. The real ceiling is Cloudflare's
// account-level request body cap: 100MB on Free/Pro plans (200MB Business,
// 500MB Enterprise) — https://developers.cloudflare.com/workers/platform/limits/
// 90MB leaves headroom under the 100MB Free/Pro cap. If you're on Business
// or Enterprise, this can safely go higher (e.g. 180MB / 450MB).
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

/**
 * POST /api/admin/upload?filename=<name>
 * Raw binary body (NOT multipart/form-data) — Content-Type header identifies
 * the file type. Stores the file in the R2 "MEDIA" bucket and returns a
 * public URL (served back out through GET /api/media/[key]).
 *
 * This deliberately avoids req.formData(): parsing multipart bodies forces
 * the runtime to buffer the whole request into memory to find the boundary
 * markers before any file data is available, regardless of what we then do
 * with the resulting File object (streaming it out doesn't help — the
 * expensive part already happened during formData() itself). A raw
 * untouched POST body is a ReadableStream we can pipe straight into R2
 * without ever holding the full file in memory.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (role !== "ADMIN" && role !== "STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { env } = await getCloudflareContext({ async: true });
    if (!env?.MEDIA) {
      return NextResponse.json({ error: "Media storage is not configured on this deployment." }, { status: 500 });
    }

    const contentType = req.headers.get("content-type") || "";
    const filename = req.nextUrl.searchParams.get("filename") || "upload";
    if (!req.body) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const isVideo = ALLOWED_VIDEO_TYPES.has(contentType);
    const isImage = ALLOWED_IMAGE_TYPES.has(contentType);
    if (!isVideo && !isImage) {
      return NextResponse.json({ error: "Unsupported file type. Use JPG, PNG, WEBP, GIF images or MP4/WEBM/MOV videos." }, { status: 400 });
    }

    const contentLength = Number(req.headers.get("content-length") || 0);
    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (contentLength && contentLength > maxBytes) {
      return NextResponse.json({ error: `File too large. Max ${Math.round(maxBytes / (1024 * 1024))}MB.` }, { status: 400 });
    }
    if (!contentLength) {
      // R2's put() requires a stream with a KNOWN length up front (this is
      // what FixedLengthStream below provides) — without a Content-Length
      // header we have no way to declare that, so we can't safely stream
      // this upload at all.
      return NextResponse.json({ error: "Missing Content-Length header; cannot upload." }, { status: 400 });
    }

    const ext = filename.split(".").pop()?.toLowerCase() || (isVideo ? "mp4" : "jpg");
    const key = `${isVideo ? "videos" : "images"}/${crypto.randomUUID()}.${ext}`;

    // R2's put() rejects a plain ReadableStream with "must have a known
    // length" — it needs to know the total byte count up front (to set
    // Content-Length on the object) before it will accept a stream instead
    // of a fully-buffered body. FixedLengthStream is the Workers-runtime
    // primitive for exactly this: it declares the length while still
    // passing bytes through as a real stream, so nothing is buffered.
    // Accessed via globalThis (typed as any) since it's a Workers-runtime
    // global not guaranteed to be in every TS lib config.
    const FixedLengthStreamCtor = (globalThis as any).FixedLengthStream;
    const { readable, writable } = new FixedLengthStreamCtor(contentLength);

    // Both promises MUST be awaited together (not fire-and-forget): the pipe
    // feeds bytes in while put() consumes them concurrently. Leaving the
    // pipeTo() un-awaited let the Worker's execution context potentially
    // terminate before it finished, which is very likely what was causing
    // sporadic "Worker threw exception" crashes — not just on uploads
    // themselves, but on unrelated requests landing on the same isolate
    // shortly after (including product saves).
    await Promise.all([
      req.body.pipeTo(writable),
      env.MEDIA.put(key, readable, { httpMetadata: { contentType } }),
    ]);

    return NextResponse.json({
      url: `/api/media/${key}`,
      type: isVideo ? "video" : "image",
    });
  } catch (err: any) {
    // Whatever goes wrong (R2 write failure, a dropped connection on a
    // large upload, etc.) this ALWAYS returns valid JSON with a real error
    // status — previously an uncaught exception here could produce an
    // empty or truncated response body, which broke the client's
    // res.json() call with a cryptic "Unexpected end of JSON input"
    // instead of showing the actual problem.
    console.error("Upload failed:", err);
    return NextResponse.json({ error: err?.message || "Upload failed. Please try again." }, { status: 500 });
  }
}
