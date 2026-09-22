import type { Metadata } from "next";

export const SITE_NAME = "CleanSera";

/** No trailing slash. Set NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || "https://cleansera.nl").replace(/\/$/, "");

export const DEFAULT_DESCRIPTION =
  "Scheduling, dispatch, and a branded booking site for cleaning businesses. Your staff, your customers, your brand — run entirely by you.";

/** Product app (dashboard / auth). Sign-in and trial CTAs point here. */
export const APP_URL =
  (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

type BuildMetadataArgs = {
  title: string;
  description: string;
  /** Path starting with "/", e.g. "/pricing", or "" for homepage */
  path?: string;
};

/**
 * Builds a full Metadata object for one marketing route so every page gets
 * unique title / description / canonical / OG / Twitter blocks.
 */
export function buildMetadata({
  title,
  description,
  path = "",
}: BuildMetadataArgs): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/** Organization + SoftwareApplication JSON-LD for the marketing layout. */
export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
    },
    {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: DEFAULT_DESCRIPTION,
      url: SITE_URL,
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "EUR",
        lowPrice: "49",
        highPrice: "199",
        offerCount: "3",
      },
    },
  ],
};
