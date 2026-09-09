import { authFetch } from "./authFetch";
import { Booking, Cleaner } from "./cleansera-types";

export type DispatchAssignment = {
    id: string;
    bookingId: string;
    cleanerId: string;
    assignedAt: string;
    checkedInAt: string | null;
    checkedOutAt: string | null;
    booking?: Booking;
    cleaner?: Cleaner;
};

export async function listDispatchItems() {
    const result = await authFetch(`/dispatch`, { method: "GET" });
    return result.data as DispatchAssignment[];
}

export async function createAssignment(bookingId: string, cleanerId?: string) {
    // Omit cleanerId to have the backend auto-select the best-fit cleaner
    const result = await authFetch(`/dispatch`, {
        method: "POST",
        body: JSON.stringify(cleanerId ? { bookingId, cleanerId } : { bookingId }),
    });
    return result.data as DispatchAssignment;
}

export async function getAssignment(id: string) {
    const result = await authFetch(`/dispatch/${id}`, { method: "GET" });
    return result.data as DispatchAssignment;
}

export async function removeAssignment(id: string) {
    await authFetch(`/dispatch/${id}`, { method: "DELETE" });
}

export async function suggestCleaners(bookingId: string, limit = 5) {
    const result = await authFetch(`/dispatch/suggest?bookingId=${bookingId}&limit=${limit}`, { method: "GET" });
    return result.data as Cleaner[];
}
