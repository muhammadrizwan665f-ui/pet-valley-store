import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({ searchParams: searchParamsPromise }: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await searchParamsPromise;
  const prisma = await getPrisma();
  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(searchParams.q && { email: { contains: searchParams.q } }),
    },
    include: { orders: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-xl font-semibold">Customers</h1>
      <form className="mt-4">
        <input name="q" defaultValue={searchParams.q} placeholder="Search by email…" className="rounded-lg border border-[#e4e6e8] px-3 py-1.5 text-sm" />
      </form>
      <table className="mt-6 w-full overflow-hidden rounded-xl bg-white text-sm shadow-sm">
        <thead className="bg-[#f9fafb] text-left text-[#6b7280]">
          <tr><th className="p-3">Customer</th><th className="p-3">Orders</th><th className="p-3">Total Spent</th><th className="p-3">Joined</th></tr>
        </thead>
        <tbody>
          {customers.map((c: any) => {
            const spent = c.orders.filter((o: any) => o.paymentStatus === "PAID").reduce((s: any, o: any) => s + Number(o.total), 0);
            return (
              <tr key={c.id} className="border-t border-[#f0f2f4]">
                <td className="p-3">{c.firstName} {c.lastName} <span className="text-[#9ca3af]">({c.email})</span></td>
                <td className="p-3">{c.orders.length}</td>
                <td className="p-3">${spent.toFixed(2)}</td>
                <td className="p-3">{c.createdAt.toLocaleDateString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
