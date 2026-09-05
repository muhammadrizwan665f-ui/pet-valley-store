import { MetadataRoute } from "next";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const prisma = await getPrisma();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const staticRoutes = [
    "", "/shop", "/dogs", "/cats", "/about", "/contact", "/faq",
    "/shipping-policy", "/return-policy", "/privacy-policy", "/terms",
  ].map((path: any) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const products = await prisma.product.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });

  const productRoutes = products.map((p: any) => ({
    url: `${siteUrl}/product/${p.slug}`,
    lastModified: p.updatedAt,
  }));

  return [...staticRoutes, ...productRoutes];
}
