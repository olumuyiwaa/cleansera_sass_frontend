"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listUsers,
  setUserActive,
  UserListItem,
  Pagination,
} from "@/app/api/superAdmin.api";

export default function SuperAdminUsersPage() {
  const [items, setItems] = useState<UserListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [q, setQ] = useState("");
  const [globalRole, setGlobalRole] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listUsers({
        q: q || undefined,
        globalRole: globalRole || undefined,
        page,
        limit: 20,
      });
      setItems(data.items);
      setPagination(data.pagination);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [q, globalRole, page]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (u: UserListItem) => {
    const next = !u.isActive;
    if (!confirm(`${next ? "Activate" : "Deactivate"} ${u.email}?`)) return;
    setBusyId(u.id);
    try {
      await setUserActive(u.id, next);
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
          Users
        </h1>
        <p className="text-sm text-gray-500">
          Platform-wide accounts (owners, managers, cleaners, super admins).
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          placeholder="Search email or name…"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        <select
          value={globalRole}
          onChange={(e) => {
            setPage(1);
            setGlobalRole(e.target.value);
          }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="">All roles</option>
          <option value="PLATFORM_USER">Platform user</option>
          <option value="SUPER_ADMIN">Super admin</option>
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
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Affiliations</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {u.firstName} {u.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.globalRole === "SUPER_ADMIN"
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {u.globalRole}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {u.businessMemberships.length > 0 &&
                      u.businessMemberships
                        .map(
                          (m) =>
                            `${m.business.name} (${m.role.replace("BUSINESS_", "")})`
                        )
                        .join(", ")}
                    {u.cleanerProfiles.length > 0 &&
                      (u.businessMemberships.length > 0 ? " · " : "") +
                        u.cleanerProfiles
                          .map((c) => `Cleaner @ ${c.business.name}`)
                          .join(", ")}
                    {u.businessMemberships.length === 0 &&
                      u.cleanerProfiles.length === 0 &&
                      "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.globalRole !== "SUPER_ADMIN" && (
                      <button
                        type="button"
                        disabled={busyId === u.id}
                        onClick={() => toggleActive(u)}
                        className="text-xs font-medium text-indigo-600 hover:underline disabled:opacity-50"
                      >
                        {busyId === u.id
                          ? "…"
                          : u.isActive
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No users found
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
