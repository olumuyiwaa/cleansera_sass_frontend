import { authFetch } from "./authFetch";

export type CalendarEventType = "BOOKING" | "RECURRING";

export type CalendarEventMeta = {
  customerName?: string;
  serviceName?: string;
  address?: string;
  cleaners?: string[];
  quotedPriceCents?: number;
  paymentStatus?: string;
  cancelReason?: string | null;
  frequency?: string;
  dayOfWeek?: number;
  startTime?: string;
  nextRunDate?: string;
};

export interface BackendCalendarEvent {
  id: string;
  type: CalendarEventType;
  title: string;
  start: string;
  end: string | null;
  allDay: boolean;
  color: string;
  status: string;
  resourceId: string;
  businessId: string | null;
  meta: CalendarEventMeta;
}

export interface FetchCalendarEventsParams {
  from: string;
  to: string;
  types?: CalendarEventType[];
}

export async function fetchCalendarEvents(
  params: FetchCalendarEventsParams
): Promise<BackendCalendarEvent[]> {
  const query = new URLSearchParams();
  query.set("from", params.from);
  query.set("to", params.to);
  if (params.types?.length) query.set("types", params.types.join(","));

  const res = await authFetch(`/calendar/events?${query.toString()}`, {
    method: "GET",
  });

  return (res.data?.events ?? []) as BackendCalendarEvent[];
}
