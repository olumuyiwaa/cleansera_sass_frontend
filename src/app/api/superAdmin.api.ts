import { authFetch } from "./authFetch";

const BASE = "/super-admin";

async function getJson<T>(path: string): Promise<T> {
  const res = await authFetch(`${BASE}${path}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Request failed");
  return json.data as T;
}

async function patchJson<T>(path: string, body: unknown): Promise<T> {
  const res = await authFetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Request failed");
  return json.data as T;
}

export type PlatformOverview = {
  kpis: {
    totalBusinesses: number;
    activeBusinesses: number;
    inactiveBusinesses: number;
    totalUsers: number;
    totalCleaners: number;
    totalCustomers: number;
    totalBookings: number;
    openTickets: number;
    mrrCents: number;
    mrrFormatted: string;
  };
  subscriptionBreakdown: Record<string, number>;
  recentBusinesses: Array<{
    id: string;
    name: string;
    subdomain: string;
    isActive: boolean;
    createdAt: string;
    stripeConnectOnboarded: boolean;
    subscription?: {
      status: string;
      plan?: { name: string; monthlyPriceCents: number };
    } | null;
    _count: { cleaners: number; customers: number; bookings: number };
  }>;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type BusinessListItem = {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string | null;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  stripeConnectOnboarded: boolean;
  stripeChargesEnabled: boolean;
  parentBusinessId?: string | null;
  subscription?: {
    id: string;
    status: string;
    trialEndsAt?: string | null;
    currentPeriodEnd?: string | null;
    plan?: {
      id: string;
      name: string;
      monthlyPriceCents: number;
      maxCleaners?: number | null;
    };
  } | null;
  _count: {
    cleaners: number;
    customers: number;
    bookings: number;
    members: number;
  };
};

export type UserListItem = {
  id: string;
  email: string;
  phone?: string | null;
  firstName: string;
  lastName: string;
  globalRole: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  businessMemberships: Array<{
    role: string;
    business: { id: string; name: string; subdomain: string };
  }>;
  cleanerProfiles: Array<{
    id: string;
    status: string;
    business: { id: string; name: string };
  }>;
};

export type TicketListItem = {
  id: string;
  subject: string;
  status: string;
  priority?: string;
  createdAt: string;
  business?: { id: string; name: string; subdomain: string } | null;
};

export type SubscriptionListItem = {
  id: string;
  status: string;
  trialEndsAt?: string | null;
  currentPeriodEnd?: string | null;
  createdAt: string;
  plan: {
    id: string;
    name: string;
    monthlyPriceCents: number;
  };
  business: {
    id: string;
    name: string;
    subdomain: string;
    isActive: boolean;
  };
};

export function getOverview() {
  return getJson<PlatformOverview>("/overview");
}

export function listBusinesses(params?: {
  q?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) {
  const sp = new URLSearchParams();
  if (params?.q) sp.set("q", params.q);
  if (typeof params?.isActive === "boolean")
    sp.set("isActive", String(params.isActive));
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  const qs = sp.toString();
  return getJson<{ items: BusinessListItem[]; pagination: Pagination }>(
    `/businesses${qs ? `?${qs}` : ""}`
  );
}

export function getBusiness(id: string) {
  return getJson<BusinessListItem & Record<string, unknown>>(
    `/businesses/${id}`
  );
}

export function setBusinessActive(id: string, isActive: boolean) {
  return patchJson<BusinessListItem>(`/businesses/${id}/active`, { isActive });
}

export function listSubscriptions(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const sp = new URLSearchParams();
  if (params?.status) sp.set("status", params.status);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  const qs = sp.toString();
  return getJson<{ items: SubscriptionListItem[]; pagination: Pagination }>(
    `/subscriptions${qs ? `?${qs}` : ""}`
  );
}

export function listPlans() {
  return getJson<
    Array<{
      id: string;
      name: string;
      monthlyPriceCents: number;
      maxCleaners?: number | null;
      isActive: boolean;
      _count: { subscriptions: number };
    }>
  >("/plans");
}

export function listUsers(params?: {
  q?: string;
  globalRole?: string;
  page?: number;
  limit?: number;
}) {
  const sp = new URLSearchParams();
  if (params?.q) sp.set("q", params.q);
  if (params?.globalRole) sp.set("globalRole", params.globalRole);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  const qs = sp.toString();
  return getJson<{ items: UserListItem[]; pagination: Pagination }>(
    `/users${qs ? `?${qs}` : ""}`
  );
}

export function setUserActive(id: string, isActive: boolean) {
  return patchJson<UserListItem>(`/users/${id}/active`, { isActive });
}

export function listTickets(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const sp = new URLSearchParams();
  if (params?.status) sp.set("status", params.status);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  const qs = sp.toString();
  return getJson<{ items: TicketListItem[]; pagination: Pagination }>(
    `/tickets${qs ? `?${qs}` : ""}`
  );
}

export function updateTicketStatus(id: string, status: string) {
  return patchJson<TicketListItem>(`/tickets/${id}/status`, { status });
}
