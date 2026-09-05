"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center">
        <h1 className="font-display text-2xl text-charcoal">Something went wrong</h1>
        <p className="mt-2 text-sm text-charcoal-light">We hit an unexpected error. Please try again.</p>
        <Button variant="primary" className="mt-6" onClick={reset}>Try Again</Button>
      </body>
    </html>
  );
}
