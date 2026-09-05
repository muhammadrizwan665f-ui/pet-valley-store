import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getPrisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const prisma = await getPrisma();
  const { allowed } = rateLimit(`forgot-password:${getClientIp(req)}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ message: "If an account exists for that email, a reset link has been sent." });
  }

  const { email } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: email?.toLowerCase() } });

  // Always respond the same way whether or not the account exists,
  // so this endpoint can't be used to enumerate registered emails.
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}`;

    if (process.env.EMAIL_PROVIDER) {
      // TODO: send resetUrl via configured provider (e.g. Resend).
    } else {
      // No email provider configured — log so this is testable in dev,
      // never expose the token directly in the API response.
      console.log(`[dev only] Password reset link for ${email}: ${resetUrl}`);
    }
  }

  return NextResponse.json({ message: "If an account exists for that email, a reset link has been sent." });
}
