export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-3xl text-charcoal">{title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-charcoal-light">{children}</div>
    </main>
  );
}
