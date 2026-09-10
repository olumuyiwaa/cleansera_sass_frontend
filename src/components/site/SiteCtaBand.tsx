"use client";

import { Reveal } from "./Reveal";

type SiteCtaBandProps = {
  subdomain: string;
  businessName: string;
  primaryColor: string;
  onBook?: () => void;
};

export function SiteCtaBand({
  subdomain,
  businessName,
  primaryColor,
  onBook,
}: SiteCtaBandProps) {
  const bookHref = `/book-now/${subdomain}`;

  function handleBook(e: React.MouseEvent) {
    if (onBook) {
      e.preventDefault();
      onBook();
    }
  }

  return (
    <section className="py-16 sm:py-20">
      <div className="site-container">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-[28px] px-6 py-12 text-center sm:px-12 sm:py-16"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 45%, #263F32 100%)`,
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
              aria-hidden
            />
            <div className="relative z-[1]">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready for a cleaner space?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-base text-white/85 sm:text-lg">
                Book {businessName} online in minutes. Pick a service, choose a
                time, and we&apos;ll take care of the rest.
              </p>
              <a
                href={bookHref}
                onClick={handleBook}
                className="mt-8 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[14px] bg-white px-6 text-sm font-extrabold transition-transform hover:-translate-y-0.5"
                style={{ color: primaryColor }}
              >
                Book now
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
