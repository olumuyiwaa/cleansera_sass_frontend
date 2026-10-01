"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import {
  listPlans,
  getSubscription,
  createSubscription,
  cancelSubscription,
  openBillingPortal,
} from "@/app/api/subscriptions.api";
import {
  BusinessSubscription,
  SubscriptionPlan,
  formatMoney,
} from "@/app/api/cleansera-types";

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "light"> = {
  TRIALING: "warning",
  ACTIVE: "success",
  PAST_DUE: "error",
  CANCELED: "light",
};

export default function SubscriptionPage() {
  const t = useTranslations("Dashboard.subscription");
  const tc = useTranslations("Dashboard.common");
  const locale = useLocale();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<BusinessSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [p, s] = await Promise.all([
        listPlans(),
        getSubscription().catch(() => null),
      ]);
      setPlans(Array.isArray(p) ? p : []);
      setSubscription(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubscribe = async (planId: string) => {
    setBusy(planId);
    setError("");
    try {
      const { checkoutUrl } = await createSubscription({ planId });
      // Hand over to Stripe Checkout; it returns here with ?checkout=success.
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : t("startFailed"));
      setBusy(null);
    }
  };

  const handleManageBilling = async () => {
    setBusy("portal");
    setError("");
    try {
      const { url } = await openBillingPortal();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : t("billingPortalFailed"));
      setBusy(null);
    }
  };

  // Back from Stripe Checkout. The subscription row is written by Stripe's
  // webhook, which can land a few seconds after the redirect, so poll briefly.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") !== "success") return;
    setNotice(t("activatingPlan"));
    let tries = 0;
    const timer = window.setInterval(async () => {
      tries += 1;
      await load();
      if (tries >= 6) window.clearInterval(timer);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [load, t]);

  const handleCancel = async () => {
    if (
        !confirm(t("cancelConfirm"))
    ) {
      return;
    }
    setBusy("cancel");
    setError("");
    try {
      await cancelSubscription();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("cancelFailed"));
    } finally {
      setBusy(null);
    }
  };

  const showPlans = !subscription || subscription.status === "CANCELED";

  return (
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">{t("title")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("billingScopeHint")}
          </p>
        </div>

        {notice && subscription?.status !== "ACTIVE" && subscription?.status !== "TRIALING" && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
              {notice}
            </div>
        )}

        {error && (
            <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
              {error}
            </div>
        )}

        {loading ? (
            <p className="text-sm text-gray-500">{tc("loading")}</p>
        ) : subscription ? (
            <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.02]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("currentPlan")}</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    {subscription.plan?.name ?? t("unknownPlan")}
                  </p>
                </div>
                <Badge color={STATUS_COLOR[subscription.status] || "light"}>
                  {t(`statuses.${subscription.status}`)}
                </Badge>
              </div>
              {subscription.trialEndsAt && subscription.status === "TRIALING" && (
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    {t("trialEnds", { date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(subscription.trialEndsAt)) })}
                  </p>
              )}
              {subscription.currentPeriodEnd && subscription.status !== "CANCELED" && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t("renews", { date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(subscription.currentPeriodEnd)) })}
                  </p>
              )}
              {subscription.plan?.maxCleaners != null && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t("upToCleaners", { count: subscription.plan.maxCleaners })}
                  </p>
              )}
              {subscription.status !== "CANCELED" && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button variant="outline" onClick={handleManageBilling} disabled={busy === "portal"}>
                      {busy === "portal" ? t("opening") : t("manageBilling")}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={busy === "cancel"}>
                      {busy === "cancel" ? t("cancelling") : t("cancelSubscription")}
                    </Button>
                  </div>
              )}
            </div>
        ) : (
            <div className="mb-8 rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("noActiveSubscription")}
              </p>
            </div>
        )}

        {showPlans && (
            <>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {t("availablePlans")}
              </h2>
              {plans.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    {t("noPlans")}
                  </p>
              ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.02]"
                        >
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            {plan.name}
                          </h3>
                          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                            {formatMoney(plan.monthlyPriceCents)}
                            <span className="text-sm font-normal text-gray-500"> {t("perMonth")}</span>
                          </p>
                          {plan.maxCleaners != null && (
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {t("upToCleaners", { count: plan.maxCleaners })}
                              </p>
                          )}
                          <Button
                              className="mt-4 w-full"
                              onClick={() => handleSubscribe(plan.id)}
                              disabled={busy === plan.id}
                          >
                            {busy === plan.id ? t("starting") : t("choosePlan")}
                          </Button>
                        </div>
                    ))}
                  </div>
              )}
            </>
        )}
      </div>
  );
}