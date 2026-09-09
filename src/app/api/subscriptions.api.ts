import { authFetch } from "./authFetch";
import { BusinessSubscription, SubscriptionPlan } from "./cleansera-types";

export async function listPlans() {
    const result = await authFetch(`/subscriptions/plans`, { method: "GET" });
    return result.data as SubscriptionPlan[];
}

export async function getSubscription() {
    const result = await authFetch(`/subscriptions`, { method: "GET" });
    return result.data as BusinessSubscription | null;
}

export async function createSubscription(payload: { planId: string; billingEmail?: string; billingPhone?: string }) {
    const result = await authFetch(`/subscriptions`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    return result.data as BusinessSubscription;
}

export async function updateSubscription(patch: { planId?: string }) {
    const result = await authFetch(`/subscriptions`, {
        method: "PUT",
        body: JSON.stringify(patch),
    });
    return result.data as BusinessSubscription;
}

export async function cancelSubscription() {
    await authFetch(`/subscriptions/cancel`, { method: "POST" });
}
