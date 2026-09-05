import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { OrderTimeline } from "@/components/account/OrderTimeline";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const order = await prisma.order.findFirst({
    where: { id, userId: (session.user as any).id },
    include: { items: { include: { product: true } }, shipment: true, shippingAddress: true },
  });
  if (!order) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-2xl text-charcoal">Order {order.orderNumber}</h1>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-sm font-medium text-charcoal">Status</h2>
          <OrderTimeline currentStatus={order.status} />
          {order.shipment?.trackingNumber && (
            <p className="mt-4 text-sm text-charcoal-light">
              Tracking: {order.shipment.carrier} — {order.shipment.trackingNumber}
            </p>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-sm font-medium text-charcoal">Items</h2>
          <ul className="space-y-2 text-sm">
            {order.items.map((item: any) => (
              <li key={item.id} className="flex justify-between">
                <span>{item.product.name} × {item.quantity}</span>
                <span>${(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-sage-100 pt-3 text-sm font-semibold">
            Total: ${Number(order.total).toFixed(2)}
          </div>
        </div>
      </div>
    </main>
  );
}
