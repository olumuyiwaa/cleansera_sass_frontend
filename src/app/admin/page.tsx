"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getOverview, PlatformOverview } from "@/app/api/superAdmin.api";
import { currencySymbol } from "@/app/services/currency";
import { EcommerceMetrics } from "@/components/overview/EcommerceMetrics";
import MonthlySalesChart from "@/components/overview/MonthlySalesChart";
import MonthlyTarget from "@/components/overview/MonthlyTarget";
import StatisticsChart from "@/components/overview/StatisticsChart";
import RevenueBarChart from "@/components/charts/RevenueBarChart";
function Kpi({
               label,
               value,
               hint,
             }: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
          {value}
        </p>
        {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
      </div>
  );
}
export default function SuperAdminDashboardPage() {
  const [data, setData] = useState<PlatformOverview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setData(await getOverview());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load overview");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const subscriptionChart = useMemo(() => {
    if (!data?.subscriptionBreakdown) return [];
    return Object.entries(data.subscriptionBreakdown).map(([status, count]) => ({
      label: status,
      value: count,
    }));
  }, [data]);

  const recentByMonth = useMemo(() => {
    if (!data?.recentBusinesses?.length) return [];
    const counts: Record<string, number> = {};
    for (const b of data.recentBusinesses) {
      const d = new Date(b.createdAt);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, n]) => ({
        month,
        grossRevenue: n, // reuse chart as "signups" count
      }));
  }, [data]);

  const activePct = useMemo(() => {
    if (!data?.kpis) return 0;
    const total = data.kpis.totalBusinesses || 0;
    if (!total) return 0;
    return Math.round((data.kpis.activeBusinesses / total) * 1000) / 10;
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-100 dark:bg-white/[0.06]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/[0.06]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const { kpis, recentBusinesses } = data;
  const sym = currencySymbol();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white md:text-2xl">
            Platform overview
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Cross-tenant health of CleanSera — businesses, subscriptions, and support load.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/businesses"
            className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Businesses
          </Link>
          <Link
            href="/admin/subscriptions"
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            Subscriptions
          </Link>
          <Link
            href="/admin/tickets"
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            Tickets
          </Link>
        </div>
      </div>

      {/* Metric cards — overview component */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Businesses" value={kpis.totalBusinesses} hint={`${kpis.activeBusinesses} active`} />
        <Kpi label="MRR" value={`${currencySymbol()}${kpis.mrrFormatted}`} hint="Active + trialing plans" />
        <Kpi label="Users" value={kpis.totalUsers} />
        <Kpi label="Open tickets" value={kpis.openTickets} />
        <Kpi label="Active cleaners" value={kpis.totalCleaners} />
        <Kpi label="Customers" value={kpis.totalCustomers} />
        <Kpi label="Bookings" value={kpis.totalBookings} />
        <Kpi label="Inactive businesses" value={kpis.inactiveBusinesses} />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <StatisticsChart
            title="Subscription mix"
            subtitle="Live counts from platform overview"
            categories={subscriptionChart.map((s) => s.label)}
            series={[
              {
                name: "Subscriptions",
                data: subscriptionChart.map((s) => s.value),
              },
            ]}
            viewMoreHref="/admin/subscriptions"
            height={280}
          />
        </div>

        <MonthlyTarget
          title="Active businesses"
          subtitle="Share of tenants currently active"
          progressPct={activePct}
          targetLabel="Active"
          targetValue={String(kpis.activeBusinesses)}
          revenueLabel="MRR"
          revenueValue={`${sym}${kpis.mrrFormatted}`}
          todayLabel="Tickets"
          todayValue={String(kpis.openTickets)}
          footerNote={`${kpis.inactiveBusinesses} inactive · ${kpis.totalBookings} bookings platform-wide`}
          viewMoreHref="/admin/businesses"
        />
      </div>

      {/* Recent businesses table */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Recent businesses
          </h2>
          <Link
            href="/admin/businesses"
            className="text-sm font-medium text-brand-500 hover:text-brand-600"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-500">
              <tr>
                <th className="pb-2 pr-3">Name</th>
                <th className="pb-2 pr-3">Subdomain</th>
                <th className="pb-2 pr-3">Plan</th>
                <th className="pb-2 pr-3">Status</th>
                <th className="pb-2 pr-3">Bookings</th>
                <th className="pb-2">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentBusinesses.map((b) => (
                <tr key={b.id}>
                  <td className="py-2.5 pr-3 font-medium text-gray-900 dark:text-white">
                    <Link
                      href={`/admin/businesses?highlight=${b.id}`}
                      className="hover:underline"
                    >
                      {b.name}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-3 text-gray-500">{b.subdomain}</td>
                  <td className="py-2.5 pr-3 text-gray-500">
                    {b.subscription?.plan?.name || "—"}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        b.isActive
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {b.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-gray-500">
                    {b._count?.bookings ?? "—"}
                  </td>
                  <td className="py-2.5 text-gray-500">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recentBusinesses.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No businesses yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/admin/businesses", label: "Businesses", hint: "Activate / suspend tenants" },
          { href: "/admin/subscriptions", label: "Subscriptions", hint: "Plans & billing status" },
          { href: "/admin/users", label: "Users", hint: "Global roles & access" },
          { href: "/admin/tickets", label: "Support tickets", hint: "Cross-tenant issues" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 transition hover:border-brand-300 hover:shadow-sm dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500/40"
          >
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{a.label}</p>
            <p className="mt-0.5 text-xs text-gray-500">{a.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
