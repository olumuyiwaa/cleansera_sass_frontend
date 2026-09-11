// Types matching cleansera_sass's Prisma schema and API response shapes.
// Kept separate from the original template's types.ts (still used by the
// generic messages/calendar/notifications/support-tickets pages) to avoid
// touching working code those pages depend on.

export type CleanerStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "OFFBOARDED";

export type Cleaner = {
    id: string;
    businessId: string;
    userId: string;
    status: CleanerStatus;
    hireDate: string | null;
    offboardedAt: string | null;
    offboardedReason: string | null;
    createdAt: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
    };
};

export type AvailabilitySlot = {
    dayOfWeek: number; // 0=Sun..6=Sat
    startTime: string; // "HH:MM"
    endTime: string;
};

export type PricingModel = "FLAT" | "PER_SQFT" | "PER_ROOM" | "HOURLY";

export type ServiceAddOn = {
    id: string;
    name: string;
    priceCents: number;
    extraMinutes: number;
};

export type Service = {
    id: string;
    businessId: string;
    name: string;
    description: string | null;
    pricingModel: PricingModel;
    basePriceCents: number;
    estimatedMinutes: number;
    isActive: boolean;
    addOns: ServiceAddOn[];
};

export type Customer = {
    id: string;
    businessId: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string;
    notes: string | null;
    addresses?: CustomerAddress[];
};

export type CustomerAddress = {
    id: string;
    customerId: string;
    label: string | null;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    latitude: number | null;
    longitude: number | null;
    isPrimary: boolean;
};

export type BookingStatus =
    | "REQUESTED"
    | "CONFIRMED"
    | "ASSIGNED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";

export type BookingAssignment = {
    id: string;
    bookingId: string;
    cleanerId: string;
    assignedAt: string;
    checkedInAt: string | null;
    checkedOutAt: string | null;
    cleaner?: Cleaner;
};

export type Booking = {
    id: string;
    businessId: string;
    customerId: string;
    serviceId: string;
    recurringScheduleId: string | null;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    latitude: number | null;
    longitude: number | null;
    scheduledStart: string;
    scheduledEnd: string;
    status: BookingStatus;
    quotedPriceCents: number;
    paymentStatus: "UNPAID" | "PAID" | "PARTIAL" | "REFUNDED";
    paymentNote: string | null;
    cancelReason: string | null;
    createdAt: string;
    customer?: Customer;
    service?: Service;
    assignments?: BookingAssignment[];
};

export type RecurrenceFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY";

export type RecurringSchedule = {
    id: string;
    businessId: string;
    customerId: string;
    serviceId: string;
    customerAddressId: string | null;
    frequency: RecurrenceFrequency;
    dayOfWeek: number;
    startTime: string;
    isActive: boolean;
    nextRunDate: string;
    customer?: Customer;
    service?: Service;
};

export type SubscriptionStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED";

export type SubscriptionPlan = {
    id: string;
    name: string;
    maxCleaners: number | null;
    monthlyPriceCents: number;
    features: Record<string, unknown> | null;
    isActive: boolean;
};

export type BusinessSubscription = {
    id: string;
    businessId: string;
    planId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string | null;
    status: SubscriptionStatus;
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
    canceledAt: string | null;
    plan: SubscriptionPlan;
};

export type BusinessMemberRole = "BUSINESS_OWNER" | "BUSINESS_MANAGER";

export type Business = {
    id: string;
    name: string;
    subdomain: string;
    customDomain: string | null;
    timezone: string;
    isActive: boolean;
    branding?: {
        logoKey: string | null;
        primaryColor: string | null;
        accentColor: string | null;
        tagline: string | null;
    } | null;
};

export function formatMoney(cents: number, currency = "USD") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function cleanerDisplayName(c: Cleaner) {
    return `${c.user.firstName} ${c.user.lastName}`.trim();
}
