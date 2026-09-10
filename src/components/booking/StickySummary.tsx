"use client";

import type { WidgetService } from "@/app/api/widget.api";
import type { BookingFormState } from "./types";
import { formatMoney, frequencyLabel } from "./types";

type Props = {
  state: BookingFormState;
  service: WidgetService | null;
  primaryColor?: string;
};

export function StickySummary({ state, service, primaryColor = "#3F6B52" }: Props) {
  const price = state.quote?.priceCents;
  const minutes = state.quote?.estimatedMinutes ?? service?.estimatedMinutes;

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Booking summary
      </h3>

      <div className="mt-4 space-y-3 text-sm">
        <Row label="Service" value={service?.name ?? "—"} />
        <Row label="Frequency" value={frequencyLabel(state.frequency)} />
        {(state.rooms > 0 || state.bathrooms > 0) && (
          <Row
            label="Home size"
            value={`${state.rooms} bed · ${state.bathrooms} bath${
              state.sqft ? ` · ${state.sqft} sqft` : ""
            }`}
          />
        )}
        {state.addOnIds.length > 0 && service && (
          <Row
            label="Add-ons"
            value={service.addOns
              .filter((a) => state.addOnIds.includes(a.id))
              .map((a) => a.name)
              .join(", ")}
          />
        )}
        {state.addressLine1 && (
          <Row
            label="Address"
            value={[state.addressLine1, state.city, state.state]
              .filter(Boolean)
              .join(", ")}
          />
        )}
        {state.scheduledStart && (
          <Row
            label="When"
            value={new Date(state.scheduledStart).toLocaleString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          />
        )}
        {minutes != null && <Row label="Est. duration" value={`~${minutes} min`} />}
      </div>

      <div className="mt-5 border-t border-gray-100 pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-gray-600">Total</span>
          <div className="text-right">
            {state.quoteLoading ? (
              <span className="text-lg font-semibold text-gray-400">…</span>
            ) : price != null ? (
              <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                {formatMoney(price)}
              </span>
            ) : (
              <span className="text-lg font-semibold text-gray-400">—</span>
            )}
            {state.frequency !== "ONE_TIME" && price != null && (
              <p className="text-xs text-emerald-600 mt-0.5">
                Recurring discount applied
              </p>
            )}
          </div>
        </div>
        {state.quoteError && (
          <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5">
            {state.quoteError}
          </p>
        )}
      </div>

      <ul className="mt-5 space-y-2 text-xs text-gray-500">
        <li className="flex items-start gap-2">
          <CheckIcon /> Background-checked cleaners
        </li>
        <li className="flex items-start gap-2">
          <CheckIcon /> Free cancellation (12h+)
        </li>
        <li className="flex items-start gap-2">
          <CheckIcon /> Instant confirmation
        </li>
      </ul>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-900 font-medium text-right">{value}</span>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5 mt-0.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
