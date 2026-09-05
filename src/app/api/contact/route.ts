import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(5),
});

/**
 * No email provider is configured yet — set EMAIL_PROVIDER + RESEND_API_KEY
 * (see .env.example) and wire actual delivery here. For now this validates
 * and acknowledges the submission without silently pretending an email sent.
 */
export async function POST(req: NextRequest) {
  const { allowed } = rateLimit(`contact:${getClientIp(req)}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many messages sent. Please try again later." }, { status: 429 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (!process.env.EMAIL_PROVIDER) {
    return NextResponse.json({
      received: true,
      warning: "Message received but no email provider is configured — set EMAIL_PROVIDER to enable delivery.",
    });
  }

  // TODO: send via configured provider (e.g. Resend) once EMAIL_PROVIDER is set.
  return NextResponse.json({ received: true });
}
