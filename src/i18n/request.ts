import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { defaultLocale, LOCALE_COOKIE, isSupportedLocale, type AppLocale } from "./locales";

/**
 * Locale is resolved WITHOUT next-intl's URL-based routing ([locale]
 * segment / localePrefix). middleware.ts already rewrites every tenant
 * request straight to /${subdomain}${pathname} based on the Host header —
 * there is no room in that scheme for a locale segment ahead of it without
 * restructuring the entire tenant-resolution scheme, and a business's own
 * custom domain (acme-cleaning.nl) has no natural place to carry a locale
 * prefix at all. So: locale lives in a cookie, set by the language
 * switcher (see LanguageSwitcher.tsx + setLocale.ts), falling back to the
 * browser's Accept-Language on a first visit with no cookie yet.
 *
 * locales/defaultLocale/LOCALE_COOKIE/isSupportedLocale live in ./locales
 * rather than here: this file imports next/headers (server-only), and a
 * client component importing anything from a file that does would pull
 * next/headers into the client bundle, which Next.js rejects at build
 * time. Every other consumer (LanguageSwitcher.tsx, setLocale.ts) imports
 * those constants from ./locales directly — nothing should import them
 * from this file.
 */

/** Picks the first supported locale from an Accept-Language header, e.g. "nl-NL,nl;q=0.9,en;q=0.8". */
function localeFromAcceptLanguage(header: string | null): AppLocale | null {
  if (!header) return null;
  const tags = header.split(",").map((part) => part.split(";")[0].trim().toLowerCase());
  for (const tag of tags) {
    const base = tag.split("-")[0];
    if (isSupportedLocale(base)) return base;
  }
  return null;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  let locale: AppLocale;
  if (isSupportedLocale(cookieLocale)) {
    locale = cookieLocale;
  } else {
    const headerList = await headers();
    locale = localeFromAcceptLanguage(headerList.get("accept-language")) ?? defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
