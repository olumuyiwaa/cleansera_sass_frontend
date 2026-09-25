"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Booking.address");
  const [touched, setTouched] = useState(false);

  const handleBlur = () => {
    setTouched(true);
    // Trigger a quote refresh so service-area check runs when coords exist
    onValidateArea?.();
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-gray-900">{t("heading")}</h2>
        <p className="mt-1 text-sm text-gray-500">{t("subheading")}</p>
      </header>

      <div className="space-y-4">
        <Field
          label={t("streetAddress")}
          required
          value={state.addressLine1}
          onChange={(v) => update({ addressLine1: v, serviceAreaOk: null })}
          onBlur={handleBlur}
          placeholder={t("streetAddressPlaceholder")}
          primaryColor={primaryColor}
        />
        <Field
          label={t("addressLine2")}
          value={state.addressLine2}
          onChange={(v) => update({ addressLine2: v })}
          placeholder={t("optional")}
          primaryColor={primaryColor}
        />
        <div className="grid grid-cols-2 gap-4">
          <Field
            label={t("city")}
            required
            value={state.city}
            onChange={(v) => update({ city: v, serviceAreaOk: null })}
            onBlur={handleBlur}
            primaryColor={primaryColor}
          />
          <Field
            label={t("provinceOptional")}
            value={state.state}
            onChange={(v) => update({ state: v, serviceAreaOk: null })}
            onBlur={handleBlur}
            primaryColor={primaryColor}
          />
        </div>
        <Field
          label={t("postalCode")}
          required
          value={state.postalCode}
          onChange={(v) => update({ postalCode: v })}
          primaryColor={primaryColor}
        />

        {/* Optional manual lat/lng for testing without Maps */}
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700">
            {t("advancedCoordinates")}
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Field
              label={t("latitude")}
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
              label={t("longitude")}
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
          {t("inServiceArea")}
        </div>
      )}
      {state.serviceAreaOk === false && (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">{t("outsideServiceArea")}</p>
          <p className="mt-1 text-amber-800/80">{t("outsideServiceAreaHint")}</p>
        </div>
      )}
      {touched && !state.addressLine1.trim() && (
        <p className="text-sm text-red-600">{t("streetAddressRequired")}</p>
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
