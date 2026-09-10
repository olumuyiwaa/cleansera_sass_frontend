"use client";

import type { WidgetService } from "@/app/api/widget.api";
import type { BookingFormState } from "./types";
import { formatMoney, frequencyLabel } from "./types";

type Props = {
  state: BookingFormState;
  service: WidgetService | null;
  primaryColor?: string;
  submitting: boolean;
  submitError: string | null;
  onConfirm: () => void;
};

export function StepReview({
  state,
  service,
  primaryColor = "#3F6B52",
  submitting,
  submitError,
  onConfirm,
}: Props) {
  const price = state.quote?.priceCents;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-gray-900">Review & confirm</h2>
        <p className="mt-1 text-sm text-gray-500">
          Double-check the details below, then book your clean.
        </p>
      </header>

      <dl className="rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
        <ReviewRow label="Service" value={service?.name ?? "—"} />
        <ReviewRow label="Frequency" value={frequencyLabel(state.frequency)} />
        <ReviewRow
          label="Home"
          value={`${state.rooms} bed · ${state.bathrooms} bath${
            state.sqft ? ` · ${state.sqft} sqft` : ""
          }`}
        />
        {state.addOnIds.length > 0 && service && (
          <ReviewRow
            label="Add-ons"
            value={service.addOns
              .filter((a) => state.addOnIds.includes(a.id))
              .map((a) => a.name)
              .join(", ")}
          />
        )}
        <ReviewRow
          label="Address"
          value={[state.addressLine1, state.addressLine2, state.city, state.state, state.postalCode]
            .filter(Boolean)
            .join(", ")}
        />
        <ReviewRow
          label="When"
          value={
            state.scheduledStart
              ? new Date(state.scheduledStart).toLocaleString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "—"
          }
        />
        <ReviewRow
          label="Contact"
          value={`${state.firstName} ${state.lastName} · ${state.phone}${
            state.email ? ` · ${state.email}` : ""
          }`}
        />
        {state.notes && <ReviewRow label="Notes" value={state.notes} />}
        <div className="flex justify-between items-center px-4 py-4 bg-gray-50">
          <dt className="text-sm font-semibold text-gray-700">Total</dt>
          <dd className="text-xl font-bold" style={{ color: primaryColor }}>
            {price != null ? formatMoney(price) : "—"}
          </dd>
        </div>
      </dl>

      <p className="text-xs text-gray-500 leading-relaxed">
        By booking you agree to the service terms. You can cancel or reschedule free of charge
        up to 12 hours before the appointment from your customer portal.
      </p>

      {submitError && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{submitError}</div>
      )}

      <button
        type="button"
        disabled={submitting || price == null}
        onClick={onConfirm}
        className="w-full rounded-xl py-3.5 text-base font-semibold text-white shadow-sm disabled:opacity-60 transition"
        style={{ backgroundColor: primaryColor }}
      >
        {submitting
          ? "Booking…"
          : price != null
            ? `Confirm booking · ${formatMoney(price)}`
            : "Confirm booking"}
      </button>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-3">
      <dt className="text-sm text-gray-500 shrink-0">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 text-right">{value}</dd>
    </div>
  );
}
