import type { Metadata } from "next";
import MarketingHeader from "@/components/marketing/Header";
import MarketingFooter from "@/components/marketing/Footer";
import {
    SITE_NAME,
    SITE_URL,
    DEFAULT_DESCRIPTION,
    organizationStructuredData,
} from "@/lib/marketing/siteConfig";
import "@/app/(marketing)/marketing.css";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: `${SITE_NAME} — Software for cleaning businesses`,
        template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    alternates: { canonical: SITE_URL },
    openGraph: {
        siteName: SITE_NAME,
        type: "website",
        url: SITE_URL,
    },
    twitter: {
        card: "summary_large_image",
    },
};

/**
 * Marketing-only chrome. Does NOT wrap dashboard providers or sidebar.
 * Lives in a route group so URLs stay /pricing, /about, etc.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="marketing-root min-h-screen flex flex-col font-body">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
            />
            <MarketingHeader />
            <main className="flex-1">{children}</main>
            <MarketingFooter />
        </div>
    );
}