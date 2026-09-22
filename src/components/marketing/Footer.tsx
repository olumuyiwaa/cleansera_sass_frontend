import Link from "next/link";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "For businesses", href: "/for-businesses" },
      { label: "For cleaners", href: "/for-cleaners" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Support", href: "/support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
] as const;

export default function MarketingFooter() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-sage-600 font-display text-sm font-semibold text-paper">
                C
              </span>
              <span className="font-display text-base font-semibold text-ink">CleanSera</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-stone-500">
              Scheduling, dispatch, and a branded booking site for cleaning businesses — built so
              your team runs the show, not a marketplace.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-sm font-semibold text-ink">{col.title}</div>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-stone-500 hover:text-sage-700">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col-reverse items-start justify-between gap-4 border-t border-stone-200 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} CleanSera. All rights reserved.
          </p>
          <p className="text-xs text-stone-400">Made for cleaning businesses, not around them.</p>
        </div>
      </div>
    </footer>
  );
}
