import { getPrisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({ searchParams: searchParamsPromise }: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await searchParamsPromise;
  const prisma = await getPrisma();
  const products = await prisma.product.findMany({
    where: searchParams.q ? { name: { contains: searchParams.q } } : {},
    include: { category: true, images: { take: 1 } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className="rounded-lg bg-sage-500 px-4 py-1.5 text-sm text-white">+ New Product</Link>
      </div>

      <form className="mt-4">
        <input name="q" defaultValue={searchParams.q} placeholder="Search products…" className="rounded-lg border border-[#e4e6e8] px-3 py-1.5 text-sm" />
      </form>

      <table className="mt-6 w-full overflow-hidden rounded-xl bg-white text-sm shadow-sm">
        <thead className="bg-[#f9fafb] text-left text-[#6b7280]">
          <tr>
            <th className="p-3">Image</th>
            <th className="p-3">Product</th>
            <th className="p-3">Category</th>
            <th className="p-3">Price</th>
            <th className="p-3">Inventory</th>
            <th className="p-3">Status</th>
            <th className="p-3">Created</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p: any) => (
            <tr key={p.id} className="border-t border-[#f0f2f4] hover:bg-[#f9fafb]">
              <td className="p-3">
                <img src={p.images[0]?.url || "/images/placeholder-product.jpg"} alt="" className="h-10 w-10 rounded-lg object-cover" />
              </td>
              <td className="p-3 font-medium">{p.name}</td>
              <td className="p-3">{p.category.name}</td>
              <td className="p-3">${Number(p.price).toFixed(2)}</td>
              <td className="p-3">{p.stock}</td>
              <td className="p-3">{p.isPublished ? "Published" : "Draft"}</td>
              <td className="p-3">{p.createdAt.toLocaleDateString()}</td>
              <td className="p-3">
                <Link href={`/admin/products/${p.id}`} className="text-sage-600">Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
