"use client";

import { ProgressBar } from "./ProgressBar";
import { StickySummary } from "./StickySummary";
import { StepService } from "./StepService";
import { StepAddress } from "./StepAddress";
import { StepSchedule } from "./StepSchedule";
import { StepDetails } from "./StepDetails";
import { StepReview } from "./StepReview";
import { useBookingState } from "./useBookingState";
import type { BookingWizardProps } from "./types";
import { formatMoney } from "./types";

export function BookingWizard(props: BookingWizardProps) {
  const {
    state,
    update,
    step,
    selectedService,
    slots,
    slotsLoading,
    slotsError,
    canGoNext,
    goNext,
    goBack,
    refreshQuote,
    submitting,
    submitError,
    confirmBooking,
    bookingResult,
  } = useBookingState(props);

  const primary =
    props.business.branding?.primaryColor ||
    props.business.branding?.accentColor ||
    "#3F6B52";

  // ─── Success screen ───────────────────────────────────────────
  if (bookingResult) {
    return (
      <div className="mx-auto max-w-lg text-center py-12 px-4">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: primary }}
        >
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">You’re booked!</h1>
        <p className="mt-2 text-gray-600">
          We’ve sent a confirmation to {state.phone}
          {state.email ? ` and ${state.email}` : ""}.
        </p>
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 text-left text-sm space-y-2">
          <p>
            <span className="text-gray-500">When: </span>
            <strong>
              {new Date(bookingResult.scheduledStart).toLocaleString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </strong>
          </p>
          <p>
            <span className="text-gray-500">Total: </span>
            <strong style={{ color: primary }}>
              {formatMoney(bookingResult.quotedPriceCents)}
            </strong>
          </p>
          <p className="text-xs text-gray-400">Ref: {bookingResult.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <p className="mt-6 text-sm text-gray-500">
          Manage or reschedule anytime from your customer portal.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        {props.business.branding?.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={props.business.branding.logoUrl}
            alt=""
            className="h-10 w-10 rounded-lg object-cover"
          />
        )}
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{props.business.name}</h1>
          <p className="text-sm text-gray-500">Book a cleaning</p>
        </div>
      </div>

      <ProgressBar current={step} primaryColor={primary} />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Steps */}
        <div className="min-w-0">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7 shadow-sm">
            {step === 1 && (
              <StepService
                state={state}
                services={props.services}
                selectedService={selectedService}
                update={update}
                primaryColor={primary}
              />
            )}
            {step === 2 && (
              <StepAddress
                state={state}
                update={update}
                primaryColor={primary}
                onValidateArea={refreshQuote}
              />
            )}
            {step === 3 && (
              <StepSchedule
                state={state}
                update={update}
                slots={slots}
                slotsLoading={slotsLoading}
                slotsError={slotsError}
                primaryColor={primary}
              />
            )}
            {step === 4 && (
              <StepDetails
                state={state}
                update={update}
                primaryColor={primary}
                onApplyCoupon={refreshQuote}
              />
            )}
            {step === 5 && (
              <StepReview
                state={state}
                service={selectedService}
                primaryColor={primary}
                submitting={submitting}
                submitError={submitError}
                onConfirm={confirmBooking}
              />
            )}

            {/* Nav buttons (hidden on final step — confirm lives inside StepReview) */}
            {step < 5 && (
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 1}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext}
                  className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition"
                  style={{ backgroundColor: primary }}
                >
                  Continue
                </button>
              </div>
            )}
            {step === 5 && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={goBack}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  ← Edit details
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sticky summary — desktop */}
        <div className="hidden lg:block">
          <StickySummary state={state} service={selectedService} primaryColor={primary} />
        </div>
      </div>

      {/* Mobile sticky price bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-3 safe-area-pb">
        <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold" style={{ color: primary }}>
              {state.quoteLoading
                ? "…"
                : state.quote
                  ? formatMoney(state.quote.priceCents)
                  : "—"}
            </p>
          </div>
          {step < 5 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext}
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: primary }}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={confirmBooking}
              disabled={submitting || !state.quote}
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: primary }}
            >
              {submitting ? "Booking…" : "Confirm"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
