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
import { listDispatchItems, createAssignment, suggestCleaners, getCleanerDayRoute, DispatchAssignment, DayRoute } from "@/app/api/dispatch.api";
import { listBookings } from "@/app/api/bookings.api";
import { listCleaners } from "@/app/api/cleaners.api";
import { Booking, Cleaner, cleanerDisplayName } from "@/app/api/cleansera-types";

export default function DispatchPage() {
  const [needsAssignment, setNeedsAssignment] = useState<Booking[]>([]);
  const [assignments, setAssignments] = useState<DispatchAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suggestingFor, setSuggestingFor] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Cleaner[]>([]);
  const [assigning, setAssigning] = useState<string | null>(null);

  const [activeCleaners, setActiveCleaners] = useState<Cleaner[]>([]);
  const [routeCleanerId, setRouteCleanerId] = useState("");
  const [routeDate, setRouteDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [route, setRoute] = useState<DayRoute | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");

  const checkRoute = async () => {
    if (!routeCleanerId) return;
    setRouteLoading(true);
    setRouteError("");
    setRoute(null);
    try {
      const r = await getCleanerDayRoute(routeCleanerId, routeDate);
      setRoute(r);
    } catch (err) {
      setRouteError(err instanceof Error ? err.message : "Failed to check route");
    } finally {
      setRouteLoading(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // "Needs assignment" = confirmed bookings with no cleaner yet.
      // "In progress" = existing assignments for jobs not yet completed.
      const [confirmed, assigned, inProgress, cleaners] = await Promise.all([
        listBookings("CONFIRMED"),
        listDispatchItems(),
        listBookings("IN_PROGRESS"),
        listCleaners("ACTIVE"),
      ]);
      setNeedsAssignment(confirmed);
      const activeAssignments = assigned.filter(
        (a) => a.booking?.status === "ASSIGNED" || a.booking?.status === "IN_PROGRESS"
      );
      setAssignments(activeAssignments.length ? activeAssignments : assigned);
      setActiveCleaners(cleaners);
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

      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.02]">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Day route check
        </h2>
        <p className="mb-3 text-xs text-gray-400">
          Doesn&apos;t reorder anyone&apos;s schedule — each job keeps its own booked time. This
          just walks a cleaner&apos;s day in order and flags any back-to-back jobs where the drive
          between them is longer than the gap they&apos;ve been given.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Cleaner</label>
            <select
              value={routeCleanerId}
              onChange={(e) => setRouteCleanerId(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-white/[0.03] dark:text-white"
            >
              <option value="">Select a cleaner…</option>
              {activeCleaners.map((c) => (
                <option key={c.id} value={c.id}>{cleanerDisplayName(c)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Date</label>
            <input
              type="date"
              value={routeDate}
              onChange={(e) => setRouteDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-white/[0.03] dark:text-white"
            />
          </div>
          <Button size="sm" onClick={checkRoute} disabled={!routeCleanerId || routeLoading}>
            {routeLoading ? "Checking…" : "Check route"}
          </Button>
        </div>

        {routeError && <p className="mt-3 text-sm text-error-500">{routeError}</p>}

        {route && (
          <div className="mt-4">
            {route.stops.length === 0 ? (
              <p className="text-sm text-gray-500">No jobs scheduled for this cleaner on {route.date}.</p>
            ) : (
              <ol className="space-y-2">
                {route.stops.map((stop, i) => {
                  const leg = route.legs[i - 1];
                  return (
                    <li key={stop.bookingId}>
                      {leg && (
                        <div
                          className={`ml-2 mb-2 border-l-2 pl-3 text-xs ${
                            leg.isTight
                              ? "border-error-400 text-error-500"
                              : "border-gray-200 text-gray-400 dark:border-gray-700"
                          }`}
                        >
                          {leg.distanceMeters != null
                            ? `~${(leg.distanceMeters / 1000).toFixed(1)} km, ~${Math.round(
                                (leg.estimatedDriveSeconds || 0) / 60
                              )} min drive`
                            : "Distance unknown (missing coordinates)"}
                          {" — "}
                          {Math.round(leg.gapSeconds / 60)} min scheduled between jobs
                          {leg.isTight && " — tight, may run late"}
                        </div>
                      )}
                      <div className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-800">
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {new Date(stop.scheduledStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="ml-2 text-gray-500 dark:text-gray-400">{stop.address}</span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        )}
      </div>

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
