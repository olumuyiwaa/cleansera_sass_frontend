"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getReportKPIs,
  getRevenueByDay,
  getCleanerPerformance,
  ReportKPIs,
  RevenueDay,
  CleanerPerfRow,
} from "@/app/api/reports.api";
import { formatMoney } from "@/app/api/cleansera-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export default function ReportsPage() {
  const [range, setRange] = useState(defaultRange);
  const [kpis, setKpis] = useState<ReportKPIs | null>(null);
  const [revenue, setRevenue] = useState<RevenueDay[]>([]);
  const [cleaners, setCleaners] = useState<CleanerPerfRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [k, r, c] = await Promise.all([
        getReportKPIs(range.from, range.to),
        getRevenueByDay(range.from, range.to),
        getCleanerPerformance(range.from, range.to),
      ]);
      setKpis(k);
      setRevenue(r);
      setCleaners(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [range.from, range.to]);

  useEffect(() => {
    load();
  }, [load]);

  const cards = kpis
    ? [
        { label: "Revenue", value: formatMoney(kpis.revenueCents) },
        { label: "Collected", value: formatMoney(kpis.collectedCents) },
        { label: "Avg ticket", value: formatMoney(kpis.avgTicketCents) },
        { label: "Jobs", value: String(kpis.total) },
        { label: "Completed", value: `${kpis.completed} (${kpis.completionRate}%)` },
        { label: "Cancelled", value: `${kpis.cancelled} (${kpis.cancelRate}%)` },
        { label: "No-shows", value: String(kpis.noShows) },
        { label: "Utilization", value: `${kpis.utilizationPct}%` },
        { label: "Active cleaners", value: String(kpis.activeCleaners) },
        { label: "Customers", value: String(kpis.totalCustomers) },
      ]
    : [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Revenue, utilization, and cleaner performance.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label>From</Label>
            <Input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
          </div>
          <div>
            <Label>To</Label>
            <Input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
          </div>
          <Button onClick={load} disabled={loading}>{loading ? "Loading…" : "Refresh"}</Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600">
          {error}
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.02]"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{c.label}</p>
            <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02]">
        <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">Revenue by day</h2>
        </div>
        <div className="max-h-64 overflow-y-auto px-5 py-3">
          {revenue.length === 0 ? (
            <p className="text-sm text-gray-500">No completed jobs in this range.</p>
          ) : (
            <ul className="space-y-2">
              {revenue.map((d) => (
                <li key={d.date} className="flex justify-between text-sm">
                  <span className="text-gray-500">{d.date}</span>
                  <span className="font-medium text-gray-800 dark:text-white/90">{formatMoney(d.revenueCents)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02]">
        <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">Cleaner performance</h2>
        </div>
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Cleaner</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Jobs</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Completed</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Check-ins</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Revenue</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {cleaners.map((c) => (
                <TableRow key={c.cleanerId}>
                  <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{c.name}</TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500">{c.jobs}</TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500">{c.completed}</TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500">{c.checkIns}</TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500">{formatMoney(c.revenueCents)}</TableCell>
                </TableRow>
              ))}
              {!loading && cleaners.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500">
                    No cleaner data for this range.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
