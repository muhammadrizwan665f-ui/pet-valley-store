import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const prisma = await getPrisma();
  const recentPayments = await prisma.payment.findMany({
    include: { order: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const configured = !!process.env.PAYFAST_MERCHANT_ID && !!process.env.PAYFAST_MERCHANT_KEY;
  const mode = process.env.PAYFAST_MODE === "live" ? "Live" : "Sandbox";

  return (
    <div>
      <h1 className="text-xl font-semibold">Payments</h1>

      <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
        <p className="text-sm">
          Provider: <span className="font-medium">PayFast</span> ·{" "}
          Status: <span className={configured ? "text-sage-600" : "text-amber-600"}>{configured ? "Configured" : "Not configured"}</span> ·{" "}
          Mode: <span className="font-medium">{mode}</span>
        </p>
        {!configured && (
          <p className="mt-2 text-xs text-[#6b7280]">
            Set PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY, PAYFAST_PASSPHRASE in your environment to accept live payments.
          </p>
        )}
      </div>

      <table className="mt-6 w-full overflow-hidden rounded-xl bg-white text-sm shadow-sm">
        <thead className="bg-[#f9fafb] text-left text-[#6b7280]">
          <tr><th className="p-3">Order</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Provider Ref</th><th className="p-3">Date</th></tr>
        </thead>
        <tbody>
          {recentPayments.map((p: any) => (
            <tr key={p.id} className="border-t border-[#f0f2f4]">
              <td className="p-3">{p.order.orderNumber}</td>
              <td className="p-3">${Number(p.amount).toFixed(2)}</td>
              <td className="p-3">{p.status}</td>
              <td className="p-3">{p.providerRef}</td>
              <td className="p-3">{p.createdAt.toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
