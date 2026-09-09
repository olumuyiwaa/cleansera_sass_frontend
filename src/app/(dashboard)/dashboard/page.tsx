"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import { listCleaners } from "@/app/api/cleaners.api";
import { listBookings } from "@/app/api/bookings.api";
import { getSubscription } from "@/app/api/subscriptions.api";
import { Booking, Cleaner, formatMoney } from "@/app/api/cleansera-types";
import { useAuth } from "@/app/auth/useAuth";
import { getUserDisplayName } from "@/app/api/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subStatus, setSubStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, b, s] = await Promise.all([
        listCleaners("ACTIVE"),
        listBookings(),
        getSubscription().catch(() => null),
      ]);
      setCleaners(c);
      setBookings(b);
      setSubStatus(s?.status || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upcoming = bookings.filter((b) => ["REQUESTED", "CONFIRMED", "ASSIGNED"].includes(b.status));
  const needsAttention = bookings.filter((b) => b.status === "REQUESTED").length;
  const completedRevenue = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.quotedPriceCents, 0);

  const stats = [
    { label: "Active Cleaners", value: cleaners.length, href: "/cleaners" },
    { label: "Upcoming Bookings", value: upcoming.length, href: "/bookings" },
    { label: "Needs Confirmation", value: needsAttention, href: "/bookings" },
    { label: "Logged Revenue (completed)", value: formatMoney(completedRevenue), href: "/reports" },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Welcome back{user ? `, ${getUserDisplayName(user)}` : ""}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {user?.business?.name ? `Here's what's happening at ${user.business.name}.` : "Here's what's happening."}
        </p>
      </div>

      {subStatus === "PAST_DUE" && (
        <div className="mb-6 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          Your CleanSera subscription payment is past due.{" "}
          <Link href="/subscription" className="underline font-medium">Update billing</Link>
        </div>
      )}
      {!subStatus && !loading && (
        <div className="mb-6 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-400">
          You don&apos;t have an active CleanSera subscription yet.{" "}
          <Link href="/subscription" className="underline font-medium">Choose a plan</Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-gray-200 bg-white p-5 transition hover:shadow-md dark:border-gray-800 dark:bg-white/[0.02]"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {loading ? "…" : s.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.02]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Upcoming bookings
          </h2>
          <Link href="/bookings" className="text-sm font-medium text-brand-500 hover:text-brand-600">View all</Link>
        </div>
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-gray-500">Nothing scheduled — new widget bookings will show up here.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 6).map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-gray-800">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {b.customer ? `${b.customer.firstName} ${b.customer.lastName}` : "—"} — {b.service?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(b.scheduledStart).toLocaleString()}
                  </p>
                </div>
                <Badge size="sm" color={b.status === "REQUESTED" ? "warning" : "info"}>{b.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
