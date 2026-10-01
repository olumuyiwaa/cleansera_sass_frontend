"use client";

import { Reveal } from "./Reveal";
import { formatMoneyUnits } from "@/app/services/currency";
import type { WidgetService } from "@/app/api/widget.api";

type SiteServicesProps = {
  subdomain: string;
  services: WidgetService[];
  primaryColor: string;
  onBook?: () => void;
  /** ISO currency of the business (prices used to render with a hardcoded $). */
  currency?: string;
};

function centsToDisplay(cents: number, currency?: string) {
  return formatMoneyUnits(cents / 100, currency, { whole: true });
}

export function SiteServices({
  subdomain,
  services,
  primaryColor,
  onBook,
  currency,
}: SiteServicesProps) {
  if (!services.length) return null;

  const bookHref = `/book-now/${subdomain}`;

  function handleBook(e: React.MouseEvent) {
    if (onBook) {
      e.preventDefault();
      onBook();
    }
  }

  return (
    <section id="services" className="site-section-light scroll-mt-24 py-20 sm:py-24">
      <div className="site-container">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="site-eyebrow">
              <span
                className="site-eyebrow-dot"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 0 0 5px ${primaryColor}1f`,
                }}
              />
              Cleaning services
            </span>
            <h2 className="site-section-title mt-5">
              A clean for every kind of home.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#616963] sm:text-lg">
              Choose the service that fits your space, see clear starting prices,
              and book a time that works for you.
            </p>
          </div>
        </Reveal>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc, i) => (
            <Reveal key={svc.id} delay={i * 60}>
              <li className="site-service-item flex h-full flex-col justify-between border-t border-[#d9d4c8] py-6 sm:py-7">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between gap-4">
                    <span className="site-service-index">{String(i + 1).padStart(2, "0")}</span>
                    <span className="site-service-price">
                      From {centsToDisplay(svc.basePriceCents, currency)}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-[#102c24] sm:text-2xl">
                    {svc.name}
                  </h3>
                  {svc.description && (
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-[#616963]">
                      {svc.description}
                    </p>
                  )}
                  {svc.estimatedMinutes ? (
                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#91856b]">
                      Approx. {svc.estimatedMinutes} min
                    </p>
                  ) : null}
                </div>
                <a
                  href={bookHref}
                  onClick={handleBook}
                  className="site-service-link mt-6 inline-flex items-center gap-2 text-sm font-semibold"
                  style={{ "--service-color": primaryColor } as React.CSSProperties}
                >
                  Book this service
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
