ALTER TABLE "ProductVariant" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "ProductVariant" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "StoreSettings" ADD COLUMN "heroImageUrl" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN "heroTitle" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN "heroSubtitle" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN "heroCtaText" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN "heroCtaLink" TEXT;
