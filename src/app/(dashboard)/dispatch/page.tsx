"use client";

import { useEffect, useState, useCallback } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listDispatchItems, createAssignment, suggestCleaners, DispatchAssignment } from "@/app/api/dispatch.api";
import { listBookings } from "@/app/api/bookings.api";
import { Booking, Cleaner, cleanerDisplayName } from "@/app/api/cleansera-types";

export default function DispatchPage() {
  const [needsAssignment, setNeedsAssignment] = useState<Booking[]>([]);
  const [assignments, setAssignments] = useState<DispatchAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suggestingFor, setSuggestingFor] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Cleaner[]>([]);
  const [assigning, setAssigning] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // "Needs assignment" = confirmed bookings with no cleaner yet.
      // "In progress" = existing assignments for jobs not yet completed.
      const [confirmed, assigned, inProgress] = await Promise.all([
        listBookings("CONFIRMED"),
        listDispatchItems(),
        listBookings("IN_PROGRESS"),
      ]);
      setNeedsAssignment(confirmed);
      const activeAssignments = assigned.filter(
        (a) => a.booking?.status === "ASSIGNED" || a.booking?.status === "IN_PROGRESS"
      );
      setAssignments(activeAssignments.length ? activeAssignments : assigned);
      void inProgress; // already covered via assignments' nested booking.status
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dispatch board");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openSuggestions = async (bookingId: string) => {
    setError("");
    setSuggestingFor(bookingId);
    setSuggestions([]);
    try {
      const cleaners = await suggestCleaners(bookingId);
      setSuggestions(cleaners);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to suggest cleaners");
    }
  };

  const assign = async (bookingId: string, cleanerId?: string) => {
    setAssigning(bookingId);
    setError("");
    try {
      await createAssignment(bookingId, cleanerId);
      setSuggestingFor(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign");
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Dispatch</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Assign confirmed bookings to a cleaner, or let CleanSera suggest the best fit by service area and availability.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Needs assignment ({needsAssignment.length})
      </h2>
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Customer</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Service</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Scheduled</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Assign</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading && (
                <TableRow><TableCell className="px-5 py-6 text-center text-gray-500" colSpan={4}>Loading…</TableCell></TableRow>
              )}
              {!loading && needsAssignment.length === 0 && (
                <TableRow><TableCell className="px-5 py-6 text-center text-gray-500" colSpan={4}>Nothing waiting on dispatch</TableCell></TableRow>
              )}
              {!loading && needsAssignment.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                    {b.customer ? `${b.customer.firstName} ${b.customer.lastName}` : "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{b.service?.name || "—"}</TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(b.scheduledStart).toLocaleString()}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {suggestingFor === b.id ? (
                      <div className="space-y-2">
                        {suggestions.length === 0 ? (
                          <p className="text-xs text-gray-400">No available cleaners found nearby</p>
                        ) : (
                          suggestions.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => assign(b.id, c.id)}
                              disabled={assigning === b.id}
                              className="block w-full rounded-md border border-gray-200 px-3 py-1.5 text-left text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"
                            >
                              {cleanerDisplayName(c)}
                            </button>
                          ))
                        )}
                        <button onClick={() => setSuggestingFor(null)} className="text-xs text-gray-400 underline">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <Button size="sm" onClick={() => openSuggestions(b.id)}>Suggest cleaner</Button>
                        <Button size="sm" variant="outline" disabled={assigning === b.id} onClick={() => assign(b.id)}>
                          {assigning === b.id ? "Assigning…" : "Auto-assign"}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        In progress ({assignments.length})
      </h2>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Customer</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Cleaner</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Scheduled</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {!loading && assignments.length === 0 && (
                <TableRow><TableCell className="px-5 py-6 text-center text-gray-500" colSpan={4}>No active jobs right now</TableCell></TableRow>
              )}
              {!loading && assignments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                    {a.booking?.customer ? `${a.booking.customer.firstName} ${a.booking.customer.lastName}` : "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {a.cleaner ? cleanerDisplayName(a.cleaner) : "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {a.booking ? new Date(a.booking.scheduledStart).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge color={a.booking?.status === "IN_PROGRESS" ? "warning" : "info"} size="sm">
                      {a.booking?.status || "ASSIGNED"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
