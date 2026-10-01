"use client";

import type { CSSProperties, MouseEvent } from "react";
import { Reveal } from "./Reveal";

type SiteHeroProps = {
  subdomain: string;
  businessName: string;
  tagline?: string | null;
  heroImageUrl?: string | null;
  phoneNumber?: string | null;
  accentColor?: string | null;
  onBook?: () => void;
};

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
  heroImageUrl,
  phoneNumber,
  accentColor,
  onBook,
}: SiteHeroProps) {
  const bookHref = `/book-now/${subdomain}`;
  const accent = accentColor || "#D0AA62";
  const image = heroImageUrl || "/images/after-room.jpg";

  function handleBook(event: MouseEvent<HTMLAnchorElement>) {
    if (!onBook) return;
    event.preventDefault();
    onBook();
  }

  return (
    <section
      className="site-hero relative isolate flex items-center overflow-hidden"
      style={{ "--site-accent": accent } as CSSProperties}
    >
      <div className="site-hero-photo absolute inset-0" aria-hidden="true">
        {/* Business uploads may use arbitrary hosts, so keep this as a regular image. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="site-hero-overlay absolute inset-0" aria-hidden="true" />

      <div className="site-container relative z-[1] w-full pb-14 pt-44 sm:pb-20 sm:pt-48">
        {phoneNumber && (
          <a
            className="site-call-pill site-hero-call"
            href={`tel:${phoneNumber.replace(/[^+\d]/g, "")}`}
          >
            <span className="site-call-icon" aria-hidden="true">☎</span>
            <span>Call {phoneNumber}</span>
          </a>
        )}
        <Reveal>
          <div className="site-hero-content">
            <span className="site-eyebrow site-hero-eyebrow">
              <span className="site-eyebrow-dot" style={{ backgroundColor: accent }} />
              Cleaning, made easy
            </span>

            <h1 className="site-hero-title mt-6">
              <span className="block">Professional cleaning</span>
              <span className="site-hero-title-accent block">for a home you love.</span>
            </h1>

            <p className="site-hero-copy mt-6 max-w-2xl">
              Book {businessName} online in minutes. Choose the service and time
              that suit your home, and leave the cleaning to a trusted local team.
              {tagline?.trim() ? ` ${tagline.trim()}` : ""}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={bookHref} onClick={handleBook} className="site-btn-primary site-btn-gold">
                Check price &amp; availability
                <ArrowIcon />
              </a>
              <a href="#services" className="site-btn-secondary site-btn-dark">
                Explore cleaning services
              </a>
            </div>

            <div className="site-hero-proof mt-8" aria-label="Service highlights">
              <span>Trusted local cleaners</span>
              <span>Flexible scheduling</span>
              <span>Clear booking details</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
