"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listBusinesses,
  setBusinessActive,
  BusinessListItem,
  Pagination,
} from "@/app/api/superAdmin.api";
import RowActionsMenu from "@/components/tables/RowActionsMenu";

export default function SuperAdminBusinessesPage() {
  const [items, setItems] = useState<BusinessListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listBusinesses({
        q: q || undefined,
        isActive:
          filter === "all" ? undefined : filter === "active" ? true : false,
        page,
        limit: 20,
      });
      setItems(data.items);
      setPagination(data.pagination);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load businesses");
    } finally {
      setLoading(false);
    }
  }, [q, filter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (b: BusinessListItem) => {
    const next = !b.isActive;
    const label = next ? "activate" : "deactivate";
    if (!confirm(`${label} “${b.name}”?`)) return;
    setBusyId(b.id);
    try {
      await setBusinessActive(b.id, next);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Businesses
        </h1>
        <p className="text-sm text-gray-500">
          All tenants on the platform. Deactivating blocks their dashboard and
          public booking widget.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          placeholder="Search name or subdomain…"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        <select
          value={filter}
          onChange={(e) => {
            setPage(1);
            setFilter(e.target.value as typeof filter);
          }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="all">All</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
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
                <th className="px-4 py-3">Stats</th>
                <th className="px-4 py-3">Stripe</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {b.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {b.subdomain}
                      {b.customDomain ? ` · ${b.customDomain}` : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {b.subscription?.plan?.name || "—"}
                    {b.subscription?.status && (
                      <div className="text-xs text-gray-400">
                        {b.subscription.status}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {b._count.cleaners} cleaners · {b._count.customers}{" "}
                    customers · {b._count.bookings} bookings
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {b.stripeConnectOnboarded ? (
                      <span className="text-emerald-600">Connected</span>
                    ) : (
                      <span className="text-amber-600">Not connected</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        b.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {b.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <RowActionsMenu
                      label={`Actions for ${b.name}`}
                      actions={[
                        {
                          label: busyId === b.id ? "…" : b.isActive ? "Deactivate" : "Activate",
                          disabled: busyId === b.id,
                          variant: b.isActive ? "danger" as const : "default" as const,
                          onClick: () => toggleActive(b),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No businesses found
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
            Page {pagination.page} of {pagination.totalPages} ({pagination.total}{" "}
            total)
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
