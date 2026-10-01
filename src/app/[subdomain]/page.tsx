"use client";

import { use, useCallback, useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  getStorefront,
  type StorefrontResponse,
  type WidgetSectionsEnabled,
} from "@/app/api/widget.api";
import { setActiveCurrency } from "@/app/services/currency";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteHero } from "@/components/site/SiteHero";
import { SiteServices } from "@/components/site/SiteServices";
import { SiteHowItWorks } from "@/components/site/SiteHowItWorks";
import { SiteAbout } from "@/components/site/SiteAbout";
import { SiteTestimonials } from "@/components/site/SiteTestimonials";
import { SiteGallery } from "@/components/site/SiteGallery";
import { SiteFaq } from "@/components/site/SiteFaq";
import { SiteCtaBand } from "@/components/site/SiteCtaBand";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BookingWidgetModal } from "@/components/widget/BookingWidgetModal";

const DEFAULT_PRIMARY = "#0B352A";
const DEFAULT_ACCENT = "#D0AA62";
const DEFAULT_SECTION_ORDER: NonNullable<WidgetSectionsEnabled["order"]> = [
  "about",
  "testimonials",
  "gallery",
  "faq",
];

export default function BusinessSitePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = use(params);
  const t = useTranslations("Site");
  const [data, setData] = useState<StorefrontResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookOpen, setBookOpen] = useState(false);

  const openBook = useCallback(() => setBookOpen(true), []);
  const closeBook = useCallback(() => setBookOpen(false), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getStorefront(subdomain)
      .then((storefront) => {
        if (cancelled) return;
        setData(storefront);
        // Align money formatting in the booking modal with this business.
        setActiveCurrency(storefront.business?.currency);
        const name = storefront.business?.name;
        if (name && typeof document !== "undefined") {
          document.title = `${name} · CleanSera`;
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : t("notFoundBody")
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [subdomain, t]);

  // Escape closes the booking modal
  useEffect(() => {
    if (!bookOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBook();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bookOpen, closeBook]);

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center p-8 text-[#5F6664]"
        role="status"
        aria-live="polite"
      >
        {t("loading")}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-lg font-semibold text-[#171B1A]">{t("notFoundTitle")}</p>
        <p className="max-w-sm text-sm text-[#5F6664]">
          {error || t("notFoundBody")}
        </p>
      </div>
    );
  }

  const business = data.business;
  const branding = business.branding;
  const primaryColor = branding?.primaryColor || DEFAULT_PRIMARY;
  const accentColor = branding?.accentColor || DEFAULT_ACCENT;
  const name = business.name;
  const logoUrl = branding?.logoUrl ?? null;
  const tagline = branding?.tagline ?? null;
  const themeStyle = branding?.themeStyle || "MODERN";

  // Which optional sections render, and in what order. A section still
  // renders nothing if it has no real content (each component checks this
  // itself) even when enabled here — this config only controls
  // visibility/order, not whether content exists.
  const sectionsConfig = branding?.sectionsEnabled;
  const order = sectionsConfig?.order?.length
    ? sectionsConfig.order
    : DEFAULT_SECTION_ORDER;
  const isEnabled = (key: "about" | "testimonials" | "gallery" | "faq") =>
    sectionsConfig ? sectionsConfig[key] !== false : true;

  const optionalSections: Record<string, ReactNode> = {
    about: isEnabled("about") ? (
      <SiteAbout
        key="about"
        title={branding?.aboutTitle ?? null}
        body={branding?.aboutBody ?? null}
        heroImageUrl={branding?.heroImageUrl ?? null}
        primaryColor={primaryColor}
      />
    ) : null,
    testimonials: isEnabled("testimonials") ? (
      <SiteTestimonials
        key="testimonials"
        testimonials={branding?.testimonials}
        primaryColor={primaryColor}
      />
    ) : null,
    gallery: isEnabled("gallery") ? (
      <SiteGallery
        key="gallery"
        imageUrls={branding?.galleryImageUrls}
        primaryColor={primaryColor}
      />
    ) : null,
    faq: isEnabled("faq") ? (
      <SiteFaq
        key="faq"
        items={branding?.faqItems}
        primaryColor={primaryColor}
      />
    ) : null,
  };

  return (
    <div data-theme-style={themeStyle}>
      <SiteHeader
        subdomain={subdomain}
        businessName={name}
        logoUrl={logoUrl}
        primaryColor={primaryColor}
        hasAbout={Boolean(branding?.aboutTitle || branding?.aboutBody)}
        hasTestimonials={Boolean(branding?.testimonials?.length)}
        hasFaq={Boolean(branding?.faqItems?.length)}
        onBook={openBook}
      />
      <main id="main-content">
        <SiteHero
          subdomain={subdomain}
          businessName={name}
          tagline={tagline}
          heroImageUrl={branding?.heroImageUrl}
          phoneNumber={business.phone}
          accentColor={accentColor}
          onBook={openBook}
        />
        <SiteServices
          subdomain={subdomain}
          services={data.services}
          primaryColor={primaryColor}
          onBook={openBook}
          currency={business.currency}
        />
        <SiteHowItWorks primaryColor={primaryColor} />
        {order.map((key) => optionalSections[key])}
        <SiteCtaBand
          subdomain={subdomain}
          businessName={name}
          onBook={openBook}
        />
      </main>
      <SiteFooter
        subdomain={subdomain}
        businessName={name}
        onBook={openBook}
        phoneNumber={business.phone}
        socialLinks={branding?.socialLinks}
      />

      <BookingWidgetModal
        open={bookOpen}
        onClose={closeBook}
        subdomain={subdomain}
        business={business}
        services={data.services}
        businessName={name}
        primaryColor={primaryColor}
        payment={data.payment}
        cancellationPolicy={data.cancellationPolicy}
      />
    </div>
  );
}
