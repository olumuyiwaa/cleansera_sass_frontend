import { authFetch } from "./authFetch";
import { PricingModel, Service } from "./cleansera-types";

export async function listServices() {
    const result = await authFetch(`/services`, { method: "GET" });
    return result.data as Service[];
}

export async function createService(payload: {
    name: string;
    description?: string;
    pricingModel: PricingModel;
    basePriceCents: number;
    estimatedMinutes: number;
}) {
    const result = await authFetch(`/services`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    return result.data as Service;
}

export async function updateService(id: string, patch: Partial<Service>) {
    const result = await authFetch(`/services/${id}`, {
        method: "PUT",
        body: JSON.stringify(patch),
    });
    return result.data as Service;
}

export async function deleteService(id: string) {
    await authFetch(`/services/${id}`, { method: "DELETE" });
}
