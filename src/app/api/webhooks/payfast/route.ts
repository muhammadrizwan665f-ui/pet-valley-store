import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { PayFastProvider } from "@/lib/payments/payfast";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/payfast
 * PayFast's Instant Transaction Notification (ITN) endpoint.
 * Register this exact URL in PayFast → My Account → Integration → Notify URL.
 *
 * Security: never trust this postback on signature alone —
 * it is re-validated against PayFast's own server before any order
 * is marked paid. Always responds 200 quickly, per PayFast's requirement,
 * even on validation failure (so PayFast doesn't endlessly retry a
 * request we've already rejected).
 */
export async function POST(req: NextRequest) {
  const prisma = await getPrisma();
  const rawBody = await req.text();
  const params = new URLSearchParams(rawBody);
  const signature = params.get("signature") || "";
  const paymentId = params.get("m_payment_id"); // our order.id
  const paymentStatus = params.get("payment_status"); // "COMPLETE" | "FAILED" | ...
  const amountGross = params.get("amount_gross");

  const payfast = new PayFastProvider();
  const isValid = await payfast.verifyWebhook(rawBody, signature);

  if (!isValid || !paymentId) {
    return new NextResponse("invalid", { status: 200 });
  }

  const order = await prisma.order.findUnique({ where: { id: paymentId } });
  if (!order) {
    return new NextResponse("order not found", { status: 200 });
  }

  // Defence in depth: confirm the amount PayFast says was paid matches our order total.
  const amountMatches = amountGross && Math.abs(parseFloat(amountGross) - Number(order.total)) < 0.01;
  if (!amountMatches) {
    await prisma.orderStatusEvent.create({
      data: { orderId: order.id, status: order.status, note: "ITN amount mismatch — payment not confirmed" },
    });
    return new NextResponse("amount mismatch", { status: 200 });
  }

  if (paymentStatus === "COMPLETE") {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        status: "PROCESSING",
        payment: {
          upsert: {
            create: { provider: "payfast", providerRef: params.get("pf_payment_id") || "", amount: order.total, status: "PAID" },
            update: { status: "PAID", providerRef: params.get("pf_payment_id") || "" },
          },
        },
        statusHistory: { create: { status: "PROCESSING", note: "Payment confirmed via PayFast ITN" } },
      },
    });
  } else {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "FAILED",
        statusHistory: { create: { status: order.status, note: `PayFast reported status: ${paymentStatus}` } },
      },
    });
  }

  return new NextResponse("ok", { status: 200 });
}
