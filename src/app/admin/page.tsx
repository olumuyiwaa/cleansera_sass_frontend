"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOverview, PlatformOverview } from "@/app/api/superAdmin.api";

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

  if (loading) {
    return <p className="text-sm text-gray-500">Loading platform overview…</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const { kpis, subscriptionBreakdown, recentBusinesses } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Platform overview
        </h1>
        <p className="text-sm text-gray-500">
          Cross-tenant health of CleanSera.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Businesses" value={kpis.totalBusinesses} hint={`${kpis.activeBusinesses} active`} />
        <Kpi label="MRR" value={`$${kpis.mrrFormatted}`} hint="Active + trialing plans" />
        <Kpi label="Users" value={kpis.totalUsers} />
        <Kpi label="Open tickets" value={kpis.openTickets} />
        <Kpi label="Active cleaners" value={kpis.totalCleaners} />
        <Kpi label="Customers" value={kpis.totalCustomers} />
        <Kpi label="Bookings" value={kpis.totalBookings} />
        <Kpi label="Inactive businesses" value={kpis.inactiveBusinesses} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">
            Subscriptions
          </h2>
          <ul className="space-y-2 text-sm">
            {Object.entries(subscriptionBreakdown).map(([status, count]) => (
              <li
                key={status}
                className="flex items-center justify-between text-gray-600 dark:text-gray-300"
              >
                <span>{status}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {count}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Recent businesses
            </h2>
            <Link
              href="/admin/businesses"
              className="text-xs font-medium text-indigo-600 hover:underline"
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
                  <th className="pb-2">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentBusinesses.map((b) => (
                  <tr key={b.id}>
                    <td className="py-2 pr-3 font-medium text-gray-900 dark:text-white">
                      <Link
                        href={`/admin/businesses?highlight=${b.id}`}
                        className="hover:underline"
                      >
                        {b.name}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 text-gray-500">{b.subdomain}</td>
                    <td className="py-2 pr-3 text-gray-500">
                      {b.subscription?.plan?.name || "—"}
                    </td>
                    <td className="py-2 pr-3">
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
                    <td className="py-2 text-gray-500">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
