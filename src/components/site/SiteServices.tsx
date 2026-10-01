"use client";

import { useLocale } from "next-intl";
import { Reveal } from "./Reveal";
import { formatMoneyUnits } from "@/app/services/currency";
import type { WidgetService } from "@/app/api/widget.api";

type SiteServicesProps = {
  subdomain: string;
  services: WidgetService[];
  primaryColor: string;
  onBook?: () => void;
  /** ISO currency of the business */
  currency?: string;
};

type Copy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  fromLabel: string;
  approxMin: (n: number) => string;
  bookThis: string;
  emptyTitle: string;
  emptyBody: string;
  portalLink: string;
  noDescription: string;
  addons: (n: number) => string;
  model: Record<"FLAT" | "PER_SQFT" | "PER_ROOM" | "HOURLY", string>;
};

const COPY: Record<"en" | "nl", Copy> = {
  en: {
    eyebrow: "Cleaning services",
    title: "A clean for every kind of home.",
    subtitle:
        "Choose the service that fits your space, see clear starting prices, and book a time that works for you.",
    fromLabel: "From",
    approxMin: (n) => `Approx. ${n} min`,
    bookThis: "Book this service",
    emptyTitle: "Services coming soon",
    emptyBody:
        "This business is still setting up its service menu. Please check back shortly or use the client portal if you already have an account.",
    portalLink: "Client portal",
    noDescription: "Details available when you book.",
    addons: (n) => (n === 1 ? "1 add-on available" : `${n} add-ons available`),
    model: {
      FLAT: "Fixed price",
      PER_SQFT: "Per m²",
      PER_ROOM: "Per room",
      HOURLY: "Hourly",
    },
  },
  nl: {
    eyebrow: "Schoonmaakdiensten",
    title: "Een schoonmaak voor elk type woning.",
    subtitle:
        "Kies de dienst die bij uw ruimte past, zie duidelijke startprijzen en boek een tijd die u uitkomt.",
    fromLabel: "Vanaf",
    approxMin: (n) => `Ca. ${n} min`,
    bookThis: "Boek deze dienst",
    emptyTitle: "Diensten binnenkort beschikbaar",
    emptyBody:
        "Dit bedrijf is de dienstenlijst nog aan het inrichten. Kom later terug of gebruik het klantportaal als u al een account heeft.",
    portalLink: "Klantportaal",
    noDescription: "Details ziet u bij het boeken.",
    addons: (n) => (n === 1 ? "1 extra beschikbaar" : `${n} extra's beschikbaar`),
    model: {
      FLAT: "Vaste prijs",
      PER_SQFT: "Per m²",
      PER_ROOM: "Per kamer",
      HOURLY: "Per uur",
    },
  },
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
  const locale = useLocale();
  const t = COPY[locale === "nl" ? "nl" : "en"];
  const bookHref = `/book-now/${subdomain}`;

  function handleBook(e: React.MouseEvent) {
    if (onBook) {
      e.preventDefault();
      onBook();
    }
  }

  if (!services.length) {
    return (
        <section id="services" className="site-section-light scroll-mt-24 py-20 sm:py-24">
          <div className="site-container">
            <div className="mx-auto max-w-xl rounded-2xl border border-[#e4dfd4] bg-white px-6 py-10 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-[#102c24]">{t.emptyTitle}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#616963]">{t.emptyBody}</p>
              <a
                  href={`/${subdomain}/portal`}
                  className="mt-6 inline-flex text-sm font-semibold text-[#082e25] underline-offset-2 hover:underline"
              >
                {t.portalLink}
              </a>
            </div>
          </div>
        </section>
    );
  }

  const active = services.filter((s) => s.isActive !== false);

  return (
      <section id="services" className="site-section-light scroll-mt-24 py-20 sm:py-24">
        <div className="site-container">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center mb-8">
            <span className="site-eyebrow">
              <span
                  className="site-eyebrow-dot"
                  style={{
                    backgroundColor: primaryColor,
                    boxShadow: `0 0 0 5px ${primaryColor}1f`,
                  }}
              />
              {t.eyebrow}
            </span>
              <h2 className="site-section-title mt-5">{t.title}</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#616963] sm:text-lg">
                {t.subtitle}
              </p>
            </div>
          </Reveal>

          <ul className="site-service-grid mt-12">
            {active.map((svc, i) => {
              const price = centsToDisplay(svc.basePriceCents, currency);
              const modelLabel = t.model[svc.pricingModel] ?? t.model.FLAT;
              const addOnCount = svc.addOns?.length ?? 0;

              return (
                  <Reveal key={svc.id} delay={i * 50}>
                    <li className="site-service-card group">
                      <div className="site-service-card-top">
                    <span className="site-service-index">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                        <span
                            className="site-service-model"
                            style={{
                              color: primaryColor,
                              backgroundColor: `${primaryColor}12`,
                            }}
                        >
                      {modelLabel}
                    </span>
                      </div>

                      <h3 className="site-service-name">{svc.name}</h3>

                      {svc.description ? (
                          <p className="site-service-desc">{svc.description}</p>
                      ) : (
                          <p className="site-service-desc site-service-desc-muted">
                            {t.noDescription}
                          </p>
                      )}

                      <div className="site-service-meta">
                        <div className="site-service-price-block">
                          <span className="site-service-price-label">{t.fromLabel}</span>
                          <span className="site-service-price-value">{price}</span>
                        </div>
                        <div className="site-service-chips">
                          {svc.estimatedMinutes ? (
                              <span className="site-service-chip">
                          <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden
                          >
                            <circle
                                cx="12"
                                cy="12"
                                r="9"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            />
                            <path
                                d="M12 7v5l3 2"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                          </svg>
                                {t.approxMin(svc.estimatedMinutes)}
                        </span>
                          ) : null}
                          {addOnCount > 0 ? (
                              <span className="site-service-chip">{t.addons(addOnCount)}</span>
                          ) : null}
                        </div>
                      </div>

                      <a
                          href={bookHref}
                          onClick={handleBook}
                          className="site-service-cta"
                          style={
                            {
                              "--service-color": primaryColor,
                            } as React.CSSProperties
                          }
                      >
                        {t.bookThis}
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
              );
            })}
          </ul>
        </div>
      </section>
  );
}