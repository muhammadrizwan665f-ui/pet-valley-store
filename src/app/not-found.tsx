import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-6xl text-sage-300">404</p>
      <h1 className="mt-4 font-display text-2xl text-charcoal">Page not found</h1>
      <p className="mt-2 text-sm text-charcoal-light">The page you're looking for doesn't exist or has moved.</p>
      <Link href="/" className="mt-6 rounded-xl bg-sage-500 px-6 py-3 text-sm text-white">Back to Home</Link>
    </main>
  );
}
