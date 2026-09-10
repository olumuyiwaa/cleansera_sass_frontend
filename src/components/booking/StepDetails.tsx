"use client";

import type { BookingFormState } from "./types";

type Props = {
  state: BookingFormState;
  update: (patch: Partial<BookingFormState>) => void;
  primaryColor?: string;
  onApplyCoupon?: () => void;
};

export function StepDetails({
  state,
  update,
  primaryColor = "#3F6B52",
  onApplyCoupon,
}: Props) {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-gray-900">Your details</h2>
        <p className="mt-1 text-sm text-gray-500">
          We’ll use these to confirm your booking and send updates.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="First name"
          required
          value={state.firstName}
          onChange={(v) => update({ firstName: v })}
          primaryColor={primaryColor}
          autoComplete="given-name"
        />
        <Field
          label="Last name"
          required
          value={state.lastName}
          onChange={(v) => update({ lastName: v })}
          primaryColor={primaryColor}
          autoComplete="family-name"
        />
      </div>

      <Field
        label="Phone"
        required
        type="tel"
        value={state.phone}
        onChange={(v) => update({ phone: v })}
        primaryColor={primaryColor}
        autoComplete="tel"
        placeholder="+1 555 000 0000"
      />

      <Field
        label="Email"
        type="email"
        value={state.email}
        onChange={(v) => update({ email: v })}
        primaryColor={primaryColor}
        autoComplete="email"
        placeholder="Optional — for receipts & reminders"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Special instructions
        </label>
        <textarea
          rows={3}
          value={state.notes}
          onChange={(e) => update({ notes: e.target.value })}
          placeholder="Gate code, pets, parking, focus areas…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 resize-none"
          style={{ ["--tw-ring-color" as string]: primaryColor }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Coupon code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={state.couponCode}
            onChange={(e) => update({ couponCode: e.target.value.toUpperCase() })}
            placeholder="SAVE10"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-offset-0"
            style={{ ["--tw-ring-color" as string]: primaryColor }}
          />
          <button
            type="button"
            onClick={onApplyCoupon}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Apply
          </button>
        </div>
        {state.quote?.coupon && (
          <p
            className={`mt-1.5 text-xs ${
              state.quote.coupon.valid ? "text-emerald-600" : "text-amber-700"
            }`}
          >
            {state.quote.coupon.valid
              ? "Coupon applied"
              : `Coupon: ${state.quote.coupon.reason || "invalid"}`}
          </p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  primaryColor,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  primaryColor: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
        style={{ ["--tw-ring-color" as string]: primaryColor }}
      />
    </div>
  );
}
