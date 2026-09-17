import { NextResponse } from "next/server";

// Google Search Console verification. Served as an explicit App Router
// route (not a public/ static asset) so it's guaranteed to be reachable
// regardless of how the OpenNext/Cloudflare Workers ASSETS binding handles
// arbitrary public/ files at deploy time.
export const dynamic = "force-static";

export async function GET() {
  return new NextResponse("google-site-verification: google69b7376fbb088ee3.html", {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
