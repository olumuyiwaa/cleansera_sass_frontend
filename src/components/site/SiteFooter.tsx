"use client";

import { useTranslations } from "next-intl";

type SiteFooterProps = {
  subdomain: string;
  businessName: string;
  onBook?: () => void;
  phoneNumber?: string | null;
  socialLinks?: Partial<
    Record<"facebook" | "instagram" | "tiktok" | "linkedin" | "twitter", string>
  > | null;
};

const SOCIAL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  twitter: "X (Twitter)",
};

export function SiteFooter({
  subdomain,
  businessName,
  onBook,
  phoneNumber,
  socialLinks,
}: SiteFooterProps) {
  const t = useTranslations("Site.footer");
  const tn = useTranslations("Site.nav");
  const initial = businessName.trim().charAt(0).toUpperCase() || "C";
  const bookHref = `/book-now/${subdomain}`;
  const socialEntries = Object.entries(socialLinks || {}).filter(([, url]) => !!url);

  function handleBook(e: React.MouseEvent) {
    if (onBook) {
      e.preventDefault();
      onBook();
    }
  }

  return (
    <footer id="site-footer" className="site-footer border-t border-[#e4dfd4]">
      <div className="site-container py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-[1.5fr_1fr_1fr] sm:gap-12">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className="grid h-8 w-8 place-items-center rounded-lg text-sm font-semibold text-[#FBFBF8]"
                style={{ backgroundColor: "#0B352A" }}
              >
                {initial}
              </span>
              <span className="text-base font-semibold text-white/85 hover:text-white">
                {businessName}
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#c7d1cb]">
              {t("blurb")}
            </p>
            {phoneNumber && (
              <a
                href={`tel:${phoneNumber.replace(/[^+\d]/g, "")}`}
                className="mt-3 inline-block text-sm font-medium text-white/85 hover:text-white"
              >
                {phoneNumber}
              </a>
            )}
            {socialEntries.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {socialEntries.map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-white/75 underline-offset-2 hover:text-white hover:underline"
                  >
                    {SOCIAL_LABELS[platform] || platform}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#d0aa62]">
              {t("explore")}
            </h2>
            <a href="#services" className="text-sm text-white/80 hover:text-white">
              {tn("services")}
            </a>
            <a href="#how-it-works" className="text-sm text-white/80 hover:text-white">
              {tn("howItWorks")}
            </a>
            <a
              href={`/${subdomain}/portal`}
              className="text-sm text-white/80 hover:text-white"
            >
              {t("portal")}
            </a>
          </div>
          <div className="flex flex-col gap-3 sm:items-start">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#d0aa62]">
              {t("ready")}
            </h2>
            <a
              href={bookHref}
              onClick={handleBook}
              className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[#d0aa62] px-6 text-sm font-bold text-[#092f26]"
            >
              {t("book")}
            </a>
            <a
              href="#services"
              className="text-sm font-medium text-white/75 hover:text-white"
            >
              {t("viewServices")}
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col-reverse items-start justify-between gap-3 border-t border-white/15 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-white/55">
            © {new Date().getFullYear()} {businessName}. {t("rights")}
          </p>
          <p className="text-xs text-white/55">
            {t("poweredBy")}{" "}
            <span className="font-medium text-white/75">CleanSera</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
