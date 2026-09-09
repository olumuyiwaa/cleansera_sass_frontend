"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/app/auth/useAuth";
import { useAlert } from "@/hooks/useAlert";
import AlertModal from "@/components/modals/AlertModal/AlertModal";
import SearchSelect from "@/components/SearchSelect/SearchSelect";
import {
    supportApi,
    TicketPriority,
    TicketListItem,
    TicketDetail,
    TicketStatus,
    TicketReply,
} from "@/app/api/support.api";

// ─── Constants ────────────────────────────────────────────────

const STATUS_OPTIONS: TicketStatus[]   = ["OPEN", "IN_PROGRESS", "WAITING_ON_USER", "RESOLVED", "CLOSED"];
const PRIORITY_OPTIONS: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const STATUS_META: Record<TicketStatus, { label: string; cls: string; dot: string }> = {
    OPEN:             { label: "Open",             cls: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",     dot: "bg-blue-500"   },
    IN_PROGRESS:      { label: "In Progress",      cls: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300", dot: "bg-yellow-500" },
    WAITING_ON_USER:  { label: "Waiting on User",  cls: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300", dot: "bg-purple-500" },
    RESOLVED:         { label: "Resolved",         cls: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300",   dot: "bg-green-500"  },
    CLOSED:           { label: "Closed",           cls: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",         dot: "bg-gray-400"   },
};

const PRIORITY_META: Record<TicketPriority, { label: string; cls: string; icon: string }> = {
    URGENT: { label: "Urgent", cls: "text-red-600 font-semibold",   icon: "🔴" },
    HIGH:   { label: "High",   cls: "text-orange-600 font-medium",  icon: "🟠" },
    MEDIUM: { label: "Medium", cls: "text-amber-600",               icon: "🟡" },
    LOW:    { label: "Low",    cls: "text-gray-500",                 icon: "⚪" },
};

const CATEGORY_LABELS: Record<string, string> = {
    ACCOUNT_ACCESS:     "Account & Access",
    CREDENTIALS:        "Credentials",
    SHIFTS_SCHEDULING:  "Shifts & Scheduling",
    PAYMENTS_BILLING:   "Payments & Billing",
    TECHNICAL:          "Technical",
    OTHER:              "Other",
};

// ─── Helpers ──────────────────────────────────────────────────

function formatDateTime(value?: string | null) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatRelative(value?: string | null) {
    if (!value) return "—";
    const diff = Date.now() - new Date(value).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)   return "just now";
    if (mins < 60)  return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function getSubmitterName(ticket: TicketListItem | TicketDetail): string {
    if (ticket.guestName) return ticket.guestName;
    const t = ticket as TicketDetail;
    if ((t as any).user?.adminProfile) {
        const p = (t as any).user.adminProfile;
        return `${p.firstName} ${p.lastName}`;
    }
    if ((t as any).user?.cleanerProfile) {
        const p = (t as any).user.cleanerProfile;
        return `${p.firstName} ${p.lastName}`;
    }
    return (t as any).user?.email || "—";
}

function getReplyAuthorName(reply: TicketReply): string {
    if (reply.author?.adminProfile) {
        return `${reply.author.adminProfile.firstName} ${reply.author.adminProfile.lastName}`;
    }
    if (reply.author?.cleanerProfile) {
        return `${reply.author.cleanerProfile.firstName} ${reply.author.cleanerProfile.lastName}`;
    }
    return reply.authorEmail || "Guest";
}

function isStaffReply(reply: TicketReply): boolean {
    return !!(reply.author?.adminProfile || reply.author?.cleanerProfile);
}

function formatBytes(bytes: number): string {
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Sub-components ───────────────────────────────────────────

function StatusBadge({ status }: { status: TicketStatus }) {
    const m = STATUS_META[status];
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${m.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
            {m.label}
    </span>
    );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
    const m = PRIORITY_META[priority];
    return (
        <span className={`text-xs font-medium ${m.cls}`}>
      {m.icon} {m.label}
    </span>
    );
}

function StatCard({
                      label, value, sub, accent,
                  }: {
    label:  string;
    value:  string | number;
    sub?:   string;
    accent?: string;
}) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
            <p className={`mt-1 text-3xl font-semibold ${accent || "text-gray-800 dark:text-white/90"}`}>{value}</p>
            {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────

export default function SupportTicketsManagementPage() {
    const { user }                              = useAuth();
    const { showAlert, closeAlert, isOpen, alertData } = useAlert();

    const [tickets, setTickets]           = useState<TicketListItem[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
    const [pagination, setPagination]     = useState<any>(null);
    const [stats, setStats]               = useState<any>(null);

    const [page, setPage]         = useState(1);
    const [limit]                 = useState(15);
    const [statusFilter, setStatusFilter]   = useState<TicketStatus | "">("");
    const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "">("");
    const [search, setSearch]     = useState("");

    const [isLoading, setIsLoading]           = useState(false);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [isUpdating, setIsUpdating]         = useState(false);

    // Reply state
    const [replyText, setReplyText]   = useState("");
    const [isInternal, setIsInternal] = useState(false);
    const [isReplying, setIsReplying] = useState(false);

    // Assign state
    const [assigneeId, setAssigneeId]     = useState("");
    const [isAssigning, setIsAssigning]   = useState(false);

    // Resolution text for RESOLVED transition
    const [resolution, setResolution]       = useState("");
    const [showResolutionInput, setShowResolutionInput] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<TicketStatus | null>(null);

    const repliesEndRef = useRef<HTMLDivElement>(null);

    // ── Fetch ──────────────────────────────────────────────────
    const filters = useMemo(() => ({
        page, limit,
        status:   statusFilter  || undefined,
        priority: priorityFilter || undefined,
        search:   search.trim() || undefined,
    }), [page, limit, statusFilter, priorityFilter, search]);

    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await supportApi.listTickets(filters);
            setTickets(result.data || []);
            setPagination(result.pagination || null);
        } catch {
            // handled silently
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    const fetchStats = useCallback(async () => {
        try {
            const result = await supportApi.getStats();
            setStats(result);
        } catch {}
    }, []);

    const fetchTicketDetails = async (id: string) => {
        setIsDetailsLoading(true);
        try {
            const result = await supportApi.getTicket(id);
            setSelectedTicket(result.data);
            setTimeout(() => repliesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        } catch (err: any) {
            showAlert({ type: "error", message: err.message || "Failed to load details" });
        } finally {
            setIsDetailsLoading(false);
        }
    };

    useEffect(() => { fetchTickets(); }, [fetchTickets]);
    useEffect(() => { fetchStats();   }, [fetchStats]);

    // ── Actions ────────────────────────────────────────────────

    const handleReply = async () => {
        if (!selectedTicket || !replyText.trim()) return;
        setIsReplying(true);
        try {
            await supportApi.addReply(selectedTicket.id, replyText.trim(), isInternal);
            setReplyText("");
            setIsInternal(false);
            await fetchTicketDetails(selectedTicket.id);
            await fetchTickets();
            showAlert({ type: "success", message: isInternal ? "Internal note added" : "Reply sent" });
        } catch (err: any) {
            showAlert({ type: "error", message: err.message });
        } finally {
            setIsReplying(false);
        }
    };

    const initiateStatusChange = (newStatus: TicketStatus) => {
        if (newStatus === "RESOLVED") {
            setPendingStatus(newStatus);
            setShowResolutionInput(true);
        } else {
            applyStatusChange(newStatus);
        }
    };

    const applyStatusChange = async (newStatus: TicketStatus, res?: string) => {
        if (!selectedTicket) return;
        setIsUpdating(true);
        setShowResolutionInput(false);
        try {
            await supportApi.updateStatus(selectedTicket.id, newStatus, res);
            showAlert({ type: "success", message: `Status updated to ${STATUS_META[newStatus].label}` });
            setResolution("");
            setPendingStatus(null);
            await Promise.all([fetchTickets(), fetchStats(), fetchTicketDetails(selectedTicket.id)]);
        } catch (err: any) {
            showAlert({ type: "error", message: err.message });
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePriorityUpdate = async (priority: TicketPriority) => {
        if (!selectedTicket) return;
        setIsUpdating(true);
        try {
            await supportApi.updatePriority(selectedTicket.id, priority);
            showAlert({ type: "success", message: `Priority set to ${priority}` });
            await Promise.all([fetchTickets(), fetchTicketDetails(selectedTicket.id)]);
        } catch (err: any) {
            showAlert({ type: "error", message: err.message });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedTicket || !assigneeId) return;
        setIsAssigning(true);
        try {
            await supportApi.assign(selectedTicket.id, assigneeId);
            showAlert({ type: "success", message: "Ticket assigned" });
            setAssigneeId("");
            await Promise.all([fetchTickets(), fetchTicketDetails(selectedTicket.id)]);
        } catch (err: any) {
            showAlert({ type: "error", message: err.message });
        } finally {
            setIsAssigning(false);
        }
    };

    const handleDeleteTicket = (id: string, ticketNumber: string) => {
        showAlert({
            type:    "warning",
            title:   "Delete ticket?",
            message: `This permanently deletes ${ticketNumber} and all its replies. This cannot be undone.`,
            onConfirm: async () => {
                try {
                    await supportApi.deleteTicket(id);
                    setSelectedTicket(null);
                    await Promise.all([fetchTickets(), fetchStats()]);
                    showAlert({ type: "success", message: "Ticket deleted" });
                } catch (err: any) {
                    showAlert({ type: "error", message: err.message });
                }
            },
        });
    };

    // ── Derived stats for the header cards ─────────────────────
    const openCount     = stats?.byStatus.find((s: any) => s.status === "OPEN")?.count       ?? "—";
    const urgentCount   = stats?.byPriority.find((p: any) => p.priority === "URGENT")?.count  ?? "—";
    const resolvedCount = stats?.byStatus.find((s: any) => s.status === "RESOLVED")?.count    ?? "—";
    const avgHours      = stats?.avgResolutionHours ? `${Number(stats.avgResolutionHours).toFixed(1)}h` : "—";

    // ─────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">

            {/* ── Stats ───────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Open tickets"       value={openCount}     sub="Awaiting response"             accent={openCount > 0 ? "text-blue-600 dark:text-blue-400" : undefined} />
                <StatCard label="Urgent"             value={urgentCount}   sub="Highest priority"              accent={urgentCount > 0 ? "text-red-600 dark:text-red-400"  : undefined} />
                <StatCard label="Resolved"           value={resolvedCount} sub="All time"                      accent="text-green-600 dark:text-green-400" />
                <StatCard label="Avg resolution"     value={avgHours}      sub="For resolved tickets" />
            </div>

            {/* ── Header ──────────────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Support Tickets</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Manage and respond to user support requests.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => { fetchTickets(); fetchStats(); }}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                    >
                        <svg className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                            <path d="M21 3v5h-5"/>
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                            <path d="M8 16H3v5"/>
                        </svg>
                        {isLoading ? "Refreshing…" : "Refresh"}
                    </button>
                </div>
            </div>

            {/* ── Filters ─────────────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Search */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Search</label>
                        <div className="relative">
                            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Ticket #, subject, email…"
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent pl-9 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        >
                            <option value="">All Statuses</option>
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{STATUS_META[s].label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Priority</label>
                        <select
                            value={priorityFilter}
                            onChange={(e) => { setPriorityFilter(e.target.value as any); setPage(1); }}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        >
                            <option value="">All Priorities</option>
                            {PRIORITY_OPTIONS.map((p) => (
                                <option key={p} value={p}>{PRIORITY_META[p].icon} {PRIORITY_META[p].label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Clear */}
                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={() => { setSearch(""); setStatusFilter(""); setPriorityFilter(""); setPage(1); }}
                            disabled={!search && !statusFilter && !priorityFilter}
                            className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Table ───────────────────────────────────────────── */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                        <tr>
                            {["Ticket", "Subject", "Submitter", "Category", "Status", "Priority", "Opened", "Replies", ""].map((h) => (
                                <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    {Array.from({ length: 9 }).map((_, j) => (
                                        <td key={j} className="px-5 py-4">
                                            <div className="h-4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" style={{ width: `${50 + (j * 13) % 40}%` }} />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : tickets.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-5 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No tickets found.
                                </td>
                            </tr>
                        ) : (
                            tickets.map((ticket) => (
                                <tr
                                    key={ticket.id}
                                    className={`hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors ${
                                        ticket.priority === "URGENT" ? "border-l-2 border-l-red-500" : ""
                                    }`}
                                >
                                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {ticket.ticketNumber}
                      </span>
                                    </td>
                                    <td className="px-5 py-4 max-w-[220px]">
                                        <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">{ticket.subject}</p>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        <p className="truncate max-w-[140px]">{getSubmitterName(ticket)}</p>
                                        {ticket.guestEmail && (
                                            <p className="truncate text-xs text-gray-400">{ticket.guestEmail}</p>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                        {CATEGORY_LABELS[ticket.category] || ticket.category}
                                    </td>
                                    <td className="px-5 py-4"><StatusBadge status={ticket.status} /></td>
                                    <td className="px-5 py-4"><PriorityBadge priority={ticket.priority} /></td>
                                    <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                        <p>{formatRelative(ticket.createdAt)}</p>
                                        <p className="text-gray-400">{formatDateTime(ticket.createdAt)}</p>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-medium dark:bg-gray-800">
                        {ticket._count.replies}
                      </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => fetchTicketDetails(ticket.id)}
                                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Page {pagination?.page ?? page} of {pagination?.totalPages ?? 1} · {pagination?.total ?? tickets.length} total
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!pagination?.hasNext}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Detail Modal ─────────────────────────────────────── */}
            {selectedTicket && (
                <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">

                        {/*<div className="fixed inset-0 z-99999 flex items-center justify-center overflow-y-auto bg-gray-900/50 p-4">*/}
                        {/*    <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl dark:bg-gray-900 lg:p-6">*/}
                        {/* Modal header */}
                        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-6 dark:border-gray-800">
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-gray-500 dark:text-gray-400">
                    {selectedTicket.ticketNumber}
                  </span>
                                    <StatusBadge status={selectedTicket.status} />
                                    <PriorityBadge priority={selectedTicket.priority} />
                                    {selectedTicket.tags?.length > 0 && selectedTicket.tags.map((tag) => (
                                        <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {tag}
                    </span>
                                    ))}
                                </div>
                                <h2 className="mt-2 text-lg font-semibold text-gray-800 dark:text-white/90 leading-snug">
                                    {selectedTicket.subject}
                                </h2>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {CATEGORY_LABELS[selectedTicket.category]} ·{" "}
                                    Submitted by <strong>{getSubmitterName(selectedTicket)}</strong> ·{" "}
                                    {formatRelative(selectedTicket.createdAt)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedTicket(null)}
                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M18 6 6 18M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="flex-1 overflow-y-auto">
                            {isDetailsLoading ? (
                                <div className="flex items-center justify-center py-16 text-sm text-gray-500">
                                    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity=".25"/>
                                        <path fill="currentColor" opacity=".75" d="M4 12a8 8 0 018-8v8H4z"/>
                                    </svg>
                                    Loading ticket…
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 divide-y divide-gray-100 dark:divide-gray-800 lg:grid-cols-[1fr_280px] lg:divide-x lg:divide-y-0">

                                    {/* ── Left: Conversation ──────────────────── */}
                                    <div className="flex flex-col p-6">

                                        {/* Conversation thread */}
                                        <div className="space-y-4 mb-6">
                                            {selectedTicket.replies.map((reply, idx) => {
                                                const isStaff    = isStaffReply(reply);
                                                const isFirstMsg = idx === 0;

                                                return (
                                                    <div
                                                        key={reply.id}
                                                        className={`flex gap-3 ${isStaff ? "flex-row-reverse" : "flex-row"}`}
                                                    >
                                                        {/* Avatar */}
                                                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                                            isStaff
                                                                ? "bg-brand-500 text-white"
                                                                : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                                        }`}>
                                                            {getReplyAuthorName(reply).charAt(0).toUpperCase()}
                                                        </div>

                                                        {/* Bubble */}
                                                        <div className={`max-w-[75%] ${isStaff ? "items-end" : "items-start"} flex flex-col gap-1`}>
                                                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  {getReplyAuthorName(reply)}
                                </span>
                                                                {isStaff && <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">Staff</span>}
                                                                {reply.isInternal && (
                                                                    <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                                    Internal
                                  </span>
                                                                )}
                                                                {isFirstMsg && (
                                                                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800">
                                    Original
                                  </span>
                                                                )}
                                                            </div>

                                                            <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                                                                reply.isInternal
                                                                    ? "border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"
                                                                    : isStaff
                                                                        ? "bg-brand-500 text-white"
                                                                        : "border border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                                            }`}>
                                                                {reply.body}
                                                            </div>

                                                            {/* Attachments */}
                                                            {reply.attachments?.length > 0 && (
                                                                <div className="mt-1 flex flex-wrap gap-2">
                                                                    {reply.attachments.map((att) => (
                                                                        <a
                                                                            key={att.id}
                                                                            href={att.downloadUrl || "#"}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
                                                                        >
                                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                                                                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                                                                            </svg>
                                                                            {att.fileName} <span className="text-gray-400">({formatBytes(att.sizeBytes)})</span>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <span className="text-[11px] text-gray-400">{formatDateTime(reply.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={repliesEndRef} />
                                        </div>

                                        {/* Resolution note */}
                                        {selectedTicket.resolution && (
                                            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-500/20 dark:bg-green-500/10">
                                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">Resolution</p>
                                                <p className="text-sm text-green-800 dark:text-green-300">{selectedTicket.resolution}</p>
                                                {selectedTicket.resolvedAt && (
                                                    <p className="mt-1 text-xs text-green-600 dark:text-green-500">Resolved {formatDateTime(selectedTicket.resolvedAt)}</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Resolution input (shown when marking as resolved) */}
                                        {showResolutionInput && (
                                            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-500/20 dark:bg-green-500/10">
                                                <p className="mb-2 text-sm font-medium text-green-800 dark:text-green-300">
                                                    Add a resolution note (optional)
                                                </p>
                                                <textarea
                                                    value={resolution}
                                                    onChange={(e) => setResolution(e.target.value)}
                                                    rows={3}
                                                    placeholder="Describe how the issue was resolved…"
                                                    className="w-full rounded-lg border border-green-300 bg-white p-3 text-sm focus:outline-none dark:border-green-700 dark:bg-gray-900"
                                                />
                                                <div className="mt-2 flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => applyStatusChange("RESOLVED", resolution)}
                                                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                                                    >
                                                        Mark Resolved
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setShowResolutionInput(false); setPendingStatus(null); setResolution(""); }}
                                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* ── Right: Actions sidebar ───────────────── */}
                                    <div className="space-y-5 p-6">

                                        {/* Status */}
                                        <div>
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</p>
                                            <div className="flex flex-col gap-1.5">
                                                {STATUS_OPTIONS.map((s) => (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        disabled={isUpdating || selectedTicket.status === s}
                                                        onClick={() => initiateStatusChange(s)}
                                                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                                            selectedTicket.status === s
                                                                ? `${STATUS_META[s].cls} font-semibold cursor-default`
                                                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                                        } disabled:opacity-60`}
                                                    >
                                                        <span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />
                                                        {STATUS_META[s].label}
                                                        {selectedTicket.status === s && (
                                                            <svg className="ml-auto h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                                <path d="M20 6 9 17l-5-5"/>
                                                            </svg>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Priority */}
                                        <div>
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Priority</p>
                                            <select
                                                value={selectedTicket.priority}
                                                onChange={(e) => handlePriorityUpdate(e.target.value as TicketPriority)}
                                                disabled={isUpdating}
                                                className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                                            >
                                                {PRIORITY_OPTIONS.map((p) => (
                                                    <option key={p} value={p}>{PRIORITY_META[p].icon} {PRIORITY_META[p].label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Assign */}
                                        <div>
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                Assigned to
                                            </p>
                                            {selectedTicket.assignedTo ? (
                                                <div className="mb-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                                                        {((selectedTicket.assignedTo as any).adminProfile?.firstName || "A").charAt(0)}
                                                    </div>
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                            {(selectedTicket.assignedTo as any).adminProfile
                                ? `${(selectedTicket.assignedTo as any).adminProfile.firstName} ${(selectedTicket.assignedTo as any).adminProfile.lastName}`
                                : selectedTicket.assignedTo.id.slice(0, 8)}
                          </span>
                                                </div>
                                            ) : (
                                                <p className="mb-2 text-sm text-gray-400">Unassigned</p>
                                            )}

                                            <SearchSelect
                                                label=""
                                                placeholder="Reassign to…"
                                                type="user"
                                                onSelect={(id) => setAssigneeId(id)}
                                                onClear={() => setAssigneeId("")}
                                            />
                                            {assigneeId && (
                                                <button
                                                    type="button"
                                                    onClick={handleAssign}
                                                    disabled={isAssigning}
                                                    className="mt-2 w-full rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
                                                >
                                                    {isAssigning ? "Assigning…" : "Confirm Assignment"}
                                                </button>
                                            )}
                                        </div>

                                        {/* Ticket meta */}
                                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                                            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Details</p>
                                            <dl className="space-y-2 text-sm">
                                                {[
                                                    ["Category",   CATEGORY_LABELS[selectedTicket.category]],
                                                    ["Created",    formatDateTime(selectedTicket.createdAt)],
                                                    ["Updated",    formatDateTime(selectedTicket.updatedAt)],
                                                    ["Resolved",   formatDateTime(selectedTicket.resolvedAt)],
                                                    ["IP",         selectedTicket.ipAddress || "—"],
                                                ].map(([k, v]) => v && (
                                                    <div key={k} className="flex justify-between gap-2">
                                                        <dt className="text-gray-500">{k}</dt>
                                                        <dd className="truncate font-medium text-gray-700 dark:text-gray-300">{v}</dd>
                                                    </div>
                                                ))}
                                            </dl>
                                        </div>

                                        {/* Danger zone */}
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteTicket(selectedTicket.id, selectedTicket.ticketNumber)}
                                            className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                                        >
                                            Delete ticket
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Reply box ─────────────────────────────────── */}
                        {!isDetailsLoading && (
                            <div className="border-t border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950">
                <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleReply();
                    }}
                    placeholder="Write a reply… (⌘Enter to send)"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
                                <div className="mt-3 flex items-center justify-between">
                                    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <input
                                            type="checkbox"
                                            checked={isInternal}
                                            onChange={(e) => setIsInternal(e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <span>
                      Internal note
                      <span className="ml-1 text-xs text-amber-600 dark:text-amber-400">(not visible to user)</span>
                    </span>
                                    </label>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedTicket(null)}
                                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                        >
                                            Close
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleReply}
                                            disabled={!replyText.trim() || isReplying}
                                            className={`rounded-lg px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                                                isInternal
                                                    ? "bg-amber-500 hover:bg-amber-600"
                                                    : "bg-brand-500 hover:bg-brand-600"
                                            }`}
                                        >
                                            {isReplying ? (
                                                <span className="flex items-center gap-1.5">
                          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity=".25"/>
                            <path fill="currentColor" opacity=".75" d="M4 12a8 8 0 018-8v8H4z"/>
                          </svg>
                          Sending…
                        </span>
                                            ) : isInternal ? "Add Note" : "Send Reply"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {alertData && (
                <AlertModal
                    isOpen={isOpen}
                    onClose={closeAlert}
                    type={alertData.type}
                    title={alertData.title}
                    message={alertData.message}
                    onConfirm={alertData.onConfirm}
                />
            )}
        </div>
    );
}