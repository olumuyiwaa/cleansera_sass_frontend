"use client";

import { useEffect, useState, useCallback } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { listPlans, getSubscription, createSubscription, cancelSubscription } from "@/app/api/subscriptions.api";
import { BusinessSubscription, SubscriptionPlan } from "@/app/api/cleansera-types";

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "light"> = {
  TRIALING: "warning",
  ACTIVE: "success",
  PAST_DUE: "error",
  CANCELED: "light",
};

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<BusinessSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [p, s] = await Promise.all([listPlans(), getSubscription().catch(() => null)]);
      setPlans(p);
      setSubscription(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subscription info");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubscribe = async (planId: string) => {
    setBusy(planId);
    setError("");
    try {
      await createSubscription({ planId });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start subscription");
    } finally {
      setBusy(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel your CleanSera subscription? This only affects your CleanSera billing — customer payments for jobs are unaffected.")) return;
    setBusy("cancel");
    setError("");
    try {
      await cancelSubscription();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel subscription");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Subscription</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This is your business&apos;s CleanSera billing only — job payments from your customers happen outside the platform.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : subscription ? (
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.02]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current plan</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white/90">{subscription.plan.name}</p>
            </div>
            <Badge color={STATUS_COLOR[subscription.status] || "light"}>{subscription.status}</Badge>
          </div>
          {subscription.trialEndsAt && subscription.status === "TRIALING" && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Trial ends {new Date(subscription.trialEndsAt).toLocaleDateString()}
            </p>
          )}
          {subscription.currentPeriodEnd && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
          {subscription.status !== "CANCELED" && (
            <div className="mt-4">
              <Button variant="outline" onClick={handleCancel} disabled={busy === "cancel"}>
                {busy === "cancel" ? "Cancelling…" : "Cancel Subscription"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8 rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">No active subscription yet — pick a plan below to get started.</p>
        </div>
      )}

      {(!subscription || subscription.status === "CANCELED") && (
        <>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Available Plans
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.id} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.02]">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{plan.name}</h3>
                <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                  {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(plan.monthlyPriceCents / 100)}
                  <span className="text-sm font-normal text-gray-500"> /mo</span>
                </p>
                {plan.maxCleaners && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Up to {plan.maxCleaners} cleaners</p>
                )}
                <Button className="mt-4 w-full" onClick={() => handleSubscribe(plan.id)} disabled={busy === plan.id}>
                  {busy === plan.id ? "Starting…" : "Choose Plan"}
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
