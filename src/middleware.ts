import { NextRequest, NextResponse } from "next/server";
import { isReservedSlug } from "@/lib/reservedSlugs";

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

// "/book-now/" is a real top-level route (the embeddable widget page), so it is
// served as-is on tenant hosts too. Rewriting it to /{tenant}/book-now/... 404s.
const BYPASS_PREFIXES = [
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/api/",
  "/book-now/",
];

// Hostnames only. Anything else (junk Host headers) is rejected before it can
// touch the cache or trigger a backend lookup.
const HOSTNAME_RE = /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?(:\d{1,5})?$/;

// In-memory edge cache for custom-domain lookups. Middleware runs per
// request on every hit to the domain, so without this every page view on a
// customer's own domain would be an extra DB round trip. 60s is enough to
// keep load down while still reflecting a fresh verification within a
// minute (matches the domainVerificationWorker poll interval).
const domainCache = new Map<string, { subdomain: string | null; expires: number }>();
const CACHE_TTL_MS = 60_000;
const CACHE_MAX_ENTRIES = 5_000;

function cacheSet(host: string, subdomain: string | null) {
  // Host is attacker-controlled, so the map must not grow without bound.
  if (domainCache.size >= CACHE_MAX_ENTRIES) domainCache.clear();
  domainCache.set(host, { subdomain, expires: Date.now() + CACHE_TTL_MS });
}

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
    if (res.status === 404) {
      cacheSet(host, null);
      return null;
    }
    // 5xx / rate limit: fail closed for this request, but do NOT cache it as
    // "unknown domain" - a one-second backend blip would otherwise take a
    // real customer's site offline for the full TTL.
    if (!res.ok) return null;
    const body = await res.json();
    const subdomain: string | null = body?.data?.subdomain || null;
    cacheSet(host, subdomain);
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

  if (!HOSTNAME_RE.test(host)) {
    return new NextResponse(null, { status: 400 });
  }

  // Our own app (dashboard, admin, auth, /book-now, /[subdomain] paths
  // typed directly) - path-based routing already handles this, don't touch it.
  if (APP_HOSTS.includes(host)) {
    return NextResponse.next();
  }

  // Bare root domain and www belong to the marketing site, not a tenant.
  // This must be checked BEFORE the subdomain branch: "www.cleansera.nl" also
  // ends with ".cleansera.nl" and would otherwise be treated as the reserved
  // tenant "www" and 404.
  if (ROOT_DOMAIN && (host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`)) {
    return NextResponse.next();
  }

  let subdomain: string | null = null;

  if (ROOT_DOMAIN && host.endsWith(`.${ROOT_DOMAIN}`)) {
    const candidate = host.slice(0, -1 * (ROOT_DOMAIN.length + 1));
    // A dot means someone pointed e.g. foo.bar.cleansera.nl at us - not a
    // real tenant subdomain.
    if (candidate && !candidate.includes(".") && !isReservedSlug(candidate)) {
      subdomain = candidate;
    }
  } else {
    // Anything else is a candidate custom domain (acme-cleaning.nl).
    subdomain = await resolveCustomDomain(host);
  }

  if (!subdomain) {
    return new NextResponse(null, { status: 404 });
  }

  // Links inside the storefront/portal are written as "/{slug}/portal" (they
  // also have to work on the plain app host). On a tenant host that would be
  // rewritten to "/{slug}/{slug}/portal" and 404, so send those to the clean
  // URL first. The query string is preserved (Stripe tip returns use it).
  const prefix = `/${subdomain}`;
  if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
    // Build the Location from the public Host (not nextUrl, which can carry the
    // internal host behind a reverse proxy).
    const proto =
      req.headers.get("x-forwarded-proto")?.split(",")[0].trim() ||
      req.nextUrl.protocol.replace(":", "");
    const clean = new URL(`${proto}://${host}`);
    clean.pathname = pathname.slice(prefix.length) || "/";
    clean.search = req.nextUrl.search;
    return NextResponse.redirect(clean, 307);
  }

  const url = req.nextUrl.clone();
  url.pathname = `${prefix}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
