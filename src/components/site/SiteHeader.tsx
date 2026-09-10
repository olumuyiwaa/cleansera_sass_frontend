"use client";

import { useEffect, useState } from "react";

type SiteHeaderProps = {
  subdomain: string;
  businessName: string;
  logoUrl?: string | null;
  primaryColor: string;
  onBook?: () => void;
};

export function SiteHeader({
  subdomain,
  businessName,
  logoUrl,
  primaryColor,
  onBook,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = [
    { label: "Services", href: "#services" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Contact", href: "#contact" },
  ];

  const initial = businessName.trim().charAt(0).toUpperCase() || "C";
  const bookHref = `/book-now/${subdomain}`;

  function handleBook(e: React.MouseEvent) {
    if (onBook) {
      e.preventDefault();
      onBook();
      setMenuOpen(false);
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-200 ${
        scrolled
          ? "border-[#E2DED3] bg-[#FBFBF8]/90 backdrop-blur-xl"
          : "border-transparent bg-[#FBFBF8]/80 backdrop-blur-md"
      }`}
    >
      <div className="site-container flex items-center justify-between gap-6 py-4">
        <a href="#top" className="flex items-center gap-2.5 shrink-0">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={businessName}
              className="h-9 w-9 rounded-xl object-contain"
            />
          ) : (
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-sm font-semibold text-[#FBFBF8] shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
              }}
            >
              {initial}
            </span>
          )}
          <span className="text-lg font-semibold tracking-tight text-[#171B1A]">
            {businessName}
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-1" aria-label="Site navigation">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#5C5546] transition-colors hover:text-[#171B1A]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block shrink-0">
          <a
            href={bookHref}
            onClick={handleBook}
            className="inline-flex min-h-[42px] items-center rounded-[12px] px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            style={{
              backgroundColor: primaryColor,
              boxShadow: `0 10px 24px ${primaryColor}33`,
            }}
          >
            Book now
          </a>
        </div>

        <button
          type="button"
          className="md:hidden grid h-9 w-9 place-items-center rounded-lg border border-[#E2DED3]"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="relative block h-3 w-5">
            <span
              className={`absolute left-0 top-0 h-[2px] w-full bg-[#171B1A] transition-transform ${
                menuOpen ? "translate-y-[5px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 bottom-0 h-[2px] w-full bg-[#171B1A] transition-transform ${
                menuOpen ? "-translate-y-[5px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[#E2DED3] bg-[#FBFBF8]">
          <div className="site-container flex flex-col py-3">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="py-2.5 text-sm font-medium text-[#5C5546]"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href={bookHref}
              onClick={handleBook}
              className="mt-2 rounded-[12px] px-4 py-2.5 text-center text-sm font-semibold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Book now
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
