import { getPrisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({ searchParams: searchParamsPromise }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const searchParams = await searchParamsPromise;
  const prisma = await getPrisma();
  const orders = await prisma.order.findMany({
    where: {
      ...(searchParams.status && { status: searchParams.status as any }),
      ...(searchParams.q && {
        OR: [
          { orderNumber: { contains: searchParams.q } },
          { user: { email: { contains: searchParams.q } } },
        ],
      }),
    },
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUNDED"];

  return (
    <div>
      <h1 className="text-xl font-semibold">Orders</h1>

      <form className="mt-4 flex gap-3">
        <input name="q" defaultValue={searchParams.q} placeholder="Search order # or email…" className="rounded-lg border border-[#e4e6e8] px-3 py-1.5 text-sm" />
        <select name="status" defaultValue={searchParams.status || ""} className="rounded-lg border border-[#e4e6e8] px-3 py-1.5 text-sm">
          <option value="">All statuses</option>
          {STATUSES.map((s: any) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="rounded-lg bg-sage-500 px-4 py-1.5 text-sm text-white">Filter</button>
      </form>

      <table className="mt-6 w-full overflow-hidden rounded-xl bg-white text-sm shadow-sm">
        <thead className="bg-[#f9fafb] text-left text-[#6b7280]">
          <tr>
            <th className="p-3">Order</th>
            <th className="p-3">Customer</th>
            <th className="p-3">Items</th>
            <th className="p-3">Total</th>
            <th className="p-3">Status</th>
            <th className="p-3">Payment</th>
            <th className="p-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o: any) => (
            <tr key={o.id} className="border-t border-[#f0f2f4] hover:bg-[#f9fafb]">
              <td className="p-3"><Link href={`/admin/orders/${o.id}`} className="font-medium text-sage-600">{o.orderNumber}</Link></td>
              <td className="p-3">{o.user.email}</td>
              <td className="p-3">{o.items.length}</td>
              <td className="p-3">${Number(o.total).toFixed(2)}</td>
              <td className="p-3">{o.status}</td>
              <td className="p-3">{o.paymentStatus}</td>
              <td className="p-3">{o.createdAt.toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
