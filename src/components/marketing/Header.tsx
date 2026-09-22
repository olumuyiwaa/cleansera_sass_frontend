"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { APP_URL } from "@/lib/marketing/siteConfig";

const NAV_ITEMS = [
  { label: "About", href: "/about" },
  { label: "For businesses", href: "/for-businesses" },
  { label: "For cleaners", href: "/for-cleaners" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing-page" },
] as const;

export default function MarketingHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-200 ${
        scrolled
          ? "border-stone-200 bg-paper/85 backdrop-blur-xl"
          : "border-transparent bg-paper/80 backdrop-blur-md"
      }`}
    >
      <div className="container-page flex items-center justify-between gap-6 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(135deg,#3f6b52,#6e9c82)] font-display font-semibold text-paper shadow-sm">
            C
          </span>
          <span className="font-display text-lg font-semibold text-ink">CleanSera</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-sage-50 text-sage-700" : "text-stone-600 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <a href={`/signin`} className="text-sm font-medium text-stone-600 hover:text-ink">
            Sign in
          </a>
          <Link
            href="/for-businesses#demo"
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-sage-800"
          >
            Book a demo
          </Link>
        </div>

        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-sm border border-stone-200 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="relative block h-3 w-5">
            <span
              className={`absolute left-0 top-0 h-[2px] w-full bg-ink transition-transform ${
                menuOpen ? "translate-y-[5px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute bottom-0 left-0 h-[2px] w-full bg-ink transition-transform ${
                menuOpen ? "-translate-y-[5px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-stone-200 bg-paper md:hidden">
          <div className="container-page flex flex-col py-3">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="py-2.5 text-sm font-medium text-stone-700">
                {item.label}
              </Link>
            ))}
            <a href={`/signin`} className="py-2.5 text-sm font-medium text-stone-700">
              Sign in
            </a>
            <Link
              href="/for-businesses#demo"
              className="mt-2 rounded-md bg-ink px-4 py-2.5 text-center text-sm font-semibold text-paper"
            >
              Book a demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
