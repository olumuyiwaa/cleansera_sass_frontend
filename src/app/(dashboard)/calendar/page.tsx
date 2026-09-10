"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventContentArg } from "@fullcalendar/core";

import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import {
    fetchCalendarEvents,
    type BackendCalendarEvent,
    type CalendarEventType,
} from "@/app/api/calendar";
import { useAuth } from "@/app/auth/useAuth";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/app/api/cleansera-types";

const EVENT_TYPE_CONFIG: Record<
    CalendarEventType,
    { label: string; badgeClass: string }
> = {
    BOOKING: {
        label: "Booking",
        badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    },
    RECURRING: {
        label: "Recurring",
        badgeClass: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
    },
};

const ALL_EVENT_TYPES = Object.keys(EVENT_TYPE_CONFIG) as CalendarEventType[];

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

function EventDetailRows({ event }: { event: BackendCalendarEvent }) {
    const { meta, type, status } = event;

    const Row = ({ label, value }: { label: string; value?: string | null }) =>
        value ? (
            <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-gray-100 py-2 last:border-0 dark:border-gray-800">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </span>
                <span className="break-words text-sm text-gray-800 dark:text-white/90">{value}</span>
            </div>
        ) : null;

    if (type === "BOOKING") {
        return (
            <>
                <Row label="Service" value={meta.serviceName} />
                <Row label="Customer" value={meta.customerName} />
                <Row label="Address" value={meta.address} />
                <Row label="Cleaners" value={meta.cleaners?.length ? meta.cleaners.join(", ") : undefined} />
                <Row label="Status" value={formatLabel(status)} />
                <Row label="Payment" value={formatLabel(meta.paymentStatus)} />
                <Row
                    label="Quoted"
                    value={
                        meta.quotedPriceCents != null ? formatMoney(meta.quotedPriceCents) : undefined
                    }
                />
                {meta.cancelReason && <Row label="Cancel reason" value={meta.cancelReason} />}
            </>
        );
    }

    return (
        <>
            <Row label="Service" value={meta.serviceName} />
            <Row label="Customer" value={meta.customerName} />
            <Row label="Frequency" value={formatLabel(meta.frequency)} />
            <Row label="Start time" value={meta.startTime} />
            <Row label="Next run" value={formatDateTime(meta.nextRunDate)} />
            <Row label="Status" value={formatLabel(status)} />
        </>
    );
}

const Calendar: React.FC = () => {
    const calendarRef = useRef<FullCalendar>(null);
    const { isOpen, openModal, closeModal } = useModal();

    const [selectedEvent, setSelectedEvent] = useState<BackendCalendarEvent | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    const { user } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (user === null) router.replace("/");
    }, [user, router]);

    const [activeTypes, setActiveTypes] = useState<Set<CalendarEventType>>(
        new Set(ALL_EVENT_TYPES)
    );

    const handleEventsLoad = useCallback(
        async (
            fetchInfo: { startStr: string; endStr: string },
            successCallback: (events: object[]) => void,
            failureCallback: (err: Error) => void
        ) => {
            setLoadError(null);
            try {
                const events = await fetchCalendarEvents({
                    from: fetchInfo.startStr,
                    to: fetchInfo.endStr,
                    types:
                        activeTypes.size === ALL_EVENT_TYPES.length
                            ? undefined
                            : [...activeTypes],
                });

                const formatted = events.map((e) => ({
                    id: e.id,
                    title: e.title,
                    start: e.start,
                    end: e.end ?? undefined,
                    allDay: e.allDay,
                    backgroundColor: e.color,
                    borderColor: e.color,
                    textColor: "#ffffff",
                    extendedProps: {
                        type: e.type,
                        status: e.status,
                        meta: e.meta,
                        resourceId: e.resourceId,
                        businessId: e.businessId,
                        raw: e,
                    },
                }));

                successCallback(formatted);
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to load calendar events";
                setLoadError(message);
                failureCallback(err instanceof Error ? err : new Error(message));
            }
        },
        [activeTypes]
    );

    const handleEventClick = (clickInfo: EventClickArg) => {
        const raw = clickInfo.event.extendedProps.raw as BackendCalendarEvent;
        if (raw) {
            setSelectedEvent(raw);
            openModal();
        }
    };

    const toggleType = (type: CalendarEventType) => {
        setActiveTypes((prev) => {
            const next = new Set(prev);
            if (next.has(type)) {
                if (next.size > 1) next.delete(type);
            } else {
                next.add(type);
            }
            return next;
        });
        calendarRef.current?.getApi().refetchEvents();
    };

    const handleCloseModal = () => {
        closeModal();
        setSelectedEvent(null);
    };

    const typeConfig = selectedEvent ? EVENT_TYPE_CONFIG[selectedEvent.type] : null;

    return (
        <div className="space-y-4 p-4 md:p-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Show:
          </span>
                    {ALL_EVENT_TYPES.map((type) => {
                        const cfg = EVENT_TYPE_CONFIG[type];
                        const enabled = activeTypes.has(type);
                        return (
                            <button
                                key={type}
                                type="button"
                                onClick={() => toggleType(type)}
                                className={[
                                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                                    enabled
                                        ? `${cfg.badgeClass} border-transparent`
                                        : "border-gray-300 bg-transparent text-gray-400 dark:border-gray-700 dark:text-gray-600",
                                ].join(" ")}
                            >
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
                        className="ml-auto text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {loadError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                    Failed to load events: {loadError}
                </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="custom-calendar">
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "dayGridMonth,timeGridWeek,timeGridDay",
                        }}
                        events={handleEventsLoad}
                        eventClick={handleEventClick}
                        eventContent={renderEventContent}
                        loading={(isLoading) => {
                            const el = document.querySelector(".fc-view-harness") as HTMLElement | null;
                            if (el) el.style.opacity = isLoading ? "0.6" : "1";
                        }}
                        height="auto"
                        selectable={false}
                        dayMaxEvents={4}
                        moreLinkContent={(args) => `+${args.num} more`}
                    />
                </div>
            </div>

            <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-[640px] p-6 lg:p-8">
                {selectedEvent && typeConfig ? (
                    <div className="custom-scrollbar flex max-h-[80vh] flex-col gap-5 overflow-y-auto">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                <span
                    className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeConfig.badgeClass}`}
                >
                  {typeConfig.label}
                </span>
                                <h2 className="break-words text-lg font-semibold leading-snug text-gray-800 dark:text-white/90">
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
                            <div
                                className="mt-1 h-4 w-4 flex-shrink-0 rounded-full ring-2 ring-white dark:ring-gray-900"
                                style={{ backgroundColor: selectedEvent.color }}
                            />
                        </div>

                        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 px-4 dark:divide-gray-800 dark:border-gray-800">
                            <EventDetailRows event={selectedEvent} />
                        </div>

                        <p className="break-all font-mono text-xs text-gray-400 dark:text-gray-600">
                            ID: {selectedEvent.resourceId}
                        </p>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
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

const renderEventContent = (eventInfo: EventContentArg) => {
    const type = eventInfo.event.extendedProps.type as CalendarEventType;
    const icon = type === "RECURRING" ? "↻" : "🧹";

    return (
        <div
            className="flex w-full items-center gap-1 overflow-hidden rounded px-1.5 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: eventInfo.event.backgroundColor ?? "#3b82f6" }}
            title={eventInfo.event.title}
        >
      <span className="flex-shrink-0 leading-none" style={{ fontSize: "10px" }}>
        {icon}
      </span>
            {eventInfo.timeText && (
                <span className="flex-shrink-0 text-[10px] opacity-80">{eventInfo.timeText}</span>
            )}
            <span className="truncate">{eventInfo.event.title}</span>
        </div>
    );
};

export default Calendar;