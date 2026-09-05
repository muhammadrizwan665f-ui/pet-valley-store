import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// NOTE: this seed script is for LOCAL DEV only (against a local SQLite file
// via `DATABASE_URL="file:./local.db"`). The actual Cloudflare D1 database
// used in production was already seeded directly via SQL — see
// migrations/0001_init.sql and the admin/category/product INSERTs run
// against the real D1 instance during setup.

const prisma = new PrismaClient();

async function main() {
  // --- Store settings ---
  await prisma.storeSettings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      storeName: "Pet Valley",
      storeEmail: "hello@petvalley.example",
      supportEmail: "support@petvalley.example",
      currency: "USD",
      freeShippingOver: 50,
      flatShippingRate: 6.99,
      announcementText: "FREE SHIPPING ON ORDERS OVER $50",
      announcementActive: true,
    },
    update: {},
  });

  // --- Admin user ---
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@petvalley.example";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      firstName: "Store",
      lastName: "Admin",
      role: "ADMIN",
    },
    update: {},
  });
  console.log(`Seeded admin: ${adminEmail} / ${adminPassword} — change this password after first login.`);

  // --- Categories ---
  const categoryData = [
    { name: "Toys", slug: "toys", petType: null },
    { name: "Grooming", slug: "grooming", petType: null },
    { name: "Feeding", slug: "feeding", petType: null },
    { name: "Travel", slug: "travel", petType: null },
    { name: "Comfort", slug: "comfort", petType: null },
    { name: "Pet Care", slug: "pet-care", petType: null },
  ];
  const categories = [];
  for (const c of categoryData) {
    categories.push(await prisma.category.upsert({ where: { slug: c.slug }, create: c, update: {} }));
  }

  // --- Sample products (placeholder imagery — replace with real product photography) ---
  const sampleProducts = [
    { name: "Plush Squeaky Bone Toy", petType: "dog", price: 12.99, compareAtPrice: 16.99, cat: "toys" },
    { name: "Interactive Feather Wand", petType: "cat", price: 9.99, compareAtPrice: null, cat: "toys" },
    { name: "Deshedding Grooming Brush", petType: "both", price: 18.5, compareAtPrice: 24.0, cat: "grooming" },
    { name: "Slow-Feed Puzzle Bowl", petType: "dog", price: 15.0, compareAtPrice: null, cat: "feeding" },
    { name: "Ceramic Cat Feeding Set", petType: "cat", price: 21.0, compareAtPrice: 27.5, cat: "feeding" },
    { name: "Foldable Travel Carrier", petType: "both", price: 34.99, compareAtPrice: null, cat: "travel" },
    { name: "Orthopedic Memory Foam Bed", petType: "dog", price: 49.0, compareAtPrice: 59.0, cat: "comfort" },
    { name: "Cozy Cat Window Perch", petType: "cat", price: 27.5, compareAtPrice: null, cat: "comfort" },
  ];

  for (const [i, p] of sampleProducts.entries()) {
    const category = categories.find((c) => c.slug === p.cat)!;
    await prisma.product.upsert({
      where: { slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
      create: {
        name: p.name,
        slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        categoryId: category.id,
        petType: p.petType,
        description: `${p.name} — a thoughtfully chosen Pet Valley pick for happier, healthier pets.`,
        features: JSON.stringify(["Durable materials", "Vet-reviewed design", "Easy to clean"]),
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        sku: `PV-${1000 + i}`,
        stock: 25,
        isPublished: true,
        images: { create: [{ url: "/images/placeholder-product.jpg", sortOrder: 0 }] },
      },
      update: {},
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
