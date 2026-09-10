"use client";

import { useState } from "react";
import type { BookingFormState } from "./types";

type Props = {
  state: BookingFormState;
  update: (patch: Partial<BookingFormState>) => void;
  primaryColor?: string;
  onValidateArea?: () => void;
};

/**
 * Simple address form. For production, wire Google Places Autocomplete
 * using NEXT_PUBLIC_GOOGLE_MAPS_API_KEY and set lat/lng automatically.
 */
export function StepAddress({
  state,
  update,
  primaryColor = "#3F6B52",
  onValidateArea,
}: Props) {
  const [touched, setTouched] = useState(false);

  const handleBlur = () => {
    setTouched(true);
    // Trigger a quote refresh so service-area check runs when coords exist
    onValidateArea?.();
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-gray-900">Where should we clean?</h2>
        <p className="mt-1 text-sm text-gray-500">
          We’ll check that your address is in our service area.
        </p>
      </header>

      <div className="space-y-4">
        <Field
          label="Street address"
          required
          value={state.addressLine1}
          onChange={(v) => update({ addressLine1: v, serviceAreaOk: null })}
          onBlur={handleBlur}
          placeholder="123 Main St"
          primaryColor={primaryColor}
        />
        <Field
          label="Apt / Suite / Unit"
          value={state.addressLine2}
          onChange={(v) => update({ addressLine2: v })}
          placeholder="Optional"
          primaryColor={primaryColor}
        />
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="City"
            required
            value={state.city}
            onChange={(v) => update({ city: v, serviceAreaOk: null })}
            onBlur={handleBlur}
            primaryColor={primaryColor}
          />
          <Field
            label="State / Region"
            required
            value={state.state}
            onChange={(v) => update({ state: v, serviceAreaOk: null })}
            onBlur={handleBlur}
            primaryColor={primaryColor}
          />
        </div>
        <Field
          label="Postal / ZIP code"
          value={state.postalCode}
          onChange={(v) => update({ postalCode: v })}
          primaryColor={primaryColor}
        />

        {/* Optional manual lat/lng for testing without Maps */}
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700">
            Advanced: coordinates (optional)
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Field
              label="Latitude"
              value={state.latitude != null ? String(state.latitude) : ""}
              onChange={(v) =>
                update({
                  latitude: v === "" ? null : Number(v),
                  serviceAreaOk: null,
                })
              }
              onBlur={handleBlur}
              primaryColor={primaryColor}
            />
            <Field
              label="Longitude"
              value={state.longitude != null ? String(state.longitude) : ""}
              onChange={(v) =>
                update({
                  longitude: v === "" ? null : Number(v),
                  serviceAreaOk: null,
                })
              }
              onBlur={handleBlur}
              primaryColor={primaryColor}
            />
          </div>
        </details>
      </div>

      {/* Service area feedback */}
      {state.serviceAreaOk === true && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Great news — we service this area.
        </div>
      )}
      {state.serviceAreaOk === false && (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">This address is outside our current service area.</p>
          <p className="mt-1 text-amber-800/80">
            You can still leave your details on the next steps and we’ll reach out if we expand.
          </p>
        </div>
      )}
      {touched && !state.addressLine1.trim() && (
        <p className="text-sm text-red-600">Please enter a street address.</p>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required,
  primaryColor,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  primaryColor: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
        style={{ ["--tw-ring-color" as string]: primaryColor }}
      />
    </div>
  );
}
