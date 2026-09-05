import { getPrisma } from "@/lib/prisma";
import { InventoryRow } from "@/components/admin/InventoryRow";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const prisma = await getPrisma();
  const products = await prisma.product.findMany({
    select: { id: true, name: true, sku: true, stock: true, lowStockAt: true },
    orderBy: { stock: "asc" },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold">Inventory</h1>
      <table className="mt-6 w-full overflow-hidden rounded-xl bg-white text-sm shadow-sm">
        <thead className="bg-[#f9fafb] text-left text-[#6b7280]">
          <tr><th className="p-3">Product</th><th className="p-3">SKU</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3">Update</th></tr>
        </thead>
        <tbody>
          {products.map((p: any) => (
            <InventoryRow key={p.id} product={p} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
