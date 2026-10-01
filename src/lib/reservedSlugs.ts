/**
 * Subdomains / slugs a business must never be able to claim.
 *
 * A tenant host like `team.cleansera.nl` is rewritten to `/team`, which would
 * hit the dashboard's own /team route instead of that business's storefront.
 * So every top-level URL segment the app serves must be listed here.
 *
 * `npm run check:slugs` (scripts/check-reserved-slugs.mjs) walks src/app and
 * fails when a route segment is missing from this list - run it in CI.
 *
 * The backend's registration check must reject the same names. Copy this
 * list there, or better, expose it from one place both sides read.
 */
export const RESERVED_SLUGS: readonly string[] = [
  // Infrastructure / conventional hostnames
  "www", "app", "api", "admin", "auth", "static", "assets", "cdn", "mail",
  "smtp", "ftp", "ns1", "ns2", "staging", "dev", "test", "status", "docs",
  "blog", "help", "widget", "embed", "login", "signin", "signup",

  // Marketing + legal
  "about", "for-businesses", "for-cleaners", "how-it-works", "pricing",
  "pricing-page", "privacy", "terms", "support",

  // Public app routes
  "book-now", "portal", "site", "services", "error-404",
  "forgot-password", "reset-password", "verify-email",

  // Dashboard routes
  "dashboard", "audit-trail", "bookings", "business-settings", "calendar",
  "checklist-templates", "cleaner-documents", "cleaners", "compliance",
  "coupons", "customers", "dispatch", "gift-cards", "inventory", "messages",
  "notifications", "onboarding", "payroll", "profile", "recurring-schedules",
  "reports", "reviews", "subscription", "support-tickets", "team", "waitlist",
  "website",
];

export const RESERVED_SLUG_SET: ReadonlySet<string> = new Set(RESERVED_SLUGS);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUG_SET.has(slug.trim().toLowerCase());
}
