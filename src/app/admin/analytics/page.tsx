import { getPrisma } from "@/lib/prisma";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { StatCard } from "@/components/admin/StatCard";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const prisma = await getPrisma();
  const paidOrders = await prisma.order.findMany({
    where: { paymentStatus: "PAID" },
    include: { items: { include: { product: { include: { category: true } } } }, shippingAddress: true },
  });

  const byDay = new Map<string, number>();
  const byCategory = new Map<string, number>();
  const byCountry = new Map<string, number>();
  const customerOrderCounts = new Map<string, number>();

  for (const o of paidOrders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) || 0) + Number(o.total));
    byCountry.set(o.shippingAddress.country, (byCountry.get(o.shippingAddress.country) || 0) + Number(o.total));
    customerOrderCounts.set(o.userId, (customerOrderCounts.get(o.userId) || 0) + 1);
    for (const item of o.items) {
      const cat = item.product.category.name;
      byCategory.set(cat, (byCategory.get(cat) || 0) + Number(item.unitPrice) * item.quantity);
    }
  }

  const chartData = Array.from(byDay.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }));
  const repeatCustomers = Array.from(customerOrderCounts.values()).filter((c: any) => c > 1).length;
  const revenue = paidOrders.reduce((s: any, o: any) => s + Number(o.total), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Analytics</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Revenue" value={`$${revenue.toFixed(2)}`} />
        <StatCard label="Orders" value={paidOrders.length.toString()} />
        <StatCard label="Repeat Customers" value={repeatCustomers.toString()} />
        <StatCard label="AOV" value={`$${(paidOrders.length ? revenue / paidOrders.length : 0).toFixed(2)}`} />
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-sm font-medium">Revenue over time</h2>
        <RevenueChart data={chartData} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-medium">Sales by Category</h2>
          {Array.from(byCategory.entries()).map(([cat, val]) => (
            <div key={cat} className="flex justify-between text-sm text-[#4b5563]"><span>{cat}</span><span>${val.toFixed(2)}</span></div>
          ))}
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-medium">Sales by Country</h2>
          {Array.from(byCountry.entries()).map(([country, val]) => (
            <div key={country} className="flex justify-between text-sm text-[#4b5563]"><span>{country}</span><span>${val.toFixed(2)}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}
