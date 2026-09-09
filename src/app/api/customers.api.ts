import { authFetch } from "./authFetch";
import { Customer, CustomerAddress } from "./cleansera-types";

export async function listCustomers(q?: string) {
    const qs = q ? `?q=${encodeURIComponent(q)}` : "";
    const result = await authFetch(`/customers${qs}`, { method: "GET" });
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
    address?: {
        label?: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode?: string;
        latitude?: number;
        longitude?: number;
    };
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

export async function deleteCustomer(id: string) {
    const result = await authFetch(`/customers/${id}`, { method: "DELETE" });
    return result.data;
}

export async function addCustomerAddress(
    customerId: string,
    payload: {
        label?: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode?: string;
        latitude?: number;
        longitude?: number;
        isPrimary?: boolean;
    }
) {
    const result = await authFetch(`/customers/${customerId}/addresses`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    return result.data as CustomerAddress;
}

export async function updateCustomerAddress(
    customerId: string,
    addressId: string,
    patch: Partial<CustomerAddress>
) {
    const result = await authFetch(`/customers/${customerId}/addresses/${addressId}`, {
        method: "PUT",
        body: JSON.stringify(patch),
    });
    return result.data as CustomerAddress;
}

export async function deleteCustomerAddress(customerId: string, addressId: string) {
    const result = await authFetch(`/customers/${customerId}/addresses/${addressId}`, {
        method: "DELETE",
    });
    return result.data;
}
