import { publicFetch } from "./publicFetch";
import { Service } from "./cleansera-types";

export type WidgetBranding = {
    businessId: string;
    logoUrl: string | null;
    primaryColor: string | null;
    accentColor: string | null;
    tagline: string | null;
} | null;

export type WidgetBusiness = {
    id: string;
    name: string;
    subdomain: string;
    customDomain: string | null;
    timezone: string;
    branding: WidgetBranding;
    hours: { dayOfWeek: number; openTime: string; closeTime: string }[];
};

export type WidgetStorefront = {
    business: WidgetBusiness;
    services: Service[];
};

export type WidgetQuote = {
    serviceId: string;
    addOnIds: string[];
    priceCents: number;
    estimatedMinutes: number;
    breakdown: Record<string, unknown>;
    coupon?: { code: string; discountCents?: number } | null;
};

export type WidgetSlot = { start: string; end: string; available: number };

export type WidgetBookingPayload = {
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    latitude?: number;
    longitude?: number;
    serviceId: string;
    addOnIds?: string[];
    scheduledStart: string;
    couponCode?: string;
};

function base(subdomain: string) {
    return `/widget-embed/${encodeURIComponent(subdomain)}`;
}

export async function getStorefront(subdomain: string) {
    const result = await publicFetch(`${base(subdomain)}/storefront`, {
        method: "GET",
    });
    return result.data as WidgetStorefront;
}

export async function getQuote(
    subdomain: string,
    payload: {
        serviceId: string;
        addOnIds?: string[];
        latitude?: number;
        longitude?: number;
        scheduledStart?: string;
        couponCode?: string;
    }
) {
    const result = await publicFetch(`${base(subdomain)}/quote`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    return result.data as WidgetQuote;
}

export async function getSlots(
    subdomain: string,
    params: { serviceId: string; date: string; slotMinutes?: number }
) {
    const query = new URLSearchParams({
        serviceId: params.serviceId,
        date: params.date,
        ...(params.slotMinutes
            ? { slotMinutes: String(params.slotMinutes) }
            : {}),
    });
    const result = await publicFetch(
        `${base(subdomain)}/slots?${query.toString()}`,
        { method: "GET" }
    );
    return result.data as { date: string; slots: WidgetSlot[] };
}

export async function submitBooking(
    subdomain: string,
    payload: WidgetBookingPayload
) {
    const result = await publicFetch(`${base(subdomain)}/bookings`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    return result.data;
}
