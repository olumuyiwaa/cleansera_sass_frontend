"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import { listCleaners } from "@/app/api/cleaners.api";
import { listBookings } from "@/app/api/bookings.api";
import { getSubscription } from "@/app/api/subscriptions.api";
import { getReportKPIs, type ReportKPIs } from "@/app/api/reports.api";
import { Booking, Cleaner, formatMoney } from "@/app/api/cleansera-types";
import { useAuth } from "@/app/auth/useAuth";

function displayName(user: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
} | null | undefined) {
  if (!user) return "";
  const n = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return n || user.email || "";
}

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function isSameDay(iso: string, day: Date) {
  const t = new Date(iso).getTime();
  return t >= startOfDay(day).getTime() && t <= endOfDay(day).getTime();
}

function statusBadgeColor(
    status: string
): "success" | "warning" | "error" | "info" | "light" {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "REQUESTED":
      return "warning";
    case "CANCELLED":
      return "error";
    case "IN_PROGRESS":
    case "ASSIGNED":
    case "CONFIRMED":
      return "info";
    default:
      return "light";
  }
}

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

const QUICK_ACTIONS = [
  { href: "/bookings", label: "Bookings", hint: "Create & manage jobs" },
  { href: "/dispatch", label: "Dispatch", hint: "Assign cleaners" },
  { href: "/cleaners", label: "Cleaners", hint: "Team roster" },
  { href: "/customers", label: "Customers", hint: "CRM" },
  { href: "/calendar", label: "Calendar", hint: "Schedule view" },
  { href: "/messages", label: "Messages", hint: "Team threads" },
  { href: "/reports", label: "Reports", hint: "KPIs & revenue" },
  { href: "/business-settings", label: "Settings", hint: "Brand & areas" },
] as const;

export default function DashboardPage() {
  const { user } = useAuth();
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subStatus, setSubStatus] = useState<string | null>(null);
  const [kpis, setKpis] = useState<ReportKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const now = new Date();
      const from = new Date(now);
      from.setDate(from.getDate() - 30);

      const [c, b, s, k] = await Promise.all([
        listCleaners("ACTIVE").catch(() => [] as Cleaner[]),
        listBookings().catch(() => [] as Booking[]),
        getSubscription().catch(() => null),
        getReportKPIs(from.toISOString(), now.toISOString()).catch(() => null),
      ]);
      setCleaners(Array.isArray(c) ? c : []);
      setBookings(Array.isArray(b) ? b : []);
      setSubStatus(s?.status ?? null);
      setKpis(k);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const today = useMemo(() => new Date(), []);
  const todayJobs = useMemo(
      () =>
          bookings
              .filter(
                  (b) =>
                      isSameDay(b.scheduledStart, today) &&
                      !["CANCELLED"].includes(b.status)
              )
              .sort(
                  (a, b) =>
                      new Date(a.scheduledStart).getTime() -
                      new Date(b.scheduledStart).getTime()
              ),
      [bookings, today]
  );

  const upcoming = useMemo(
      () =>
          bookings
              .filter((b) =>
                  ["REQUESTED", "CONFIRMED", "ASSIGNED", "IN_PROGRESS"].includes(b.status)
              )
              .filter((b) => new Date(b.scheduledStart).getTime() >= startOfDay(today).getTime())
              .sort(
                  (a, b) =>
                      new Date(a.scheduledStart).getTime() -
                      new Date(b.scheduledStart).getTime()
              ),
      [bookings, today]
  );

  const needsAttention = useMemo(
      () => bookings.filter((b) => b.status === "REQUESTED").length,
      [bookings]
  );

  const unassignedUpcoming = useMemo(
      () =>
          upcoming.filter(
              (b) =>
                  ["REQUESTED", "CONFIRMED"].includes(b.status) &&
                  (!b.assignments || b.assignments.length === 0)
          ).length,
      [upcoming]
  );

  const completedRevenue = useMemo(
      () =>
          bookings
              .filter((b) => b.status === "COMPLETED")
              .reduce((sum, b) => sum + (b.quotedPriceCents || 0), 0),
      [bookings]
  );

  const stats = [
    {
      label: "Active cleaners",
      value: loading ? "…" : String(cleaners.length),
      sub: kpis ? `${kpis.activeCleaners} in last 30d KPIs` : undefined,
      href: "/cleaners",
      accent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    },
    {
      label: "Today’s jobs",
      value: loading ? "…" : String(todayJobs.length),
      sub: needsAttention ? `${needsAttention} need confirmation` : "On the schedule",
      href: "/bookings",
      accent: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    },
    {
      label: "Needs attention",
      value: loading ? "…" : String(needsAttention + unassignedUpcoming),
      sub:
          unassignedUpcoming > 0
              ? `${unassignedUpcoming} unassigned · ${needsAttention} requested`
              : needsAttention
                  ? "Awaiting confirmation"
                  : "All clear",
      href: "/dispatch",
      accent:
          needsAttention || unassignedUpcoming
              ? "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
              : "bg-gray-50 text-gray-700 dark:bg-white/[0.04] dark:text-gray-300",
    },
    {
      label: "Revenue (completed)",
      value: loading ? "…" : formatMoney(kpis?.revenueCents ?? completedRevenue),
      sub: kpis
          ? `30d · avg ticket ${formatMoney(kpis.avgTicketCents)}`
          : "From completed bookings in list",
      href: "/reports",
      accent: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
    },
  ];

  const greeting = displayName(user);

  return (
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-800 dark:text-white/90 md:text-2xl">
              {greeting ? `Welcome back, ${greeting.split(" ")[0]}` : "Dashboard"}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {user?.business?.name
                  ? `Operations snapshot for ${user.business.name}`
                  : "Here’s what’s happening across your cleaning business."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
                href="/bookings"
                className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              + New booking
            </Link>
            <Link
                href="/dispatch"
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.04]"
            >
              Open dispatch
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
              {error}
              <button type="button" onClick={load} className="ml-2 font-medium underline">
                Retry
              </button>
            </div>
        )}
        {subStatus === "PAST_DUE" && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
              Your CleanSera subscription payment is past due.{" "}
              <Link href="/subscription" className="font-medium underline">
                Update billing
              </Link>
            </div>
        )}
        {subStatus === "TRIALING" && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
              You’re on a trial plan.{" "}
              <Link href="/subscription" className="font-medium underline">
                View subscription
              </Link>
            </div>
        )}
        {!subStatus && !loading && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              No active CleanSera subscription yet.{" "}
              <Link href="/subscription" className="font-medium underline">
                Choose a plan
              </Link>
            </div>
        )}

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
              <Link
                  key={s.label}
                  href={s.href}
                  className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-white/[0.02] dark:hover:border-brand-500/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{s.label}</p>
                  <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${s.accent}`}
                  >
                Live
              </span>
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white/90">
                  {s.value}
                </p>
                {s.sub && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600">
                      {s.sub}
                    </p>
                )}
              </Link>
          ))}
        </div>

        {/* 30d KPI strip when reports work */}
        {kpis && !loading && (
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-4 dark:border-gray-800 dark:bg-white/[0.02]">
              <MiniStat label="Completion rate" value={`${Math.round(kpis.completionRate * 100)}%`} />
              <MiniStat label="Cancel rate" value={`${Math.round(kpis.cancelRate * 100)}%`} />
              <MiniStat label="Collected" value={formatMoney(kpis.collectedCents)} />
              <MiniStat label="Utilization" value={`${Math.round(kpis.utilizationPct)}%`} />
            </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today + upcoming */}
          <div className="space-y-6 lg:col-span-2">
            <Panel
                title="Today’s schedule"
                action={{ href: "/calendar", label: "Calendar" }}
            >
              {loading ? (
                  <SkeletonRows n={3} />
              ) : todayJobs.length === 0 ? (
                  <Empty>No jobs scheduled for today.</Empty>
              ) : (
                  <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    {todayJobs.slice(0, 8).map((b) => (
                        <BookingRow key={b.id} booking={b} />
                    ))}
                  </ul>
              )}
            </Panel>

            <Panel
                title="Upcoming"
                action={{ href: "/bookings", label: "View all" }}
            >
              {loading ? (
                  <SkeletonRows n={4} />
              ) : upcoming.length === 0 ? (
                  <Empty>
                    Nothing upcoming — widget bookings and manual jobs will appear here.
                  </Empty>
              ) : (
                  <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    {upcoming.slice(0, 8).map((b) => (
                        <BookingRow key={b.id} booking={b} />
                    ))}
                  </ul>
              )}
            </Panel>
          </div>

          {/* Quick actions + team */}
          <div className="space-y-6">
            <Panel title="Quick actions">
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map((a) => (
                    <Link
                        key={a.href}
                        href={a.href}
                        className="rounded-xl border border-gray-200 px-3 py-3 transition hover:border-brand-300 hover:bg-brand-50/50 dark:border-gray-800 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5"
                    >
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">{a.label}</p>
                      <p className="mt-0.5 text-[11px] text-gray-500">{a.hint}</p>
                    </Link>
                ))}
              </div>
            </Panel>

            <Panel
                title="Active team"
                action={{ href: "/cleaners", label: "Manage" }}
            >
              {loading ? (
                  <SkeletonRows n={3} />
              ) : cleaners.length === 0 ? (
                  <Empty>
                    No active cleaners.{" "}
                    <Link href="/cleaners" className="font-medium text-brand-600 underline">
                      Onboard your first
                    </Link>
                  </Empty>
              ) : (
                  <ul className="space-y-2">
                    {cleaners.slice(0, 6).map((c) => (
                        <li
                            key={c.id}
                            className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                              {c.user
                                  ? `${c.user.firstName} ${c.user.lastName}`.trim()
                                  : "Cleaner"}
                            </p>
                            <p className="truncate text-xs text-gray-500">{c.user?.email}</p>
                          </div>
                          <Badge size="sm" color="success">
                            {c.status}
                          </Badge>
                        </li>
                    ))}
                    {cleaners.length > 6 && (
                        <p className="text-xs text-gray-500">+{cleaners.length - 6} more</p>
                    )}
                  </ul>
              )}
            </Panel>
          </div>
        </div>
      </div>
  );
}

function Panel({
                 title,
                 action,
                 children,
               }: {
  title: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.02]">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {title}
          </h2>
          {action && (
              <Link
                  href={action.href}
                  className="text-sm font-medium text-brand-500 hover:text-brand-600"
              >
                {action.label}
              </Link>
          )}
        </div>
        {children}
      </section>
  );
}

function BookingRow({ booking: b }: { booking: Booking }) {
  const customer = b.customer
      ? `${b.customer.firstName} ${b.customer.lastName}`.trim()
      : "—";
  const cleaner =
      b.assignments?.[0]?.cleaner?.user
          ? `${b.assignments[0].cleaner.user.firstName} ${b.assignments[0].cleaner.user.lastName}`.trim()
          : null;

  return (
      <li className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
            {customer}
            <span className="font-normal text-gray-500"> · {b.service?.name || "Service"}</span>
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {formatWhen(b.scheduledStart)}
            {cleaner ? ` · ${cleaner}` : " · Unassigned"}
          </p>
          {(b.addressLine1 || b.city) && (
              <p className="mt-0.5 truncate text-xs text-gray-400">
                {[b.addressLine1, b.city].filter(Boolean).join(", ")}
              </p>
          )}
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          <Badge size="sm" color={statusBadgeColor(b.status)}>
            {b.status}
          </Badge>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {formatMoney(b.quotedPriceCents || 0)}
        </span>
        </div>
      </li>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
      <div className="px-1">
        <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
        <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90">{value}</p>
      </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-500 dark:text-gray-400">{children}</p>;
}

function SkeletonRows({ n }: { n: number }) {
  return (
      <div className="space-y-3">
        {Array.from({ length: n }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100 dark:bg-white/[0.04]" />
        ))}
      </div>
  );
}