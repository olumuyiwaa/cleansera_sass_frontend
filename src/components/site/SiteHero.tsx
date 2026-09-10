"use client";

import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { Reveal } from "./Reveal";

type SiteHeroProps = {
  subdomain: string;
  businessName: string;
  tagline?: string | null;
  primaryColor: string;
  onBook?: () => void;
};

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteHero({
  subdomain,
  businessName,
  tagline,
  primaryColor,
  onBook,
}: SiteHeroProps) {
  const title = tagline?.trim() || `A cleaner home, without the hassle`;
  const subtitle = tagline?.trim()
    ? `Book ${businessName} online in a few clicks — local cleaners, clear pricing, and times that fit your day.`
    : `Professional cleaning from ${businessName}. Book online, get confirmed, and come home to a spotless space.`;

  const bookHref = `/book-now/${subdomain}`;

  function handleBook(e: React.MouseEvent) {
    if (onBook) {
      e.preventDefault();
      onBook();
    }
  }

  return (
    <section className="site-hero relative overflow-hidden">
      <div className="site-hero-grid" aria-hidden />
      <div className="site-container relative z-[1] py-14 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.92fr)] lg:gap-16">
          <Reveal>
            <div>
              <span className="site-eyebrow">
                <span
                  className="site-eyebrow-dot"
                  style={{
                    backgroundColor: primaryColor,
                    boxShadow: `0 0 0 5px ${primaryColor}1f`,
                  }}
                />
                Local cleaning · Book online
              </span>

              <h1 className="site-hero-title mt-5">
                {title.includes(businessName) ? (
                  title
                ) : (
                  <>
                    {title}
                    <span style={{ color: primaryColor }}>
                      {" "}
                      — by {businessName}
                    </span>
                  </>
                )}
              </h1>

              <p className="site-hero-copy mt-5 max-w-xl">{subtitle}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={bookHref}
                  onClick={handleBook}
                  className="site-btn-primary"
                  style={{
                    backgroundColor: primaryColor,
                    borderColor: primaryColor,
                    boxShadow: `0 14px 30px ${primaryColor}3d`,
                  }}
                >
                  Book a cleaning
                  <ArrowIcon />
                </a>
                <a href="#services" className="site-btn-secondary">
                  See services
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                {[
                  { label: "Online booking", value: "24/7" },
                  { label: "Local team", value: "Trusted" },
                  { label: "Clear pricing", value: "Upfront" },
                ].map((stat) => (
                  <div key={stat.label} className="site-hero-stat">
                    <span className="site-hero-stat-label">{stat.label}</span>
                    <span className="site-hero-stat-value">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="relative">
            <div
              className="site-hero-visual-glow"
              style={{
                background: `radial-gradient(circle, ${primaryColor}2e, transparent 70%)`,
              }}
            />
            <BeforeAfterSlider />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
