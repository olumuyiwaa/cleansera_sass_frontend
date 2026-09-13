"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getOnboardingStatus, OnboardingStatus, OnboardingStepKey } from "@/app/api/businesses.api";

// Where each onboarding step is actually completed in the dashboard.
const STEP_LINKS: Record<OnboardingStepKey, { href: string; cta: string }> = {
  stripeConnect: { href: "/business-settings", cta: "Connect Stripe" },
  services: { href: "/services", cta: "Add a service" },
  hours: { href: "/business-settings", cta: "Set business hours" },
  serviceAreas: { href: "/business-settings", cta: "Add a service area" },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const s = await getOnboardingStatus();
      setStatus(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load setup status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading…</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Finish setting up CleanSera
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Complete these steps before your booking widget can start accepting real customers.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      {status && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02]">
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {status.steps.map((step, i) => (
              <li key={step.key} className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      step.complete
                        ? "bg-success-100 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                        : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"
                    }`}
                  >
                    {step.complete ? "✓" : i + 1}
                  </span>
                  <span
                    className={`text-sm ${
                      step.complete
                        ? "text-gray-400 line-through dark:text-gray-600"
                        : "font-medium text-gray-800 dark:text-white/90"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {!step.complete && (
                  <Link
                    href={STEP_LINKS[step.key].href}
                    className="shrink-0 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
                  >
                    {STEP_LINKS[step.key].cta}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={load}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Refresh status
            </button>
            <button
              type="button"
              disabled={!status.isComplete}
              onClick={() => router.push("/dashboard")}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-brand-600"
            >
              {status.isComplete ? "Go to dashboard" : "Complete the steps above to continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
