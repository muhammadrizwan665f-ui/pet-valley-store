import { XCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
      <XCircle className="h-12 w-12 text-charcoal-light" />
      <h1 className="font-display text-2xl text-charcoal">Payment cancelled</h1>
      <p className="text-sm text-charcoal-light">
        No charge was made. Your cart is still saved — you can try again whenever you're ready.
      </p>
      <Link href="/cart" className="text-sm font-medium text-sage-600 underline">
        Return to cart
      </Link>
    </main>
  );
}
