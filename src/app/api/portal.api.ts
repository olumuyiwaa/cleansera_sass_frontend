const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

async function portalFetch(path: string, options: RequestInit = {}, token?: string | null) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.headers as Record<string, string> | undefined),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    const result = await res.json();
    if (!res.ok || result.success === false) {
        throw new Error(result.message || "Request failed");
    }
    return result;
}

export async function requestPortalAccess(phone: string) {
    const result = await portalFetch(`/portal/access/request`, {
        method: "POST",
        body: JSON.stringify({ phone }),
    });
    return result.data as { sent: boolean };
}

export async function verifyPortalAccess(phone: string, code: string) {
    const result = await portalFetch(`/portal/access/verify`, {
        method: "POST",
        body: JSON.stringify({ phone, code }),
    });
    return result.data as {
        token: string;
        customer: { id: string; firstName: string; lastName: string; email: string | null; phone: string };
    };
}

export async function listPortalBookings(token: string) {
    const result = await portalFetch(`/portal/bookings`, { method: "GET" }, token);
    return result.data as any[];
}

export async function cancelPortalBooking(token: string, id: string, reason?: string) {
    const result = await portalFetch(
        `/portal/bookings/${id}/cancel`,
        { method: "POST", body: JSON.stringify({ reason }) },
        token
    );
    return result.data;
}

export async function reschedulePortalBooking(token: string, id: string, scheduledStart: string) {
    const result = await portalFetch(
        `/portal/bookings/${id}/reschedule`,
        { method: "POST", body: JSON.stringify({ scheduledStart }) },
        token
    );
    return result.data;
}

export async function leavePortalReview(token: string, id: string, rating: number, comment?: string) {
    const result = await portalFetch(
        `/portal/bookings/${id}/review`,
        { method: "POST", body: JSON.stringify({ rating, comment }) },
        token
    );
    return result.data;
}
