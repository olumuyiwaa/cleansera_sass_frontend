"use client";

import React, { useState, useCallback, useEffect } from "react";
import { authFetch } from "@/app/api/authFetch";
import SearchSelect from "@/components/SearchSelect/SearchSelect";
import {useAuth} from "@/app/auth/useAuth";
import {useRouter} from "next/navigation";

// ─── Types ────────────────────────────────────────────────────

type AuditLog = {
    id:           string;
    createdAt:    string;
    action:       string;
    resource:     string;
    resourceId?:  string;
    ipAddress?:   string;
    user?:        { email: string; role: string };
    previousData?: any;
    newData?:     any;
};

// ─── Helpers ──────────────────────────────────────────────────

function formatDateTime(value?: string | null) {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function formatLabel(value?: string | null) {
    if (!value) return "-";
    return value.replaceAll("_", " ");
}

function getActionBadgeClass(action: string): string {
    switch (action) {
        case "CREATE":  return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300";
        case "UPDATE":  return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300";
        case "DELETE":  return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300";
        case "LOGIN":
        case "LOGOUT":  return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
        case "APPROVE": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
        case "REJECT":  return "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300";
        case "SUSPEND": return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300";
        case "RESTORE": return "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300";
        case "UPLOAD":  return "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300";
        default:        return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
    }
}

function getChangeLabel(log: AuditLog): string {
    if (log.action === "LOGIN")  return "Signed in";
    if (log.action === "LOGOUT") return "Signed out";
    if (log.action === "UPLOAD") return "File uploaded";
    if (log.newData && log.previousData) return "Record updated";
    if (log.newData)      return "Record created";
    if (log.previousData) return "Record deleted";
    return "—";
}

// ─── Page ─────────────────────────────────────────────────────

export default function AuditTrailPage() {
    const [logs, setLogs]             = useState<AuditLog[]>([]);
    const [pagination, setPagination] = useState<any>(null);
    const [page, setPage]             = useState(1);
    const [isLoading, setIsLoading]   = useState(true);
    const [error, setError]           = useState("");
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const { user } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!isLoading && user === null) {
            router.replace("/");
        }
    }, [user,isLoading, router]);

    // ── Filters ──────────────────────────────────────────────────
    const [filters, setFilters] = useState({
        from:     "",
        to:       "",
        userId:   "",
        resource: "",
        action:   "",
    });

    // Human-readable label shown in the active-filter chip
    const [selectedUserLabel, setSelectedUserLabel] = useState("");

    const setFilter = (key: keyof typeof filters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1);
    };

    // ── Fetch ─────────────────────────────────────────────────────
    const fetchAuditLogs = useCallback(async () => {
        setIsLoading(true);
        setError("");

        const query = new URLSearchParams({ page: page.toString(), limit: "20" });
        if (filters.from)     query.set("from",     filters.from);
        if (filters.to)       query.set("to",       filters.to);
        if (filters.userId)   query.set("userId",   filters.userId);
        if (filters.resource) query.set("resource", filters.resource);
        if (filters.action)   query.set("action",   filters.action);

        try {
            const result = await authFetch(`/reports/audit-trail?${query}`);
            if (!result.success) throw new Error(result.message);
            setLogs(result.data?.data || []);
            setPagination(result.data?.pagination || null);
        } catch (err: any) {
            setError(err.message || "Failed to load audit trail");
        } finally {
            setIsLoading(false);
        }
    }, [page, filters]);

    useEffect(() => { fetchAuditLogs(); }, [fetchAuditLogs]);

    // ── CSV export ────────────────────────────────────────────────
    const exportToCSV = () => {
        if (!logs.length) return;
        const headers = ["Time", "User", "Role", "Action", "Resource", "Resource ID", "IP Address", "Details"];
        const rows = logs.map((log) => [
            `"${formatDateTime(log.createdAt)}"`,
            `"${log.user?.email || "System"}"`,
            `"${log.user?.role || ""}"`,
            `"${log.action}"`,
            `"${log.resource}"`,
            `"${log.resourceId || ""}"`,
            `"${log.ipAddress || ""}"`,
            `"${getChangeLabel(log)}"`,
        ].join(","));

        const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
        const url  = URL.createObjectURL(blob);
        const a    = Object.assign(document.createElement("a"), {
            href:     url,
            download: `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`,
        });
        a.click();
        URL.revokeObjectURL(url);
    };

    // ── Clear filters ─────────────────────────────────────────────
    const clearFilters = () => {
        setFilters({ from: "", to: "", userId: "", resource: "", action: "" });
        setSelectedUserLabel("");
        setPage(1);
    };

    const hasActiveFilters =
        filters.from || filters.to || filters.userId ||
        filters.resource || filters.action;

    // ─────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Audit Trail
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Immutable log of all platform activity.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={exportToCSV}
                            disabled={!logs.length}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Export CSV
                        </button>

                        <button
                            type="button"
                            onClick={fetchAuditLogs}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        >
                            {isLoading ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                        {error}
                    </div>
                )}
            </div>

            {/* ── Filters ────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Filters</h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

                    {/* From date */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                            From
                        </label>
                        <input
                            type="date"
                            value={filters.from}
                            onChange={(e) => setFilter("from", e.target.value)}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        />
                    </div>

                    {/* To date */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                            To
                        </label>
                        <input
                            type="date"
                            value={filters.to}
                            onChange={(e) => setFilter("to", e.target.value)}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        />
                    </div>

                    {/* User — SearchSelect instead of text input */}
                    <SearchSelect
                        label="User"
                        placeholder="Search by name or email..."
                        type="user"
                        onSelect={(id, hit) => {
                            setFilter("userId", id);
                            setSelectedUserLabel(hit.title);
                        }}
                        onClear={() => {
                            setFilter("userId", "");
                            setSelectedUserLabel("");
                        }}
                    />

                    {/* Resource */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                            Resource
                        </label>
                        <select
                            value={filters.resource}
                            onChange={(e) => setFilter("resource", e.target.value)}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        >
                            <option value="">All Resources</option>
                            {["User","CleanerProfile","Shift","ShiftAssignment","Visit","Case","Business",
                                "Credential","Invoice","Payout","Storage","Conversation"].map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    {/* Action */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                            Action
                        </label>
                        <select
                            value={filters.action}
                            onChange={(e) => setFilter("action", e.target.value)}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        >
                            <option value="">All Actions</option>
                            {["CREATE","UPDATE","DELETE","LOGIN","LOGOUT","APPROVE","REJECT",
                                "SUSPEND","RESTORE","UPLOAD","DOWNLOAD"].map((a) => (
                                <option key={a} value={a}>{formatLabel(a)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Clear */}
                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={clearFilters}
                            disabled={!hasActiveFilters}
                            className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* Active filter chips */}
                {hasActiveFilters && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {filters.from && (
                            <Chip label={`From: ${filters.from}`} onRemove={() => setFilter("from", "")} />
                        )}
                        {filters.to && (
                            <Chip label={`To: ${filters.to}`} onRemove={() => setFilter("to", "")} />
                        )}
                        {filters.userId && (
                            <Chip
                                label={`User: ${selectedUserLabel || filters.userId.slice(0, 8) + "…"}`}
                                onRemove={() => { setFilter("userId", ""); setSelectedUserLabel(""); }}
                                colorClass="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            />
                        )}
                        {filters.resource && (
                            <Chip label={`Resource: ${filters.resource}`} onRemove={() => setFilter("resource", "")} colorClass="bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" />
                        )}
                        {filters.action && (
                            <Chip label={`Action: ${formatLabel(filters.action)}`} onRemove={() => setFilter("action", "")} colorClass={getActionBadgeClass(filters.action)} />
                        )}
                    </div>
                )}
            </div>

            {/* ── Table ──────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                    <h2 className="font-semibold text-gray-800 dark:text-white/90">
                        Activity Log
                        {pagination?.total != null && (
                            <span className="ml-2 text-sm font-normal text-gray-400">
                ({pagination.total.toLocaleString()} records)
              </span>
                        )}
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                        <tr>
                            {/* expand toggle column */}
                            <th className="w-10 px-4 py-3" />
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Time</th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">User</th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Action</th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Resource</th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Details</th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading ? (
                            // Skeleton rows
                            Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-4"><div className="h-4 w-4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <td key={j} className="px-5 py-4">
                                            <div className="h-4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" style={{ width: `${60 + (j * 10) % 40}%` }} />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No audit records found.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <React.Fragment key={log.id}>
                                    <tr
                                        className="cursor-pointer hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
                                        onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                                    >
                                        {/* Expand toggle */}
                                        <td className="px-4 py-4 text-center">
                        <span className={`inline-flex h-5 w-5 items-center justify-center rounded text-xs font-bold transition-transform ${
                            expandedRow === log.id
                                ? "bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300"
                                : "text-gray-400"
                        }`}>
                          {expandedRow === log.id ? "−" : "+"}
                        </span>
                                        </td>

                                        {/* Time */}
                                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {formatDateTime(log.createdAt)}
                                        </td>

                                        {/* User */}
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                                {log.user?.email || "System"}
                                            </p>
                                            {log.user?.role && (
                                                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                                                    {formatLabel(log.user.role)}
                                                </p>
                                            )}
                                        </td>

                                        {/* Action badge */}
                                        <td className="px-5 py-4">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${getActionBadgeClass(log.action)}`}>
                          {formatLabel(log.action)}
                        </span>
                                        </td>

                                        {/* Resource */}
                                        <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            {formatLabel(log.resource)}
                                            {log.resourceId && (
                                                <span className="ml-1.5 font-mono text-xs text-gray-400">
                            #{log.resourceId.slice(0, 8)}
                          </span>
                                            )}
                                        </td>

                                        {/* Details summary */}
                                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5">
                          {getChangeLabel(log)}
                            {log.ipAddress && (
                                <span className="font-mono text-xs text-gray-300 dark:text-gray-600">
                              · {log.ipAddress}
                            </span>
                            )}
                        </span>
                                        </td>
                                    </tr>

                                    {/* Expanded row */}
                                    {expandedRow === log.id && (
                                        <tr className="bg-gray-50/80 dark:bg-white/[0.01]">
                                            <td colSpan={6} className="px-6 py-5">
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    {log.previousData && (
                                                        <div>
                                                            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                                                                <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                                                                Before
                                                            </p>
                                                            <pre className="max-h-60 overflow-auto rounded-lg border border-red-100 bg-white px-4 py-3 text-xs leading-relaxed text-gray-700 dark:border-red-500/20 dark:bg-gray-900 dark:text-gray-300">
                                  {JSON.stringify(log.previousData, null, 2)}
                                </pre>
                                                        </div>
                                                    )}
                                                    {log.newData && (
                                                        <div>
                                                            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
                                                                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                                                                After
                                                            </p>
                                                            <pre className="max-h-60 overflow-auto rounded-lg border border-green-100 bg-white px-4 py-3 text-xs leading-relaxed text-gray-700 dark:border-green-500/20 dark:bg-gray-900 dark:text-gray-300">
                                  {JSON.stringify(log.newData, null, 2)}
                                </pre>
                                                        </div>
                                                    )}
                                                    {!log.previousData && !log.newData && (
                                                        <div className="rounded-lg border border-gray-100 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
                                                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                                                Event summary
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {log.action === "LOGIN"   && "User authenticated successfully."}
                                                                {log.action === "LOGOUT"  && "User session ended."}
                                                                {log.action === "CREATE"  && `${formatLabel(log.resource)} record was created.`}
                                                                {log.action === "DELETE"  && `${formatLabel(log.resource)} record was deleted.`}
                                                                {log.action === "UPLOAD"  && "A file was uploaded."}
                                                                {log.action === "APPROVE" && `${formatLabel(log.resource)} was approved.`}
                                                                {log.action === "REJECT"  && `${formatLabel(log.resource)} was rejected.`}
                                                                {log.action === "SUSPEND" && "User account was suspended."}
                                                                {log.action === "RESTORE" && "User account was restored."}
                                                                {!["LOGIN","LOGOUT","CREATE","DELETE","UPLOAD","APPROVE","REJECT","SUSPEND","RESTORE"].includes(log.action) && (
                                                                    `${formatLabel(log.action)} performed on ${formatLabel(log.resource)}.`
                                                                )}
                                                            </p>
                                                            {log.resourceId && (
                                                                <p className="mt-1.5 font-mono text-xs text-gray-300 dark:text-gray-600">
                                                                    Resource: {log.resourceId}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && (
                    <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Page {page} of {pagination.totalPages} · {pagination.total.toLocaleString()} records
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={!pagination.hasPrev}
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                            >
                                Previous
                            </button>
                            <button
                                type="button"
                                disabled={!pagination.hasNext}
                                onClick={() => setPage((p) => p + 1)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Reusable chip ────────────────────────────────────────────

function Chip({
                  label,
                  onRemove,
                  colorClass = "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
              }: {
    label:       string;
    onRemove:    () => void;
    colorClass?: string;
}) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${colorClass}`}>
      {label}
            <button
                type="button"
                onClick={onRemove}
                className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
            >
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </span>
    );
}