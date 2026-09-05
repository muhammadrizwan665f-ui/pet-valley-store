import { getPrisma } from "@/lib/prisma";
import { ReviewRow } from "@/components/admin/ReviewRow";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const prisma = await getPrisma();
  const reviews = await prisma.review.findMany({
    include: { product: true, user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const distribution = [1, 2, 3, 4, 5].map((star: any) => ({
    star,
    count: reviews.filter((r: any) => r.rating === star).length,
  }));

  return (
    <div>
      <h1 className="text-xl font-semibold">Reviews</h1>

      <div className="mt-4 flex gap-4 rounded-xl bg-white p-4 shadow-sm">
        {distribution.reverse().map((d: any) => (
          <div key={d.star} className="text-sm">{d.star}★ — {d.count}</div>
        ))}
      </div>

      <ul className="mt-4 divide-y divide-[#f0f2f4] rounded-xl bg-white shadow-sm">
        {reviews.map((r: any) => (
          <ReviewRow key={r.id} review={{ id: r.id, rating: r.rating, title: r.title, body: r.body, status: r.status, product: r.product.name, user: r.user.email }} />
        ))}
      </ul>
    </div>
  );
}
