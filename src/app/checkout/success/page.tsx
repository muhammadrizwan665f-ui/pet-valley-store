import { getPrisma } from "@/lib/prisma";
import { CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  const prisma = await getPrisma();
  const order = searchParams.order
    ? await prisma.order.findUnique({ where: { id: searchParams.order } })
    : null;

  // Note: return_url fires on the buyer's browser redirect, which can arrive
  // slightly before PayFast's ITN webhook updates paymentStatus. We show a
  // "confirming" state rather than falsely claiming payment is captured.
  const confirmed = order?.paymentStatus === "PAID";

  return (
    <main className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
      {confirmed ? (
        <CheckCircle2 className="h-12 w-12 text-sage-500" />
      ) : (
        <Clock className="h-12 w-12 text-sage-400" />
      )}
      <h1 className="font-display text-2xl text-charcoal">
        {confirmed ? "Payment confirmed" : "Confirming your payment…"}
      </h1>
      <p className="text-sm text-charcoal-light">
        {confirmed
          ? `Thank you — order ${order?.orderNumber} is being prepared.`
          : "PayFast is finalizing your payment. This page will update once confirmed, or check My Orders shortly."}
      </p>
      <Link href="/account/orders" className="text-sm font-medium text-sage-600 underline">
        View my orders
      </Link>
    </main>
  );
}
