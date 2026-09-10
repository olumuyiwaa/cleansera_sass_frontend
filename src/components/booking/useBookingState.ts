"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getQuote,
  getSlots,
  submitBooking,
  type QuoteResponse,
  type Slot,
  type WidgetService,
} from "@/app/api/widget.api";
import {
  BookingFormState,
  Frequency,
  INITIAL_STATE,
  type BookingWizardProps,
} from "./types";

export function useBookingState({ slug, services }: BookingWizardProps) {
  const [state, setState] = useState<BookingFormState>(() => {
    const first = services[0];
    return {
      ...INITIAL_STATE,
      serviceId: first?.id ?? null,
    };
  });

  const [step, setStep] = useState(1);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<{
    id: string;
    scheduledStart: string;
    quotedPriceCents: number;
  } | null>(null);

  const quoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedService: WidgetService | null = useMemo(
    () => services.find((s) => s.id === state.serviceId) ?? null,
    [services, state.serviceId]
  );

  const update = useCallback((patch: Partial<BookingFormState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  // ─── Live quote (debounced) ───────────────────────────────────
  const refreshQuote = useCallback(async () => {
    if (!state.serviceId) {
      update({ quote: null, quoteError: null, quoteLoading: false });
      return;
    }

    update({ quoteLoading: true, quoteError: null });

    try {
      const data = await getQuote(slug, {
        serviceId: state.serviceId,
        addOnIds: state.addOnIds,
        latitude: state.latitude,
        longitude: state.longitude,
        scheduledStart: state.scheduledStart ?? undefined,
        couponCode: state.couponCode || undefined,
        rooms: state.rooms,
        bathrooms: state.bathrooms,
        sqft: state.sqft || undefined,
        frequency: state.frequency === "ONE_TIME" ? undefined : state.frequency,
      });
      update({ quote: data, quoteLoading: false, quoteError: null });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not get price";
      // Service-area failures surface as quote errors — useful for step 2
      const outside = /outside|service area/i.test(msg);
      update({
        quote: null,
        quoteLoading: false,
        quoteError: msg,
        serviceAreaOk: outside ? false : state.serviceAreaOk,
      });
    }
  }, [
    slug,
    state.serviceId,
    state.addOnIds,
    state.latitude,
    state.longitude,
    state.scheduledStart,
    state.couponCode,
    state.rooms,
    state.bathrooms,
    state.sqft,
    state.frequency,
    state.serviceAreaOk,
    update,
  ]);

  // Debounce quote calls
  useEffect(() => {
    if (quoteTimer.current) clearTimeout(quoteTimer.current);
    quoteTimer.current = setTimeout(() => {
      void refreshQuote();
    }, 350);
    return () => {
      if (quoteTimer.current) clearTimeout(quoteTimer.current);
    };
  }, [
    state.serviceId,
    state.addOnIds,
    state.rooms,
    state.bathrooms,
    state.sqft,
    state.frequency,
    state.couponCode,
    state.latitude,
    state.longitude,
    state.scheduledStart,
    refreshQuote,
  ]);

  // Mark service area OK when we get a successful quote with coordinates
  useEffect(() => {
    if (
      state.latitude != null &&
      state.longitude != null &&
      state.quote &&
      !state.quoteError
    ) {
      update({ serviceAreaOk: true });
    }
  }, [state.quote, state.quoteError, state.latitude, state.longitude, update]);

  // ─── Slots ────────────────────────────────────────────────────
  const loadSlots = useCallback(
    async (date: string) => {
      if (!state.serviceId || !date) {
        setSlots([]);
        return;
      }
      setSlotsLoading(true);
      setSlotsError(null);
      try {
        const data = await getSlots(slug, {
          serviceId: state.serviceId,
          date,
          slotMinutes: selectedService?.estimatedMinutes,
        });
        setSlots(data.slots || []);
      } catch (e) {
        setSlots([]);
        setSlotsError(e instanceof Error ? e.message : "Could not load times");
      } finally {
        setSlotsLoading(false);
      }
    },
    [slug, state.serviceId, selectedService?.estimatedMinutes]
  );

  useEffect(() => {
    if (state.selectedDate && step >= 3) {
      void loadSlots(state.selectedDate);
    }
  }, [state.selectedDate, state.serviceId, step, loadSlots]);

  // ─── Navigation guards ────────────────────────────────────────
  const canGoNext = useMemo(() => {
    switch (step) {
      case 1:
        return Boolean(state.serviceId);
      case 2:
        return (
          state.addressLine1.trim().length > 2 &&
          state.city.trim().length > 1 &&
          state.state.trim().length >= 1 &&
          state.serviceAreaOk !== false
        );
      case 3:
        return Boolean(state.scheduledStart);
      case 4:
        return (
          state.firstName.trim().length > 0 &&
          state.lastName.trim().length > 0 &&
          state.phone.trim().length >= 7
        );
      case 5:
        return true;
      default:
        return false;
    }
  }, [step, state]);

  const goNext = () => {
    if (canGoNext && step < 5) setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  // ─── Submit ───────────────────────────────────────────────────
  const confirmBooking = async () => {
    if (!state.serviceId || !state.scheduledStart) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitBooking(slug, {
        firstName: state.firstName.trim(),
        lastName: state.lastName.trim(),
        email: state.email.trim() || undefined,
        phone: state.phone.trim(),
        addressLine1: state.addressLine1.trim(),
        addressLine2: state.addressLine2.trim() || undefined,
        city: state.city.trim(),
        state: state.state.trim(),
        latitude: state.latitude,
        longitude: state.longitude,
        serviceId: state.serviceId,
        addOnIds: state.addOnIds,
        scheduledStart: state.scheduledStart,
        couponCode: state.couponCode.trim() || undefined,
        rooms: state.rooms,
        bathrooms: state.bathrooms,
        sqft: state.sqft || undefined,
        frequency: state.frequency,
        notes: state.notes.trim() || undefined,
      });
      setBookingResult({
        id: result.id,
        scheduledStart: result.scheduledStart,
        quotedPriceCents: result.quotedPriceCents,
      });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    state,
    update,
    step,
    setStep,
    selectedService,
    quote: state.quote as QuoteResponse | null,
    slots,
    slotsLoading,
    slotsError,
    canGoNext,
    goNext,
    goBack,
    loadSlots,
    refreshQuote,
    submitting,
    submitError,
    confirmBooking,
    bookingResult,
    setFrequency: (f: Frequency) => update({ frequency: f }),
  };
}
