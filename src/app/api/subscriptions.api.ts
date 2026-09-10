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
}): Promise<BusinessSubscription> {
  const result = await authFetch(`/subscriptions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return result.data as BusinessSubscription;
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
