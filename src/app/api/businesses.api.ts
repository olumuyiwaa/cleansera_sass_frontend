import { authFetch } from "./authFetch";
import { Business } from "./cleansera-types";

export type BusinessAddress = {
    id: string;
    label: string | null;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    latitude: number | null;
    longitude: number | null;
    isPrimary: boolean;
};

export type ServiceArea = {
    id: string;
    name: string;
    centerLat: number;
    centerLng: number;
    radiusMeters: number;
};

export type BusinessHours = {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
};

export type BusinessBranding = {
    logoKey: string | null;
    primaryColor: string | null;
    accentColor: string | null;
    tagline: string | null;
    widgetEmbedEnabled: boolean;
};

export async function getBusiness() {
    const result = await authFetch(`/businesses`, { method: "GET" });
    return result.data as Business & { addresses: BusinessAddress[]; hours: BusinessHours[] };
}

export async function updateBusiness(patch: { name?: string; timezone?: string; customDomain?: string }) {
    const result = await authFetch(`/businesses`, { method: "PUT", body: JSON.stringify(patch) });
    return result.data as Business;
}

export async function getBranding() {
    const result = await authFetch(`/businesses/branding`, { method: "GET" });
    return result.data as BusinessBranding;
}

export async function updateBranding(patch: Partial<BusinessBranding>) {
    const result = await authFetch(`/businesses/branding`, { method: "PUT", body: JSON.stringify(patch) });
    return result.data as BusinessBranding;
}

export async function listServiceAreas() {
    const result = await authFetch(`/businesses/service-areas`, { method: "GET" });
    return result.data as ServiceArea[];
}

export async function createServiceArea(payload: { name: string; centerLat: number; centerLng: number; radiusMeters: number }) {
    const result = await authFetch(`/businesses/service-areas`, { method: "POST", body: JSON.stringify(payload) });
    return result.data as ServiceArea;
}

export async function deleteServiceArea(id: string) {
    await authFetch(`/businesses/service-areas/${id}`, { method: "DELETE" });
}

export async function listHours() {
    const result = await authFetch(`/businesses/hours`, { method: "GET" });
    return result.data as BusinessHours[];
}

export async function updateHours(hours: BusinessHours[]) {
    const result = await authFetch(`/businesses/hours`, { method: "PUT", body: JSON.stringify(hours) });
    return result.data as BusinessHours[];
}
