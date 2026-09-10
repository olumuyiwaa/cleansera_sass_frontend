"use client";

import { Reveal } from "./Reveal";
import type { Service } from "@/app/api/cleansera-types";

type SiteServicesProps = {
  subdomain: string;
  services: Service[];
  primaryColor: string;
  onBook?: () => void;
};

function centsToDisplay(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
}

export function SiteServices({
  subdomain,
  services,
  primaryColor,
  onBook,
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
    <section id="services" className="scroll-mt-24 bg-white py-16 sm:py-20">
      <div className="site-container">
        <Reveal>
          <div className="max-w-2xl">
            <span className="site-eyebrow">
              <span
                className="site-eyebrow-dot"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 0 0 5px ${primaryColor}1f`,
                }}
              />
              What we offer
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#171B1A] sm:text-4xl">
              Services tailored to your space
            </h2>
            <p className="mt-3 text-base text-[#5F6664] sm:text-lg">
              Pick a service, add extras if you need them, and book a time that
              works for you.
            </p>
          </div>
        </Reveal>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {services.map((svc, i) => (
            <Reveal key={svc.id} delay={i * 60}>
              <li className="flex h-full flex-col justify-between rounded-[20px] border border-[#E8E4DE] bg-[#FAF9F6] p-5 sm:p-6 transition-shadow hover:shadow-[0_16px_40px_rgba(22,35,28,0.08)]">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-[#171B1A]">
                      {svc.name}
                    </h3>
                    <span className="shrink-0 rounded-full border border-[#E8E4DE] bg-white px-3 py-1 text-sm font-semibold text-[#5C5546]">
                      from {centsToDisplay(svc.basePriceCents)}
                    </span>
                  </div>
                  {svc.description && (
                    <p className="mt-2 text-sm leading-relaxed text-[#5F6664]">
                      {svc.description}
                    </p>
                  )}
                  {svc.estimatedMinutes ? (
                    <p className="mt-3 text-xs font-medium uppercase tracking-wider text-[#9C9483]">
                      ~{svc.estimatedMinutes} min
                    </p>
                  ) : null}
                </div>
                <a
                  href={bookHref}
                  onClick={handleBook}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ color: primaryColor }}
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
