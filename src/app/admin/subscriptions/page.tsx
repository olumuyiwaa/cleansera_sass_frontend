"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listSubscriptions,
  listPlans,
  SubscriptionListItem,
  Pagination,
} from "@/app/api/superAdmin.api";

export default function SuperAdminSubscriptionsPage() {
  const [items, setItems] = useState<SubscriptionListItem[]>([]);
  const [plans, setPlans] = useState<
    Array<{
      id: string;
      name: string;
      monthlyPriceCents: number;
      maxCleaners?: number | null;
      _count: { subscriptions: number };
    }>
  >([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [subs, planList] = await Promise.all([
        listSubscriptions({
          status: status || undefined,
          page,
          limit: 20,
        }),
        listPlans(),
      ]);
      setItems(subs.items);
      setPagination(subs.pagination);
      setPlans(planList);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Subscriptions
        </h1>
        <p className="text-sm text-gray-500">
          Platform billing only (CleanSera → Business). Job payments are
          separate via Stripe Connect.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {p.name}
            </p>
            <p className="mt-1 text-lg font-medium">
              ${(p.monthlyPriceCents / 100).toFixed(0)}
              <span className="text-xs font-normal text-gray-500">/mo</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {p._count.subscriptions} subscribers
              {p.maxCleaners != null ? ` · max ${p.maxCleaners} cleaners` : ""}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="">All statuses</option>
          <option value="TRIALING">Trialing</option>
          <option value="ACTIVE">Active</option>
          <option value="PAST_DUE">Past due</option>
          <option value="CANCELED">Canceled</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase text-gray-500 dark:border-gray-800">
              <tr>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Period end</th>
                <th className="px-4 py-3">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {s.business.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {s.business.subdomain}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {s.plan.name} · $
                    {(s.plan.monthlyPriceCents / 100).toFixed(0)}/mo
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium dark:bg-gray-800">
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {s.currentPeriodEnd
                      ? new Date(s.currentPeriodEnd).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No subscriptions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border px-3 py-1 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
