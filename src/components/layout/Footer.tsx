import Link from "next/link";

const COLUMNS = [
  { title: "Shop", links: [["Dogs", "/dogs"], ["Cats", "/cats"], ["Best Sellers", "/shop"]] },
  { title: "Support", links: [["Contact Us", "/contact"], ["FAQ", "/faq"], ["Shipping Policy", "/shipping-policy"], ["Return Policy", "/return-policy"]] },
  { title: "Company", links: [["About Us", "/about"], ["Privacy Policy", "/privacy-policy"], ["Terms & Conditions", "/terms"]] },
];

export function Footer() {
  return (
    <footer className="border-t border-sage-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <p className="font-display text-lg text-charcoal">PET VALLEY</p>
            <p className="mt-2 text-sm text-charcoal-light">Everything They Love.</p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-medium text-charcoal">{col.title}</p>
              <ul className="mt-3 space-y-2 text-sm text-charcoal-light">
                {col.links.map(([label, href]) => (
                  <li key={href}><Link href={href} className="hover:text-sage-600">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-xs text-charcoal-light">© {new Date().getFullYear()} Pet Valley. All rights reserved.</p>
      </div>
    </footer>
  );
}
