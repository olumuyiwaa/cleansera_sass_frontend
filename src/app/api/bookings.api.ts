import { authFetch } from "./authFetch";
import { Booking, BookingStatus, RecurrenceFrequency, RecurringSchedule } from "./cleansera-types";

export async function listBookings(status?: BookingStatus) {
    const qs = status ? `?status=${status}` : "";
    const result = await authFetch(`/bookings${qs}`, { method: "GET" });
    return result.data as Booking[];
}

export async function getBooking(id: string) {
    const result = await authFetch(`/bookings/${id}`, { method: "GET" });
    return result.data as Booking;
}

export async function createBooking(payload: {
    customerId: string;
    serviceId: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    latitude?: number;
    longitude?: number;
    scheduledStart: string;
    sqft?: number;
    rooms?: number;
    addOnIds?: string[];
    couponCode?: string;
}) {
    const result = await authFetch(`/bookings`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    return result.data as Booking;
}

export async function updateBooking(id: string, patch: Partial<Booking>) {
    const result = await authFetch(`/bookings/${id}`, {
        method: "PUT",
        body: JSON.stringify(patch),
    });
    return result.data as Booking;
}

export async function assignBookingCleaner(id: string, cleanerId?: string) {
    // Omit cleanerId to let the backend auto-select via dispatch.suggestCleaners
    const result = await authFetch(`/bookings/${id}/assign`, {
        method: "POST",
        body: JSON.stringify(cleanerId ? { cleanerId } : {}),
    });
    return result.data as Booking;
}

export async function confirmBooking(id: string) {
    const result = await authFetch(`/bookings/${id}/confirm`, { method: "POST" });
    return result.data as Booking;
}

export async function completeBooking(id: string) {
    const result = await authFetch(`/bookings/${id}/complete`, { method: "POST" });
    return result.data as Booking;
}

// ─── Recurring schedules ─────────────────────────────────────────

export async function listRecurringSchedules() {
    const result = await authFetch(`/bookings/recurring`, { method: "GET" });
    return result.data as RecurringSchedule[];
}

export async function createRecurringSchedule(payload: {
    customerId: string;
    serviceId: string;
    customerAddressId?: string;
    frequency: RecurrenceFrequency;
    dayOfWeek: number;
    startTime: string;
}) {
    const result = await authFetch(`/bookings/recurring`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    return result.data as RecurringSchedule;
}

export async function cancelRecurringSchedule(id: string) {
    const result = await authFetch(`/bookings/recurring/${id}/cancel`, { method: "POST" });
    return result.data as RecurringSchedule;
}

export async function cancelBooking(id: string, reason?: string) {
    const result = await authFetch(`/bookings/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason }),
    });
    return result.data as Booking;
}

export async function rescheduleBooking(id: string, scheduledStart: string, scheduledEnd?: string) {
    const result = await authFetch(`/bookings/${id}/reschedule`, {
        method: "POST",
        body: JSON.stringify({ scheduledStart, scheduledEnd }),
    });
    return result.data as Booking;
}

export async function updateBookingPayment(
    id: string,
    paymentStatus: "UNPAID" | "PAID" | "PARTIAL" | "REFUNDED",
    paymentNote?: string
) {
    const result = await authFetch(`/bookings/${id}/payment`, {
        method: "POST",
        body: JSON.stringify({ paymentStatus, paymentNote }),
    });
    return result.data as Booking;
}
