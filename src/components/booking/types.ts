import type { WidgetService, WidgetBusiness, QuoteResponse } from "@/app/api/widget.api";

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

  // Live quote
  quote: QuoteResponse | null;
  quoteLoading: boolean;
  quoteError: string | null;
};

export type BookingWizardProps = {
  slug: string;
  business: WidgetBusiness;
  services: WidgetService[];
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

export function formatMoney(cents: number, currency = "USD") {
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
