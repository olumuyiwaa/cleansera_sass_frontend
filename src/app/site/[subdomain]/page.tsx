"use client";

import { use, useCallback, useEffect, useState } from "react";
import {
  getStorefront,
  type WidgetStorefront,
} from "@/app/api/widget.api";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteHero } from "@/components/site/SiteHero";
import { SiteServices } from "@/components/site/SiteServices";
import { SiteHowItWorks } from "@/components/site/SiteHowItWorks";
import { SiteCtaBand } from "@/components/site/SiteCtaBand";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BookingWidgetModal } from "@/components/widget/BookingWidgetModal";

const DEFAULT_PRIMARY = "#3F6B52";

export default function BusinessSitePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = use(params);
  const [data, setData] = useState<WidgetStorefront | null>(null);
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
        if (!cancelled) setData(storefront);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "This site isn't available."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [subdomain]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-[#5F6664]">
        Loading…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-lg font-semibold text-[#171B1A]">Site not found</p>
        <p className="max-w-sm text-sm text-[#5F6664]">
          {error ||
            "We couldn't find an active business for this link. Check the URL or contact the business."}
        </p>
      </div>
    );
  }

  const business = data.business;
  const branding = business.branding;
  const primaryColor = branding?.primaryColor || DEFAULT_PRIMARY;
  const name = business.name;
  const logoUrl = branding?.logoUrl ?? null;
  const tagline = branding?.tagline ?? null;

  return (
    <>
      <SiteHeader
        subdomain={subdomain}
        businessName={name}
        logoUrl={logoUrl}
        primaryColor={primaryColor}
        onBook={openBook}
      />
      <main>
        <SiteHero
          subdomain={subdomain}
          businessName={name}
          tagline={tagline}
          primaryColor={primaryColor}
          onBook={openBook}
        />
        <SiteServices
          subdomain={subdomain}
          services={data.services}
          primaryColor={primaryColor}
          onBook={openBook}
        />
        <SiteHowItWorks primaryColor={primaryColor} />
        <SiteCtaBand
          subdomain={subdomain}
          businessName={name}
          primaryColor={primaryColor}
          onBook={openBook}
        />
      </main>
      <SiteFooter
        subdomain={subdomain}
        businessName={name}
        primaryColor={primaryColor}
        onBook={openBook}
      />

      <BookingWidgetModal
        open={bookOpen}
        onClose={closeBook}
        subdomain={subdomain}
        businessName={name}
        primaryColor={primaryColor}
      />
    </>
  );
}
