import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { CartDrawer } from "@/components/ui/CartDrawer";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: { default: "Pet Valley — Everything They Love.", template: "%s | Pet Valley" },
  description: "Thoughtfully chosen pet products for happier, healthier dogs and cats. International shipping.",
  openGraph: { siteName: "Pet Valley", type: "website" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await (async () => {
    try {
      const prisma = await getPrisma();
      return await prisma.storeSettings.upsert({ where: { id: "singleton" }, create: { id: "singleton" }, update: {} });
    } catch {
      return null;
    }
  })();

  return (
    <html lang="en">
      <body className="bg-cream text-charcoal antialiased">
        <Providers>
          {settings?.announcementActive && settings.announcementText && (
            <AnnouncementBar text={settings.announcementText} />
          )}
          <Navbar />
          {children}
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
