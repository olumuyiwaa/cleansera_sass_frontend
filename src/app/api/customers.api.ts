import { authFetch } from "./authFetch";
import { Customer } from "./cleansera-types";

export async function listCustomers() {
    const result = await authFetch(`/customers`, { method: "GET" });
    return result.data as Customer[];
}

export async function getCustomer(id: string) {
    const result = await authFetch(`/customers/${id}`, { method: "GET" });
    return result.data as Customer;
}

export async function createCustomer(payload: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    notes?: string;
}) {
    const result = await authFetch(`/customers`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    return result.data as Customer;
}

export async function updateCustomer(id: string, patch: Partial<Customer>) {
    const result = await authFetch(`/customers/${id}`, {
        method: "PUT",
        body: JSON.stringify(patch),
    });
    return result.data as Customer;
}
