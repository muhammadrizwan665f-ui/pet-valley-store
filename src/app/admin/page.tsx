import { getPrisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/StatCard";
import { RevenueChart } from "@/components/admin/RevenueChart";

export const dynamic = "force-dynamic";

function startOfRange(range: string): Date {
  const now = new Date();
  switch (range) {
    case "today": return new Date(now.setHours(0, 0, 0, 0));
    case "7d": return new Date(now.getTime() - 7 * 86400000);
    case "90d": return new Date(now.getTime() - 90 * 86400000);
    case "year": return new Date(now.getFullYear(), 0, 1);
    default: return new Date(now.getTime() - 30 * 86400000); // "30d" default
  }
}

export default async function AdminDashboardPage({ searchParams: searchParamsPromise }: { searchParams: Promise<{ range?: string }> }) {
  const searchParams = await searchParamsPromise;
  const prisma = await getPrisma();
  const range = searchParams.range || "30d";
  const since = startOfRange(range);

  const [orders, todayOrders, customers, paidOrders] = await Promise.all([
    prisma.order.findMany({ where: { createdAt: { gte: since } } }),
    prisma.order.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({ where: { createdAt: { gte: since }, paymentStatus: "PAID" } }),
  ]);

  const revenue = paidOrders.reduce((s: any, o: any) => s + Number(o.total), 0);
  const todayRevenue = paidOrders
    .filter((o: any) => o.createdAt >= new Date(new Date().setHours(0, 0, 0, 0)))
    .reduce((s: any, o: any) => s + Number(o.total), 0);
  const aov = paidOrders.length ? revenue / paidOrders.length : 0;

  // Group revenue by day for the chart
  const byDay = new Map<string, number>();
  for (const o of paidOrders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) || 0) + Number(o.total));
  }
  const chartData = Array.from(byDay.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }));

  const lowStock = await prisma.product.findMany({
    where: { stock: { lte: 5 } },
    select: { id: true, name: true, stock: true },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <form>
          <select name="range" defaultValue={range} className="rounded-lg border border-[#e4e6e8] px-3 py-1.5 text-sm">
            <option value="today">Today</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
            <option value="year">This Year</option>
          </select>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Revenue" value={`$${revenue.toFixed(2)}`} />
        <StatCard label="Today's Revenue" value={`$${todayRevenue.toFixed(2)}`} />
        <StatCard label="Orders" value={orders.length.toString()} />
        <StatCard label="Today's Orders" value={todayOrders.toString()} />
        <StatCard label="Customers" value={customers.toString()} />
        <StatCard label="Avg Order Value" value={`$${aov.toFixed(2)}`} />
        <StatCard label="Products Sold" value={paidOrders.length.toString()} />
        <StatCard label="Low Stock Items" value={lowStock.length.toString()} tone={lowStock.length ? "warning" : "default"} />
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-sm font-medium">Revenue over time</h2>
        <RevenueChart data={chartData} />
      </div>

      {lowStock.length > 0 && (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-medium">Low Stock Products</h2>
          <ul className="text-sm text-[#4b5563]">
            {lowStock.map((p: any) => (
              <li key={p.id} className="flex justify-between border-b border-[#f0f2f4] py-1 last:border-0">
                <span>{p.name}</span><span>{p.stock} left</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
