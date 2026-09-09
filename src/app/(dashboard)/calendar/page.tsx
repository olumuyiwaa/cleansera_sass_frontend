"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
    EventClickArg,
    EventContentArg,
} from "@fullcalendar/core";

import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import {
    fetchCalendarEvents,
    type BackendCalendarEvent,
    type CalendarEventType,
} from "@/app/api/calendar";
import {useAuth} from "@/app/auth/useAuth";
import {useRouter} from "next/navigation";

// ─── Event type config ────────────────────────────────────────
// Maps each backend event type to a human label and a Tailwind badge colour.

const EVENT_TYPE_CONFIG: Record<
    CalendarEventType,
    { label: string; badgeClass: string }
> = {
    SHIFT: {
        label: "Shift",
        badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    },
    RECURRING_SHIFT: {
        label: "Recurring Shift",
        badgeClass: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
    },
    VISIT: {
        label: "Visit",
        badgeClass: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300",
    },
    CREDENTIAL_EXPIRY: {
        label: "Credential Expiry",
        badgeClass: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300",
    },
    INVOICE_DUE: {
        label: "Invoice Due",
        badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    },
    INVOICE_OVERDUE: {
        label: "Invoice Overdue",
        badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
    },
};

const ALL_EVENT_TYPES = Object.keys(EVENT_TYPE_CONFIG) as CalendarEventType[];

// ─── Helpers ──────────────────────────────────────────────────

function formatLabel(value?: string | null) {
    if (!value) return "—";
    return value.replace(/_/g, " ");
}

function formatDateTime(value?: string | null) {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(d);
}

function formatCurrency(value?: number | null) {
    if (value == null) return "—";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

// ─── Detail panel content ─────────────────────────────────────

function EventDetailRows({ event }: { event: BackendCalendarEvent }) {
    const { meta, type, status } = event;

    const Row = ({ label, value }: { label: string; value?: string | null }) =>
        value ? (
            <div className="grid grid-cols-[140px_1fr] gap-2 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </span>
                <span className="text-sm text-gray-800 dark:text-white/90 break-words">{value}</span>
            </div>
        ) : null;

    if (type === "SHIFT" || type === "RECURRING_SHIFT") {
        return (
            <>
                <Row label="Case"          value={meta.caseIdentifier} />
                <Row label="Location"      value={meta.location} />
                <Row label="Visit Type"    value={formatLabel(meta.visitType)} />
                <Row label="Designation"   value={meta.designation} />
                <Row label="Specialties"   value={meta.specialties?.length ? meta.specialties.join(", ") : undefined} />
                <Row label="Status"        value={formatLabel(status)} />
                <Row label="Assigned To"   value={meta.assignee} />
                <Row label="Pay Rate"      value={formatCurrency(meta.payRate)} />
                <Row label="Charge Rate"   value={formatCurrency(meta.chargeRate)} />
                <Row label="Pattern"       value={meta.pattern} />
                <Row label="Period"        value={meta.period} />
                {meta.isUrgent        && <Row label="Urgent"         value="Yes" />}
                {meta.isEmergencyFill && <Row label="Emergency Fill" value="Yes" />}
            </>
        );
    }

    if (type === "VISIT") {
        return (
            <>
                <Row label="Case"            value={meta.caseIdentifier} />
                <Row label="Location"        value={meta.location} />
                <Row label="Visit Type"      value={formatLabel(meta.visitType)} />
                <Row label="Cleaner"           value={meta.cleaner} />
                <Row label="Status"          value={formatLabel(status)} />
                <Row label="Check In"        value={formatDateTime(meta.checkInTime)} />
                <Row label="Check Out"       value={formatDateTime(meta.checkOutTime)} />
                <Row label="Duration"        value={meta.durationMinutes != null ? `${meta.durationMinutes} min` : undefined} />
                <Row label="Distance at CI"  value={meta.checkInDistance != null ? `${meta.checkInDistance} m` : undefined} />
                {meta.overrideRequired && (
                    <Row label="Override"      value={meta.overrideReason ?? "Required"} />
                )}
                <Row label="Notes"           value={meta.notes} />
            </>
        );
    }

    if (type === "CREDENTIAL_EXPIRY") {
        return (
            <>
                <Row label="Cleaner"        value={meta.cleaner} />
                <Row label="Credential"   value={meta.customLabel ?? formatLabel(meta.credentialType)} />
                <Row label="Expires"      value={formatDateTime(meta.expiresAt)} />
                <Row
                    label="Days Remaining"
                    value={
                        meta.daysUntilExpiry != null
                            ? meta.daysUntilExpiry <= 0
                                ? "Expired"
                                : `${meta.daysUntilExpiry} days`
                            : undefined
                    }
                />
                <Row label="Status"       value={formatLabel(status)} />
            </>
        );
    }

    if (type === "INVOICE_DUE" || type === "INVOICE_OVERDUE") {
        return (
            <>
                <Row label="Business"  value={meta.businessName} />
                <Row label="Invoice #" value={meta.invoiceNumber} />
                <Row label="Total"     value={formatCurrency(meta.total)} />
                <Row label="Due Date"  value={formatDateTime(meta.dueAt)} />
                <Row label="Status"    value={formatLabel(status)} />
            </>
        );
    }

    return null;
}

// ─── Component ────────────────────────────────────────────────

const Calendar: React.FC = () => {
    const calendarRef = useRef<FullCalendar>(null);
    const { isOpen, openModal, closeModal } = useModal();

    const [selectedEvent, setSelectedEvent] = useState<BackendCalendarEvent | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    const { user } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if ( user === null) {
            router.replace("/");
        }
    }, [user, router]);

    // Active type filter — null means all types shown
    const [activeTypes, setActiveTypes] = useState<Set<CalendarEventType>>(
        new Set(ALL_EVENT_TYPES)
    );

    // ── FullCalendar event source callback ────────────────────
    const handleEventsLoad = useCallback(
        async (fetchInfo: { startStr: string; endStr: string }, successCallback: (events: object[]) => void, failureCallback: (err: Error) => void) => {
            setLoadError(null);
            try {
                const events = await fetchCalendarEvents({
                    from:  fetchInfo.startStr,
                    to:    fetchInfo.endStr,
                    // Only request types that are currently toggled on
                    types: activeTypes.size === ALL_EVENT_TYPES.length
                        ? undefined                                   // no filter = all types
                        : [...activeTypes],
                });

                const formatted = events.map((e) => ({
                    id:              e.id,
                    title:           e.title,
                    start:           e.start,
                    end:             e.end ?? undefined,
                    allDay:          e.allDay,
                    backgroundColor: e.color,
                    borderColor:     e.color,
                    textColor:       "#ffffff",
                    extendedProps: {
                        type:       e.type,
                        status:     e.status,
                        meta:       e.meta,
                        resourceId: e.resourceId,
                        businessId: e.businessId,
                        // Keep the raw event so the detail modal can render it
                        raw:        e,
                    },
                }));

                successCallback(formatted);
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to load calendar events";
                setLoadError(message);
                failureCallback(err instanceof Error ? err : new Error(message));
            }
        },
        // Re-run when activeTypes changes so the calendar refetches
        [activeTypes]
    );

    // ── Click handler ─────────────────────────────────────────
    const handleEventClick = (clickInfo: EventClickArg) => {
        const raw = clickInfo.event.extendedProps.raw as BackendCalendarEvent;
        if (raw) {
            setSelectedEvent(raw);
            openModal();
        }
    };

    // ── Type filter toggle ────────────────────────────────────
    const toggleType = (type: CalendarEventType) => {
        setActiveTypes((prev) => {
            const next = new Set(prev);
            if (next.has(type)) {
                // Always keep at least one type active
                if (next.size > 1) next.delete(type);
            } else {
                next.add(type);
            }
            return next;
        });
        // Tell FullCalendar to refetch
        calendarRef.current?.getApi().refetchEvents();
    };

    const handleCloseModal = () => {
        closeModal();
        setSelectedEvent(null);
    };

    const typeConfig = selectedEvent ? EVENT_TYPE_CONFIG[selectedEvent.type] : null;

    return (
        <div className="space-y-4">

            {/* ── Filter bar ───────────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mr-1">
            Show:
          </span>

                    {ALL_EVENT_TYPES.map((type) => {
                        const cfg     = EVENT_TYPE_CONFIG[type];
                        const enabled = activeTypes.has(type);
                        return (
                            <button
                                key={type}
                                type="button"
                                onClick={() => toggleType(type)}
                                className={[
                                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-all",
                                    enabled
                                        ? `${cfg.badgeClass} border-transparent`
                                        : "border-gray-300 text-gray-400 bg-transparent dark:border-gray-700 dark:text-gray-600",
                                ].join(" ")}
                            >
                                {/* Colour dot */}
                                <div className={cfg.badgeClass}>•</div>
                                <span
                                    className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ opacity: enabled ? 1 : 0.3 }}
                                />
                                {cfg.label}
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTypes(new Set(ALL_EVENT_TYPES));
                            calendarRef.current?.getApi().refetchEvents();
                        }}
                        className="ml-auto text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* ── Load error banner ─────────────────────────────────── */}
            {loadError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                    Failed to load events: {loadError}
                </div>
            )}

            {/* ── Calendar ──────────────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="custom-calendar">
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left:   "prev,next today",
                            center: "title",
                            right:  "dayGridMonth,timeGridWeek,timeGridDay",
                        }}
                        // Pull events from the backend on every navigation
                        events={handleEventsLoad}
                        // Re-fetch when the visible range changes
                        eventSourceSuccess={(rawEvents) => rawEvents}
                        eventClick={handleEventClick}
                        eventContent={renderEventContent}
                        // Show a loading indicator inside the calendar while fetching
                        loading={(isLoading) => {
                            const el = document.querySelector(".fc-view-harness") as HTMLElement | null;
                            if (el) el.style.opacity = isLoading ? "0.6" : "1";
                        }}
                        // Height so the calendar fills available space
                        height="auto"
                        // Clicking a date does nothing (read-only calendar)
                        selectable={false}
                        dayMaxEvents={4}
                        moreLinkContent={(args) => `+${args.num} more`}
                        moreLinkClassNames={"text-xs text-gray-500 dark:text-gray-400"}
                    />
                </div>
            </div>

            {/* ── Event detail modal ────────────────────────────────── */}
            <Modal
                isOpen={isOpen}
                onClose={handleCloseModal}
                className="max-w-[640px] p-6 lg:p-8"
            >
                {selectedEvent && typeConfig ? (
                    <div className="flex flex-col gap-5 overflow-y-auto custom-scrollbar max-h-[80vh]">

                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold mb-2 ${typeConfig.badgeClass}`}>
                  {typeConfig.label}
                </span>
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 leading-snug break-words">
                                    {selectedEvent.title}
                                </h2>
                                {selectedEvent.start && (
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {formatDateTime(selectedEvent.start)}
                                        {selectedEvent.end && !selectedEvent.allDay && (
                                            <> — {formatDateTime(selectedEvent.end)}</>
                                        )}
                                    </p>
                                )}
                            </div>

                            {/* Status dot */}
                            <div
                                className="w-4 h-4 rounded-full flex-shrink-0 mt-1 ring-2 ring-white dark:ring-gray-900"
                                style={{ backgroundColor: selectedEvent.color }}
                            />
                        </div>

                        {/* Detail rows */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 px-4">
                            <EventDetailRows event={selectedEvent} />
                        </div>

                        {/* Raw ID for debugging / deep links */}
                        <p className="text-xs text-gray-400 dark:text-gray-600 font-mono break-all">
                            ID: {selectedEvent.id}
                        </p>

                        {/* Footer */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
};

// ─── Event pill renderer ──────────────────────────────────────

const renderEventContent = (eventInfo: EventContentArg) => {
    const type   = eventInfo.event.extendedProps.type as CalendarEventType;
    const status = eventInfo.event.extendedProps.status as string;

    // Small icon per event type for scannability
    const ICONS: Record<CalendarEventType, string> = {
        SHIFT:               "🩺",
        RECURRING_SHIFT:     "🔁",
        VISIT:               "📍",
        CREDENTIAL_EXPIRY:   "📋",
        INVOICE_DUE:         "💳",
        INVOICE_OVERDUE:     "⚠️",
    };

    const icon = ICONS[type] ?? "";

    return (
        <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-white text-xs font-medium overflow-hidden w-full"
            style={{ backgroundColor: eventInfo.event.backgroundColor ?? "#3b82f6" }}
            title={`${eventInfo.event.title} · ${formatLabel(status)}`}
        >
      <span className="flex-shrink-0 leading-none" style={{ fontSize: "10px" }}>
        {icon}
      </span>
            {eventInfo.timeText && (
                <span className="flex-shrink-0 opacity-80 text-[10px]">
          {eventInfo.timeText}
        </span>
            )}
            <span className="truncate">{eventInfo.event.title}</span>
        </div>
    );
};

export default Calendar;