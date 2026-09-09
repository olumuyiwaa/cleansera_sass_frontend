import { authFetch } from "./authFetch";

// ─── Types ────────────────────────────────────────────────────

export type CalendarEventType =
    | "SHIFT"
    | "RECURRING_SHIFT"
    | "VISIT"
    | "CREDENTIAL_EXPIRY"
    | "INVOICE_DUE"
    | "INVOICE_OVERDUE";

export type CalendarEventStatus = string;

export interface CalendarEventMeta {
    // Shift / Visit shared
    caseIdentifier?: string | null;
    location?: string | null;
    visitType?: string | null;
    designation?: string | null;
    specialties?: string[];
    assignee?: string | null;
    cleaner?: string | null;
    shiftId?: string | null;

    // Shift specific
    pattern?: string | null;
    period?: string | null;
    isUrgent?: boolean;
    isEmergencyFill?: boolean;
    payRate?: number | null;
    chargeRate?: number | null;

    // Visit specific
    durationMinutes?: number | null;
    checkInTime?: string | null;
    checkOutTime?: string | null;
    checkInDistance?: number | null;
    overrideRequired?: boolean;
    overrideReason?: string | null;
    notes?: string | null;

    // Credential specific
    credentialType?: string | null;
    customLabel?: string | null;
    expiresAt?: string | null;
    daysUntilExpiry?: number | null;
    cleanerProfileId?: string | null;

    // Invoice specific
    invoiceNumber?: string | null;
    total?: number | null;
    dueAt?: string | null;
    businessName?: string | null;
}

export interface BackendCalendarEvent {
    id: string;             // composite "TYPE:uuid"
    type: CalendarEventType;
    title: string;
    start: string;          // ISO string
    end: string | null;
    allDay: boolean;
    color: string;          // hex
    status: CalendarEventStatus;
    resourceId: string;     // raw uuid of the underlying record
    businessId: string | null;
    meta: CalendarEventMeta;
}

export interface FetchCalendarEventsParams {
    from: string;
    to: string;
    types?: CalendarEventType[];
    businessId?: string;
    cleanerProfileId?: string;
    groupBy?: "day" | "week" | "none";
}

// ─── Main fetch ───────────────────────────────────────────────

/**
 * Fetch calendar events from the backend.
 *
 * Note: authFetch already returns parsed JSON, so we must NOT call
 * .json() on the result — the original helper was doing that twice
 * which caused a "body already consumed" error.
 */
export async function fetchCalendarEvents(
    params: FetchCalendarEventsParams
): Promise<BackendCalendarEvent[]> {
    const query = new URLSearchParams();

    query.set("from", params.from);
    query.set("to",   params.to);

    if (params.types?.length)  query.set("types",          params.types.join(","));
    if (params.businessId)     query.set("businessId",      params.businessId);
    if (params.cleanerProfileId) query.set("cleanerProfileId",  params.cleanerProfileId);
    if (params.groupBy)        query.set("groupBy",         params.groupBy);

    const res = await authFetch(`/calendar/events?${query.toString()}`, {
        method: "GET",
    });

    // authFetch returns the parsed response body directly —
    // do NOT call res.json() again after this point.
    if (!res.success) {
        throw new Error(res.message || "Failed to fetch calendar events");
    }

    // res.data.events is the array (groupBy="none" default)
    return (res.data?.events ?? []) as BackendCalendarEvent[];
}

// ─── Upcoming events (for dashboard widgets) ──────────────────

export async function fetchUpcomingEvents(limit = 10): Promise<BackendCalendarEvent[]> {
    const res = await authFetch(`/calendar/upcoming?limit=${limit}`, { method: "GET" });
    if (!res.success) throw new Error(res.message || "Failed to fetch upcoming events");
    return (res.data?.events ?? []) as BackendCalendarEvent[];
}

// ─── Calendar summary (for dashboard badges) ──────────────────

export interface CalendarSummary {
    period: { from: string; to: string };
    shifts: { total: number; open: number; booked: number; completed: number; urgent: number };
    visits: { total: number; flagged: number; completed: number };
    credentials: { expiringInPeriod: number };
    invoices: { due: number; overdue: number };
}

export async function fetchCalendarSummary(
    from: string,
    to: string
): Promise<CalendarSummary> {
    const res = await authFetch(`/calendar/summary?from=${from}&to=${to}`, { method: "GET" });
    if (!res.success) throw new Error(res.message || "Failed to fetch calendar summary");
    return res.data as CalendarSummary;
}