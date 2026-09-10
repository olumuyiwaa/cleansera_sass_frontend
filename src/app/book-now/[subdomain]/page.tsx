"use client";

import { use, useEffect, useMemo, useState } from "react";
import {
    getStorefront,
    getQuote,
    getSlots,
    submitBooking,
    WidgetStorefront,
    WidgetQuote,
    WidgetSlot,
} from "@/app/api/widget.api";
import { Service } from "@/app/api/cleansera-types";

type Step = "service" | "schedule" | "details" | "success";

function centsToDisplay(cents: number) {
    return `₦${(cents / 100).toLocaleString(undefined, {
        maximumFractionDigits: 0,
    })}`;
}

export default function BookingWidgetPage({
    params,
}: {
    params: Promise<{ subdomain: string }>;
}) {
    const { subdomain } = use(params);

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [storefront, setStorefront] = useState<WidgetStorefront | null>(
        null
    );

    const [step, setStep] = useState<Step>("service");
    const [selectedService, setSelectedService] = useState<Service | null>(
        null
    );
    const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
    const [couponCode, setCouponCode] = useState("");
    const [quote, setQuote] = useState<WidgetQuote | null>(null);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [quoteError, setQuoteError] = useState<string | null>(null);

    const [selectedDate, setSelectedDate] = useState<string>("");
    const [slots, setSlots] = useState<WidgetSlot[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<WidgetSlot | null>(null);

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

    const branding = storefront?.business?.branding;
    const primaryColor = branding?.primaryColor || "#111827";

    // Report height to the parent page so embed.js can size the iframe —
    // this page is meant to run inside an iframe on a business's own site.
    useEffect(() => {
        if (typeof window === "undefined" || window.parent === window) return;
        const report = () =>
            window.parent.postMessage(
                { source: "cleansera-widget", height: document.body.scrollHeight },
                "*"
            );
        const observer = new ResizeObserver(report);
        observer.observe(document.body);
        report();
        return () => observer.disconnect();
    }, [step, storefront]);

    // Load storefront
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

    // Re-quote whenever service/add-ons/coupon change
    useEffect(() => {
        if (!selectedService) {
            setQuote(null);
            return;
        }
        let cancelled = false;
        setQuoteLoading(true);
        setQuoteError(null);
        getQuote(subdomain, {
            serviceId: selectedService.id,
            addOnIds: selectedAddOnIds,
            couponCode: couponCode || undefined,
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
        return () => {
            cancelled = true;
        };
    }, [subdomain, selectedService, selectedAddOnIds, couponCode]);

    // Load slots when a date is picked
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
            });
            setStep("success");
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
            <div className="flex min-h-[400px] items-center justify-center p-8 text-gray-500">
                Loading booking form…
            </div>
        );
    }

    if (loadError || !storefront) {
        return (
            <div className="flex min-h-[400px] items-center justify-center p-8 text-center text-gray-600">
                {loadError || "This booking page isn't available."}
            </div>
        );
    }

    return (
        <div
            className="mx-auto w-full max-w-xl p-4 sm:p-6"
            style={{ ["--brand" as string]: primaryColor }}
        >
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

            <ol className="mb-6 flex gap-2 text-xs font-medium text-gray-400">
                {(["service", "schedule", "details"] as Step[]).map((s, i) => (
                    <li
                        key={s}
                        className={`flex-1 rounded-full border-b-2 pb-2 text-center ${
                            step === s
                                ? "border-[var(--brand)] text-gray-900"
                                : "border-gray-200"
                        }`}
                    >
                        {i + 1}.{" "}
                        {s === "service"
                            ? "Service"
                            : s === "schedule"
                            ? "Schedule"
                            : "Your details"}
                    </li>
                ))}
            </ol>

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
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900">
                                        {svc.name}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        from {centsToDisplay(svc.basePriceCents)}
                                    </span>
                                </div>
                                {svc.description && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        {svc.description}
                                    </p>
                                )}
                            </button>
                        ))}
                    </div>

                    {selectedService && selectedService.addOns.length > 0 && (
                        <div>
                            <h3 className="mb-2 text-sm font-medium text-gray-700">
                                Add-ons
                            </h3>
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
                                onChange={(e) =>
                                    setCouponCode(e.target.value.toUpperCase())
                                }
                                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                placeholder="SAVE10"
                            />
                        </div>
                    )}

                    {selectedService && (
                        <div className="rounded-md bg-gray-50 p-3 text-sm">
                            {quoteLoading && (
                                <span className="text-gray-500">Calculating price…</span>
                            )}
                            {quoteError && (
                                <span className="text-red-600">{quoteError}</span>
                            )}
                            {quote && !quoteLoading && (
                                <div className="flex items-center justify-between font-medium text-gray-900">
                                    <span>Estimated total</span>
                                    <span>{centsToDisplay(quote.priceCents)}</span>
                                </div>
                            )}
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
                                <p className="text-sm text-gray-500">
                                    Checking availability…
                                </p>
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
                            onChange={(e) =>
                                setForm({ ...form, lastName: e.target.value })
                            }
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

                    {quote && (
                        <div className="flex items-center justify-between rounded-md bg-gray-50 p-3 text-sm font-medium text-gray-900">
                            <span>Total due at service</span>
                            <span>{centsToDisplay(quote.priceCents)}</span>
                        </div>
                    )}

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
                        {selectedService?.name} appointment shortly. A confirmation
                        was sent to you.
                    </p>
                </div>
            )}
        </div>
    );
}
