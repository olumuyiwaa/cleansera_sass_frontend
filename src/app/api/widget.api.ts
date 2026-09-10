/**
 * Public (unauthenticated) widget API client.
 * Used by the customer-facing booking form.
 *
 * Backend mounts:
 *   - Host-based:  /api/v1/widget/...
 *   - Slug-based:  /api/v1/widget-embed/:subdomain/...
 *
 * We use the slug path so businesses work with zero DNS setup:
 *   /book/[slug]  →  /widget-embed/[slug]/...
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

async function widgetFetch(
  slug: string,
  path: string,
  options: RequestInit = {}
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  const res = await fetch(
    `${API_BASE_URL}/widget-embed/${encodeURIComponent(slug)}${path}`,
    { ...options, headers }
  );

  const result = await res.json().catch(() => ({}));

  if (!res.ok || result.success === false) {
    const message =
      result.message ||
      result.error ||
      (typeof result === "string" ? result : "Request failed");
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  return result;
}

// ─── Types returned by the widget endpoints ─────────────────────

export type WidgetBranding = {
  primaryColor?: string | null;
  logoUrl?: string | null;
  accentColor?: string | null;
};

export type WidgetBusiness = {
  id: string;
  name: string;
  subdomain?: string | null;
  branding?: WidgetBranding | null;
  hours?: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
  }>;
};

export type WidgetAddOn = {
  id: string;
  name: string;
  priceCents: number;
  extraMinutes: number;
};

export type WidgetService = {
  id: string;
  name: string;
  description: string | null;
  pricingModel: "FLAT" | "PER_SQFT" | "PER_ROOM" | "HOURLY";
  basePriceCents: number;
  estimatedMinutes: number;
  isActive: boolean;
  addOns: WidgetAddOn[];
};

export type StorefrontResponse = {
  business: WidgetBusiness;
  services: WidgetService[];
};

export type QuoteRequest = {
  serviceId: string;
  addOnIds?: string[];
  latitude?: number | null;
  longitude?: number | null;
  scheduledStart?: string;
  couponCode?: string;
  /** Passed through for PER_ROOM / PER_SQFT / frequency discounts */
  rooms?: number;
  bathrooms?: number;
  sqft?: number;
  frequency?: "ONE_TIME" | "WEEKLY" | "BIWEEKLY" | "MONTHLY";
};

export type QuoteResponse = {
  serviceId: string;
  addOnIds: string[];
  priceCents: number;
  estimatedMinutes: number;
  breakdown?: Record<string, unknown>;
  coupon?: {
    valid: boolean;
    reason?: string;
    couponId?: string;
    type?: string;
    value?: number;
  } | null;
};

export type Slot = {
  start: string;
  end: string;
  available: number;
};

export type SlotsResponse = {
  date: string;
  slots: Slot[];
};

export type SubmitBookingPayload = {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
  serviceId: string;
  addOnIds?: string[];
  scheduledStart: string;
  couponCode?: string;
  rooms?: number;
  bathrooms?: number;
  sqft?: number;
  frequency?: string;
  notes?: string;
};

// ─── API functions ──────────────────────────────────────────────

export async function getStorefront(slug: string) {
  const result = await widgetFetch(slug, "/storefront", { method: "GET" });
  return result.data as StorefrontResponse;
}

export async function getQuote(slug: string, body: QuoteRequest) {
  const result = await widgetFetch(slug, "/quote", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return result.data as QuoteResponse;
}

export async function getSlots(
  slug: string,
  params: {
    serviceId: string;
    date: string; // YYYY-MM-DD
    slotMinutes?: number;
  }
) {
  const qs = new URLSearchParams({
    serviceId: params.serviceId,
    date: params.date,
    ...(params.slotMinutes
      ? { slotMinutes: String(params.slotMinutes) }
      : {}),
  });
  const result = await widgetFetch(slug, `/slots?${qs.toString()}`, {
    method: "GET",
  });
  return result.data as SlotsResponse;
}

export async function submitBooking(slug: string, payload: SubmitBookingPayload) {
  const result = await widgetFetch(slug, "/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return result.data as { id: string; scheduledStart: string; quotedPriceCents: number; status: string };
}
