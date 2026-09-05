export const metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-4xl text-charcoal">About Pet Valley</h1>
      <div className="mt-6 space-y-4 text-charcoal-light">
        <p>
          Pet Valley started with a simple belief: pets deserve products chosen with the same
          care and attention their owners give them every day. We curate toys, grooming
          essentials, feeding gear, travel accessories, and comfort items for dogs and cats —
          nothing added just to fill a catalog.
        </p>
        <p>
          We ship internationally to the USA, UK, Canada, Australia and beyond, backing every
          order with secure checkout, easy returns, and a support team that actually knows pets.
        </p>
        <p>
          Every product on Pet Valley is picked for quality, safety, and the difference it
          makes in a pet's daily life — because everything they love matters to us too.
        </p>
      </div>
    </main>
  );
}
