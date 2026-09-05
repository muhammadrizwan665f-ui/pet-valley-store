import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, ShoppingBag, Package, FolderTree, Users, Boxes,
  Ticket, Star, BarChart3, Truck, CreditCard, Settings,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/shipping", label: "Shipping", icon: Truck },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  // Defence in depth: middleware already blocks this, but a server-rendered
  // layout should never assume the request reached it legitimately.
  if (!session || (role !== "ADMIN" && role !== "STAFF")) redirect("/login");

  return (
    <div className="flex min-h-screen bg-[#f5f6f7] text-[#1a1d1f]">
      <aside className="w-64 shrink-0 border-r border-[#e4e6e8] bg-white">
        <div className="px-6 py-5">
          <p className="text-lg font-semibold">Pet Valley <span className="text-sage-500">Admin</span></p>
        </div>
        <nav className="space-y-1 px-3">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#4b5563] hover:bg-[#f0f2f4]">
              <Icon size={16} /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
