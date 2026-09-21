"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getSubscriptionAccess } from "@/app/api/subscriptions.api";

/**
 * Account-level status strip shown above every dashboard page.
 *
 * The API now enforces subscriptions: a business whose trial ended or whose
 * subscription lapsed is read-only (writes return 402 SUBSCRIPTION_REQUIRED),
 * and a business suspended by CleanSera gets 403 BUSINESS_SUSPENDED. Without
 * this, the user would just see unexplained "Request failed" errors.
 */
type Banner = { tone: "red" | "amber"; text: string; cta?: boolean } | null;

const DAY_MS = 24 * 60 * 60 * 1000;
const daysUntil = (iso?: string | null) => (iso ? Math.ceil((new Date(iso).getTime() - Date.now()) / DAY_MS) : null);

export function SubscriptionBanner() {
  const pathname = usePathname();
  const [banner, setBanner] = useState<Banner>(null);

  useEffect(() => {
    let cancelled = false;

    getSubscriptionAccess()
      .then((a) => {
        if (cancelled || !a.enforced) return;
        if (!a.allowed) {
          setBanner({
            tone: "red",
            cta: true,
            text:
              a.state === "TRIAL_EXPIRED"
                ? "Your free trial has ended. Your data is read-only until you choose a plan."
                : "Your subscription is not active. Your data is read-only until you subscribe or update your payment method.",
          });
          return;
        }
        if (a.state === "PAST_DUE") {
          const left = daysUntil(a.graceEndsAt);
          setBanner({
            tone: "amber",
            cta: true,
            text: `Your last payment failed. Update your payment method${left != null && left > 0 ? ` within ${left} day${left === 1 ? "" : "s"}` : ""} to avoid losing access.`,
          });
          return;
        }
        if (a.state === "PLATFORM_TRIAL" || a.state === "TRIALING") {
          const left = daysUntil(a.trialEndsAt);
          if (left != null && left <= 5) {
            setBanner({
              tone: "amber",
              cta: true,
              text: left <= 0 ? "Your trial ends today." : `Your trial ends in ${left} day${left === 1 ? "" : "s"}. Choose a plan to keep creating bookings.`,
            });
          }
        }
      })
      .catch(() => {
        /* the banner is informational; never block the page on it */
      });

    const onRequired = () =>
      setBanner({ tone: "red", cta: true, text: "Your subscription is not active, so this change was not saved. Your data is read-only until you subscribe." });
    const onSuspended = () =>
      setBanner({ tone: "red", text: "This business account is suspended. Please contact CleanSera support." });

    window.addEventListener("cleansera:subscription-required", onRequired);
    window.addEventListener("cleansera:business-suspended", onSuspended);
    return () => {
      cancelled = true;
      window.removeEventListener("cleansera:subscription-required", onRequired);
      window.removeEventListener("cleansera:business-suspended", onSuspended);
    };
  }, []);

  if (!banner) return null;

  const onBillingPage = pathname?.startsWith("/subscription");
  const colors =
    banner.tone === "red"
      ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
      : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200";

  return (
    <div role="alert" className={`mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm ${colors}`}>
      <span>{banner.text}</span>
      {banner.cta && !onBillingPage && (
        <Link href="/subscription" className="font-semibold underline">
          Manage subscription
        </Link>
      )}
    </div>
  );
}
