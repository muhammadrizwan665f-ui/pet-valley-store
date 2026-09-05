import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl text-charcoal">My Orders</h1>
      {orders.length === 0 ? (
        <p className="mt-8 text-charcoal-light">You haven't placed any orders yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((o: any) => (
            <Link key={o.id} href={`/account/orders/${o.id}`} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm hover:bg-sage-50">
              <div>
                <p className="font-medium text-charcoal">{o.orderNumber}</p>
                <p className="text-xs text-charcoal-light">{o.items.length} items · {o.status}</p>
              </div>
              <span className="text-sm font-semibold">${Number(o.total).toFixed(2)}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
