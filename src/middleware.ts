import { NextRequest, NextResponse } from "next/server";

/**
 * Host-based multi-tenancy.
 *
 * Today the app only does PATH-based tenancy: every business is reached at
 * app-domain.com/{subdomain}. That means acme.cleansera.nl or a business's
 * own custom domain (acme-cleaning.nl) has nowhere to go — there is no
 * middleware translating the Host header into a route, so those requests
 * 404. This file is what "subdomain and custom-domain ready" actually
 * requires on the frontend: it rewrites the request based on Host, before
 * Next.js does routing, so /[subdomain]/... still renders it.
 *
 * Two env vars define the split between "our app" and "tenant storefronts":
 *   NEXT_PUBLIC_APP_HOSTS              comma-separated hostnames that serve
 *                                       the dashboard/admin/auth app itself,
 *                                       e.g. "app.cleansera.nl,localhost:3000"
 *   NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN the domain whose subdomains are
 *                                       tenant storefronts, e.g. "cleansera.nl"
 *                                       (so acme.cleansera.nl -> /acme)
 *
 * Any other Host is treated as a candidate custom domain and resolved
 * against the backend's public, cached lookup. If it doesn't resolve to a
 * VERIFIED business domain, we return 404 rather than leaking internal
 * routes — this also doubles as the "ask" endpoint Caddy's on-demand TLS
 * calls before issuing a certificate (see deploy/caddy/Caddyfile), so an
 * unverified domain never gets a cert issued on our behalf either.
 */

const APP_HOSTS = (process.env.NEXT_PUBLIC_APP_HOSTS || "localhost:3000")
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN || "").toLowerCase();

const API_BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "";

// Keep in sync with the backend's reserved-slug check on business
// registration (see prisma-schema-additions.md). A business must never be
// able to register a subdomain that collides with a top-level app route.
const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "auth",
  "dashboard",
  "book-now",
  "widget",
  "static",
  "assets",
  "mail",
  "support",
]);

const BYPASS_PREFIXES = ["/_next", "/favicon.ico", "/robots.txt", "/sitemap.xml", "/api/"];

// In-memory edge cache for custom-domain lookups. Middleware runs per
// request on every hit to the domain, so without this every page view on a
// customer's own domain would be an extra DB round trip. 60s is enough to
// keep load down while still reflecting a fresh verification within a
// minute (matches the domainVerificationWorker poll interval).
const domainCache = new Map<string, { subdomain: string | null; expires: number }>();
const CACHE_TTL_MS = 60_000;

async function resolveCustomDomain(host: string): Promise<string | null> {
  const cached = domainCache.get(host);
  if (cached && cached.expires > Date.now()) {
    return cached.subdomain;
  }

  if (!API_BASE_URL) return null;

  try {
    const res = await fetch(
      `${API_BASE_URL}/public/resolve-domain?host=${encodeURIComponent(host)}`,
      // Next's edge fetch cache, as a second layer behind our own map —
      // belt and suspenders across cold middleware instances.
      { next: { revalidate: 60 } }
    );
    if (!res.ok) {
      domainCache.set(host, { subdomain: null, expires: Date.now() + CACHE_TTL_MS });
      return null;
    }
    const body = await res.json();
    const subdomain: string | null = body?.data?.subdomain || null;
    domainCache.set(host, { subdomain, expires: Date.now() + CACHE_TTL_MS });
    return subdomain;
  } catch {
    // Backend hiccup: fail closed (404) rather than guessing at a tenant.
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const host = (req.headers.get("host") || "").toLowerCase();

  // Our own app (dashboard, admin, auth, /book-now, /[subdomain] paths
  // typed directly) — path-based routing already handles this, don't touch it.
  if (APP_HOSTS.includes(host)) {
    return NextResponse.next();
  }

  // A path like /acme or /book-now/acme hit directly on an APP_HOST is
  // already handled above and falls through unchanged.

  let subdomain: string | null = null;

  if (ROOT_DOMAIN && host.endsWith(`.${ROOT_DOMAIN}`)) {
    const candidate = host.slice(0, -1 * (ROOT_DOMAIN.length + 1));
    // A dot means someone pointed e.g. foo.bar.cleansera.nl at us — not a
    // real tenant subdomain.
    if (candidate && !candidate.includes(".") && !RESERVED_SUBDOMAINS.has(candidate)) {
      subdomain = candidate;
    }
  } else if (host === ROOT_DOMAIN) {
    // Bare root domain (cleansera.nl) is the marketing site's job, not
    // this app's. Let it fall through if this deployment also serves it,
    // otherwise this 404s — either is fine, just don't treat it as a tenant.
    return NextResponse.next();
  } else {
    // Anything else is a candidate custom domain (acme-cleaning.nl).
    subdomain = await resolveCustomDomain(host);
  }

  if (!subdomain) {
    return new NextResponse(null, { status: 404 });
  }

  const url = req.nextUrl.clone();
  url.pathname = `/${subdomain}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
