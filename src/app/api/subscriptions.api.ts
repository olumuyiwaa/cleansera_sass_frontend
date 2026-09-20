import { authFetch } from "./authFetch";
import { BusinessSubscription, SubscriptionPlan } from "./cleansera-types";

export async function listPlans(): Promise<SubscriptionPlan[]> {
  const result = await authFetch(`/subscriptions/plans`, { method: "GET" });
  return (result.data ?? []) as SubscriptionPlan[];
}

export async function getSubscription(): Promise<BusinessSubscription | null> {
  const result = await authFetch(`/subscriptions`, { method: "GET" });
  return (result.data ?? null) as BusinessSubscription | null;
}

export async function createSubscription(payload: {
  planId: string;
  billingEmail?: string;
  billingPhone?: string;
}): Promise<{ checkoutUrl: string; sessionId: string }> {
  // The backend no longer creates the subscription here: it returns a Stripe
  // Checkout URL, where the business enters a payment method, and the
  // subscription is created when Stripe confirms it.
  const result = await authFetch(`/subscriptions`, {
    method: "POST",
    body: JSON.stringify({ planId: payload.planId }),
  });
  return result.data as { checkoutUrl: string; sessionId: string };
}

/** Stripe-hosted page to update the card/SEPA mandate and download invoices. */
export async function openBillingPortal(): Promise<{ url: string }> {
  const result = await authFetch(`/subscriptions/portal`, { method: "POST" });
  return result.data as { url: string };
}

export async function updateSubscription(patch: {
  planId?: string;
}): Promise<BusinessSubscription> {
  const result = await authFetch(`/subscriptions`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
  return result.data as BusinessSubscription;
}

export async function cancelSubscription(): Promise<BusinessSubscription | null> {
  const result = await authFetch(`/subscriptions/cancel`, { method: "POST" });
  return (result.data ?? null) as BusinessSubscription | null;
}
