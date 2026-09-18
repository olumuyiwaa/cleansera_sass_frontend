"use client";

import React, { useCallback, useEffect, useState } from "react";
import { listWaitlist, cancelWaitlistEntry, type WaitlistEntry, type WaitlistStatus } from "@/app/api/waitlist.api";
import RowActionsMenu from "@/components/tables/RowActionsMenu";

const STATUS_OPTIONS: { value: WaitlistStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "WAITING", label: "Waiting" },
  { value: "NOTIFIED", label: "Notified" },
  { value: "CONVERTED", label: "Converted" },
  { value: "EXPIRED", label: "Expired" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function WaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [status, setStatus] = useState<WaitlistStatus | "">("WAITING");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listWaitlist(status || undefined);
      setEntries((res.data as WaitlistEntry[]) || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load waitlist");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const onCancel = async (id: string) => {
    if (!confirm("Remove this customer from the waitlist?")) return;
    setError("");
    try {
      await cancelWaitlistEntry(id);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to cancel waitlist entry");
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Waitlist</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Customers who couldn&apos;t find an open slot in the booking widget. When a booking is cancelled, the
            first few matching entries are notified automatically.
          </p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as WaitlistStatus | "")}
          className="h-11 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-white/[0.03]">
              <tr>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Desired window</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {entries.map((w) => (
                <tr key={w.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3">
                    {w.customer ? `${w.customer.firstName} ${w.customer.lastName}` : w.contactName || "—"}
                    <div className="text-xs text-gray-500">{w.contactEmail || w.contactPhone}</div>
                  </td>
                  <td className="px-4 py-3">{w.service?.name || "Any service"}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(w.desiredStart).toLocaleString()} – {new Date(w.desiredEnd).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{w.status}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(w.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <RowActionsMenu
                      label={`Actions for waitlist entry ${w.contactName || w.id}`}
                      actions={
                        w.status === "WAITING" || w.status === "NOTIFIED"
                          ? [{ label: "Remove", variant: "danger" as const, onClick: () => onCancel(w.id) }]
                          : []
                      }
                    />
                  </td>
                </tr>
              ))}
              {!entries.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No one on the waitlist
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
