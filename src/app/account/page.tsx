import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id }, include: { orders: true, addresses: true } });
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl text-charcoal">My Account</h1>
      <p className="mt-1 text-sm text-charcoal-light">{user.firstName} {user.lastName} · {user.email}</p>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <Link href="/account/orders" className="rounded-xl bg-white p-4 shadow-sm hover:bg-sage-50">
          <p className="font-medium text-charcoal">My Orders</p>
          <p className="text-xs text-charcoal-light">{user.orders.length} orders</p>
        </Link>
        <Link href="/account/addresses" className="rounded-xl bg-white p-4 shadow-sm hover:bg-sage-50">
          <p className="font-medium text-charcoal">Addresses</p>
          <p className="text-xs text-charcoal-light">{user.addresses.length} saved</p>
        </Link>
        <Link href="/wishlist" className="rounded-xl bg-white p-4 shadow-sm hover:bg-sage-50">
          <p className="font-medium text-charcoal">Wishlist</p>
        </Link>
        <Link href="/account/profile" className="rounded-xl bg-white p-4 shadow-sm hover:bg-sage-50">
          <p className="font-medium text-charcoal">Edit Profile</p>
        </Link>
      </div>
    </main>
  );
}
