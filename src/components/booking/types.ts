import { getActiveCurrency } from "@/app/services/currency";
import type {
  WidgetService,
  WidgetBusiness,
  QuoteResponse,
  StorefrontPayment,
  StorefrontCancellationPolicy,
} from "@/app/api/widget.api";

export type Frequency = "ONE_TIME" | "WEEKLY" | "BIWEEKLY" | "MONTHLY";

export type BookingFormState = {
  // Step 1 – Service & scope
  serviceId: string | null;
  frequency: Frequency;
  rooms: number;
  bathrooms: number;
  sqft: number;
  addOnIds: string[];

  // Step 2 – Address
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  serviceAreaOk: boolean | null; // null = not checked yet

  // Step 3 – Schedule
  selectedDate: string; // YYYY-MM-DD
  scheduledStart: string | null; // ISO

  // Step 4 – Details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  couponCode: string;
  giftCardCode: string;

  // Live quote
  quote: QuoteResponse | null;
  quoteLoading: boolean;
  quoteError: string | null;
};

export type BookingWizardProps = {
  slug: string;
  business: WidgetBusiness;
  services: WidgetService[];
  payment?: StorefrontPayment | null;
  cancellationPolicy?: StorefrontCancellationPolicy | null;
  /**
   * Render for the compact modal context (BookingWidgetModal) instead of a
   * full page (book-now/[slug]): no duplicate business header (the modal
   * chrome already shows it), tighter spacing, and the price/continue bar
   * flows inline with the card instead of pinning to the viewport bottom —
   * a viewport-fixed bar would float outside the modal panel.
   */
  compact?: boolean;
};

export const INITIAL_STATE: BookingFormState = {
  serviceId: null,
  frequency: "ONE_TIME",
  rooms: 2,
  bathrooms: 1,
  sqft: 0,
  addOnIds: [],

  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  latitude: null,
  longitude: null,
  serviceAreaOk: null,

  selectedDate: "",
  scheduledStart: null,

  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  notes: "",
  couponCode: "",
  giftCardCode: "",

  quote: null,
  quoteLoading: false,
  quoteError: null,
};

export const STEPS = [
  { id: 1, key: "service", label: "Service" },
  { id: 2, key: "address", label: "Address" },
  { id: 3, key: "schedule", label: "Schedule" },
  { id: 4, key: "details", label: "Your details" },
  { id: 5, key: "review", label: "Confirm" },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];

export function formatMoney(cents: number, currency: string = getActiveCurrency()) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function frequencyLabel(f: Frequency) {
  switch (f) {
    case "WEEKLY":
      return "Weekly";
    case "BIWEEKLY":
      return "Every 2 weeks";
    case "MONTHLY":
      return "Monthly";
    default:
      return "One-time";
  }
}

/**
 * Renders this business's real cancellation policy — never a hardcoded
 * window. `null`/missing windowHours means the business hasn't configured
 * one, which cancellationPolicy.js on the backend treats as "free
 * cancellation any time"; this must say the same thing, since it's the
 * customer's only preview of what cancelling will actually cost them.
 */
export function cancellationPolicyLabel(
  policy: StorefrontCancellationPolicy | null | undefined
): string {
  if (!policy || policy.windowHours == null) {
    return "You can cancel or reschedule free of charge at any time from your customer portal.";
  }
  const hours = policy.windowHours;
  const window =
    hours % 24 === 0 && hours >= 24
      ? `${hours / 24} day${hours === 24 ? "" : "s"}`
      : `${hours} hour${hours === 1 ? "" : "s"}`;
  const feeText =
    policy.feeType === "PERCENT"
      ? `a ${policy.feeValue ?? 0}% fee`
      : policy.feeType === "AMOUNT" && policy.feeValue != null
        ? `a ${formatMoney(policy.feeValue)} fee`
        : "a cancellation fee";
  return `You can cancel or reschedule free of charge up to ${window} before the appointment. Cancelling later may incur ${feeText}.`;
}
