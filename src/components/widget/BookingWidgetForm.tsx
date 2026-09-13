"use client";

import { Suspense } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getStorefront,
  getQuote,
  getSlots,
  submitBooking,
  type StorefrontResponse,
  type QuoteResponse,
  type Slot,
  type WidgetService,
} from "@/app/api/widget.api";

type Step = "service" | "schedule" | "details" | "success";
const STEPS: Step[] = ["service", "schedule", "details"];
const STEP_LABELS: Record<Step, string> = {
  service: "Service",
  schedule: "Schedule",
  details: "Your details",
  success: "Done",
};

function centsToDisplay(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
}

export type BookingWidgetFormProps = {
  subdomain: string;
  /** Compact header when used inside a modal */
  compact?: boolean;
  onSuccess?: () => void;
};

/**
 * Multi-step booking form. Used by:
 * - /book-now/[slug] (full page / iframe embed)
 * - BookingWidgetModal on /site/[subdomain]
 *
 * Note: /book-now/[slug] itself actually renders the newer BookingWizard
 * component (components/booking/), not this one — this form is currently
 * only reachable via the BookingWidgetModal preview on the mini-site. Kept
 * as its own export (wrapped in Suspense below, required by useSearchParams
 * in the app router) in case that changes.
 */
export function BookingWidgetForm(props: BookingWidgetFormProps) {
  return (
    <Suspense fallback={<div className="flex min-h-[280px] items-center justify-center p-8 text-gray-500">Loading booking form…</div>}>
      <BookingWidgetFormInner {...props} />
    </Suspense>
  );
}

function BookingWidgetFormInner({
  subdomain,
  compact = false,
  onSuccess,
}: BookingWidgetFormProps) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [storefront, setStorefront] = useState<StorefrontResponse | null>(null);

  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<WidgetService | null>(null);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState("");

  // Only relevant for PER_SQFT / PER_ROOM services — the quote is wrong
  // (silently priced as if it were a flat-rate job) if these aren't
  // collected and sent, so they're required before a quote request fires
  // for those pricing models.
  const [sqft, setSqft] = useState("");
  const [rooms, setRooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");

  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<{
    referralCode?: string;
    referralDiscountCents?: number;
  } | null>(null);

  // A referral link looks like /book-now/acme-cleaning?ref=AB12CD — carry
  // that through to the booking submission so the referrer gets credited
  // and the new customer gets their discount, without them having to type
  // anything in.
  const searchParams = useSearchParams();
  const referralCode = searchParams?.get("ref") || undefined;

  const branding = storefront?.business?.branding;
  const primaryColor = branding?.primaryColor || "#3F6B52";

  // iframe height report (embed only)
  useEffect(() => {
    if (typeof window === "undefined" || window.parent === window) return;
    const report = () =>
      window.parent.postMessage(
        {
          source: "cleansera-widget",
          height: document.body.scrollHeight,
        },
        "*"
      );
    const observer = new ResizeObserver(report);
    observer.observe(document.body);
    report();
    return () => observer.disconnect();
  }, [step, storefront]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getStorefront(subdomain)
      .then((data) => {
        if (!cancelled) setStorefront(data);
      })
      .catch((e) => {
        if (!cancelled)
          setLoadError(
            e instanceof Error
              ? e.message
              : "This booking page isn't available."
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [subdomain]);

  // Reset the dimension inputs whenever the selected service changes so a
  // sqft value entered for one service doesn't silently carry over and
  // get sent for a totally different service's quote.
  useEffect(() => {
    setSqft("");
    setRooms("");
    setBathrooms("");
  }, [selectedService?.id]);

  const sqftNum = sqft ? Number(sqft) : undefined;
  const roomsNum = rooms ? Number(rooms) : undefined;
  const bathroomsNum = bathrooms ? Number(bathrooms) : undefined;

  // A quote is only meaningful once the pricing model's required dimension
  // has actually been entered — otherwise we'd be firing requests (and
  // showing a misleading price) for an incomplete PER_SQFT/PER_ROOM job.
  const dimensionsReady = useMemo(() => {
    if (!selectedService) return false;
    if (selectedService.pricingModel === "PER_SQFT") return !!sqftNum && sqftNum > 0;
    if (selectedService.pricingModel === "PER_ROOM") return !!roomsNum && roomsNum > 0;
    return true;
  }, [selectedService, sqftNum, roomsNum]);

  // Debounced live pricing: fires ~400ms after the customer stops typing/
  // toggling instead of on every keystroke, so a coupon code or sqft value
  // being typed out doesn't spam the quote endpoint mid-entry.
  useEffect(() => {
    if (!selectedService || !dimensionsReady) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      setQuoteLoading(true);
      setQuoteError(null);
      getQuote(subdomain, {
        serviceId: selectedService.id,
        addOnIds: selectedAddOnIds,
        couponCode: couponCode || undefined,
        sqft: sqftNum,
        rooms: roomsNum,
        bathrooms: bathroomsNum,
      })
        .then((q) => {
          if (!cancelled) setQuote(q);
        })
        .catch((e) => {
          if (!cancelled) {
            setQuote(null);
            setQuoteError(
              e instanceof Error ? e.message : "Couldn't get a quote"
            );
          }
        })
        .finally(() => {
          if (!cancelled) setQuoteLoading(false);
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [subdomain, selectedService, selectedAddOnIds, couponCode, dimensionsReady, sqftNum, roomsNum, bathroomsNum]);

  useEffect(() => {
    if (!selectedService || !selectedDate) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    setSelectedSlot(null);
    getSlots(subdomain, {
      serviceId: selectedService.id,
      date: selectedDate,
    })
      .then((res) => {
        if (!cancelled) setSlots(res.slots);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [subdomain, selectedService, selectedDate]);

  const minDate = useMemo(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }, []);

  function toggleAddOn(id: string) {
    setSelectedAddOnIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit() {
    if (!selectedService || !selectedSlot) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitBooking(subdomain, {
        ...form,
        serviceId: selectedService.id,
        addOnIds: selectedAddOnIds,
        scheduledStart: selectedSlot.start,
        couponCode: couponCode || undefined,
        referralCode,
        sqft: sqftNum,
        rooms: roomsNum,
        bathrooms: bathroomsNum,
      }).then((res) => {
        setBookingResult({
          referralCode: res.referralCode,
          referralDiscountCents: res.referralDiscountCents,
        });
      });
      setStep("success");
      onSuccess?.();
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "Couldn't submit your booking"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center p-8 text-gray-500">
        Loading booking form…
      </div>
    );
  }

  if (loadError || !storefront) {
    return (
      <div className="flex min-h-[280px] items-center justify-center p-8 text-center text-gray-600">
        {loadError || "This booking page isn't available."}
      </div>
    );
  }

  const stepIndex = STEPS.indexOf(step === "success" ? "details" : step);

  return (
    <div
      className={`mx-auto w-full max-w-xl ${compact ? "p-0" : "p-4 sm:p-6"}`}
      style={{ ["--brand" as string]: primaryColor }}
    >
      {!compact && (
        <header className="mb-6 flex items-center gap-3">
          {branding?.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoUrl}
              alt={storefront.business.name}
              className="h-10 w-10 rounded object-contain"
            />
          )}
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Book {storefront.business.name}
            </h1>
            {branding?.tagline && (
              <p className="text-sm text-gray-500">{branding.tagline}</p>
            )}
          </div>
        </header>
      )}

      {step !== "success" && (
        <ol className="mb-6 flex gap-2 text-xs font-medium">
          {STEPS.map((s, i) => {
            const isDone = i < stepIndex;
            const isCurrent = s === step;
            return (
              <li
                key={s}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full border-b-2 pb-2 text-center ${
                  isCurrent
                    ? "border-[var(--brand)] text-gray-900"
                    : isDone
                    ? "border-[var(--brand)]/50 text-gray-500"
                    : "border-gray-200 text-gray-400"
                }`}
              >
                {isDone ? (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand)] text-[10px] text-white">
                    ✓
                  </span>
                ) : (
                  <span>{i + 1}.</span>
                )}
                {STEP_LABELS[s]}
              </li>
            );
          })}
        </ol>
      )}

      {step === "service" && (
        <div className="space-y-4">
          <div className="space-y-3">
            {storefront.services.map((svc) => (
              <button
                key={svc.id}
                type="button"
                onClick={() => {
                  setSelectedService(svc);
                  setSelectedAddOnIds([]);
                }}
                className={`w-full rounded-lg border p-4 text-left transition ${
                  selectedService?.id === svc.id
                    ? "border-[var(--brand)] ring-1 ring-[var(--brand)]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-gray-900">{svc.name}</span>
                  <span className="shrink-0 text-sm text-gray-500">
                    from {centsToDisplay(svc.basePriceCents)}
                    {svc.pricingModel === "PER_SQFT" && " · priced by sq ft"}
                    {svc.pricingModel === "PER_ROOM" && " · priced by rooms"}
                  </span>
                </div>
                {svc.description && (
                  <p className="mt-1 text-sm text-gray-500">{svc.description}</p>
                )}
              </button>
            ))}
          </div>

          {selectedService?.pricingModel === "PER_SQFT" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Home size (sq ft)
              </label>
              <input
                type="number"
                min={1}
                inputMode="numeric"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
              />
            </div>
          )}

          {selectedService?.pricingModel === "PER_ROOM" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Bedrooms
                </label>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  placeholder="e.g. 3"
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Bathrooms
                </label>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  placeholder="e.g. 2"
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                />
              </div>
            </div>
          )}

          {selectedService && selectedService.addOns.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700">Add-ons</h3>
              <div className="space-y-2">
                {selectedService.addOns.map((a) => (
                  <label
                    key={a.id}
                    className="flex items-center justify-between rounded-md border border-gray-200 p-3 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedAddOnIds.includes(a.id)}
                        onChange={() => toggleAddOn(a.id)}
                      />
                      {a.name}
                    </span>
                    <span className="text-gray-500">
                      +{centsToDisplay(a.priceCents)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {selectedService && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Coupon code (optional)
              </label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                placeholder="SAVE10"
              />
            </div>
          )}

          <button
            type="button"
            disabled={!selectedService || !quote}
            onClick={() => setStep("schedule")}
            className="w-full rounded-md bg-[var(--brand)] py-2.5 font-medium text-white disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      )}

      {step === "schedule" && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              min={minDate}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
            />
          </div>

          {selectedDate && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700">
                Available times
              </h3>
              {slotsLoading && (
                <p className="text-sm text-gray-500">Checking availability…</p>
              )}
              {!slotsLoading && slots.length === 0 && (
                <p className="text-sm text-gray-500">
                  No openings that day — try another date.
                </p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {slots.map((s) => (
                  <button
                    key={s.start}
                    type="button"
                    onClick={() => setSelectedSlot(s)}
                    className={`rounded-md border p-2 text-sm ${
                      selectedSlot?.start === s.start
                        ? "border-[var(--brand)] ring-1 ring-[var(--brand)]"
                        : "border-gray-200"
                    }`}
                  >
                    {new Date(s.start).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep("service")}
              className="flex-1 rounded-md border border-gray-300 py-2.5 font-medium text-gray-700"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!selectedSlot}
              onClick={() => setStep("details")}
              className="flex-1 rounded-md bg-[var(--brand)] py-2.5 font-medium text-white disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === "details" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="First name"
              value={form.firstName}
              onChange={(e) =>
                setForm({ ...form, firstName: e.target.value })
              }
              className="rounded-md border border-gray-300 p-2 text-sm"
            />
            <input
              placeholder="Last name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="rounded-md border border-gray-300 p-2 text-sm"
            />
          </div>
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
          />
          <input
            placeholder="Email (optional)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
          />
          <input
            placeholder="Address"
            value={form.addressLine1}
            onChange={(e) =>
              setForm({ ...form, addressLine1: e.target.value })
            }
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
          />
          <input
            placeholder="Apt / unit (optional)"
            value={form.addressLine2}
            onChange={(e) =>
              setForm({ ...form, addressLine2: e.target.value })
            }
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="rounded-md border border-gray-300 p-2 text-sm"
            />
            <input
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="rounded-md border border-gray-300 p-2 text-sm"
            />
          </div>

          {submitError && (
            <p className="text-sm text-red-600">{submitError}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep("schedule")}
              className="flex-1 rounded-md border border-gray-300 py-2.5 font-medium text-gray-700"
            >
              Back
            </button>
            <button
              type="button"
              disabled={
                submitting ||
                !form.firstName ||
                !form.lastName ||
                !form.phone ||
                !form.addressLine1 ||
                !form.city ||
                !form.state
              }
              onClick={handleSubmit}
              className="flex-1 rounded-md bg-[var(--brand)] py-2.5 font-medium text-white disabled:opacity-40"
            >
              {submitting ? "Booking…" : "Confirm booking"}
            </button>
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="py-10 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Booking requested!
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {storefront.business.name} will confirm your{" "}
            {selectedService?.name} appointment shortly. A confirmation was
            sent to you.
          </p>
          {!!bookingResult?.referralDiscountCents && (
            <p className="mt-3 text-sm font-medium text-green-600">
              {centsToDisplay(bookingResult.referralDiscountCents)} referral
              discount applied 🎉
            </p>
          )}
          {bookingResult?.referralCode && (
            <div className="mx-auto mt-6 max-w-xs rounded-lg border border-dashed border-gray-300 p-4">
              <p className="text-xs text-gray-500">
                Know someone who needs a clean home? Share your code — you
                both get $10 off.
              </p>
              <p className="mt-2 text-lg font-semibold tracking-wide text-gray-900">
                {bookingResult.referralCode}
              </p>
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}${window.location.pathname}?ref=${bookingResult.referralCode}`;
                  navigator.clipboard?.writeText(url);
                }}
                className="mt-2 text-xs font-medium text-[var(--brand)] underline"
              >
                Copy your referral link
              </button>
            </div>
          )}
        </div>
      )}

      {/* Persistent price summary — visible on every step once a service is
          picked, not just the step that happens to render it, so the
          customer never loses sight of the number they're committing to. */}
      {step !== "success" && selectedService && (
        <div className="sticky bottom-0 mt-4 -mx-4 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border sm:px-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {quoteLoading ? "Calculating price…" : "Estimated total"}
            </span>
            {quoteError ? (
              <span className="text-red-600">{quoteError}</span>
            ) : (
              <span className="text-base font-semibold text-gray-900">
                {quote ? centsToDisplay(quote.priceCents) : "—"}
              </span>
            )}
          </div>
          {quote?.coupon?.valid && (
            <p className="mt-0.5 text-xs text-green-600">Coupon applied</p>
          )}
          {quote?.coupon && quote.coupon.valid === false && (
            <p className="mt-0.5 text-xs text-amber-600">
              {quote.coupon.reason || "Coupon not applicable"}
            </p>
          )}
        </div>
      )}

      {!compact && step !== "success" && (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
          <span aria-hidden>🔒</span> Secure booking · No payment required to
          request a slot
        </p>
      )}
    </div>
  );
}
