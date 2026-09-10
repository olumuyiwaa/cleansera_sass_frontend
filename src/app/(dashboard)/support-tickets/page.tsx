"use client";

import React, { useEffect, useState } from "react";
import {
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
  addTicketMessage,
  deleteTicket,
} from "@/app/api/supportTickets.api";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_ON_CUSTOMER" | "RESOLVED" | "CLOSED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type Ticket = {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category?: string | null;
  customerId?: string | null;
  bookingId?: string | null;
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  messages?: TicketMessage[];
};

type TicketMessage = {
  id: string;
  body: string;
  isInternal: boolean;
  authorId?: string | null;
  createdAt: string;
};

const STATUS_OPTIONS: TicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING_ON_CUSTOMER", "RESOLVED", "CLOSED"];
const PRIORITY_OPTIONS: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const CATEGORY_OPTIONS = [
  { value: "ACCOUNT_ACCESS", label: "Account & Access" },
  { value: "CREDENTIALS", label: "Credentials" },
  { value: "SHIFTS_SCHEDULING", label: "Shifts & Scheduling" },
  { value: "PAYMENTS_BILLING", label: "Payments & Billing" },
  { value: "TECHNICAL", label: "Technical" },
  { value: "OTHER", label: "Other" },
];

const STATUS_CLS: Record<TicketStatus, string> = {
  OPEN: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  IN_PROGRESS: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300",
  WAITING_ON_CUSTOMER: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300",
  RESOLVED: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300",
  CLOSED: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};

const PRIORITY_CLS: Record<TicketPriority, string> = {
  URGENT: "text-red-600 font-semibold",
  HIGH: "text-orange-600 font-medium",
  MEDIUM: "text-amber-600",
  LOW: "text-gray-500",
};

function fmt(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

const inputCls =
  "h-11 w-full rounded-lg border px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    subject: "",
    description: "",
    priority: "MEDIUM" as TicketPriority,
    category: "OTHER",
    customerId: "",
    bookingId: "",
  });
  const [creating, setCreating] = useState(false);

  const [selected, setSelected] = useState<Ticket | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replyInternal, setReplyInternal] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  const load = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await listTickets({
        q: q || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        page,
        limit: pagination.limit,
      });
      if (!res.success) throw new Error(res.message);
      setTickets(res.data?.data || []);
      setPagination(res.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (e: any) {
      setError(e.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openTicket = async (id: string) => {
    setSelectedLoading(true);
    try {
      const res = await getTicket(id);
      if (!res.success) throw new Error(res.message);
      setSelected(res.data);
    } catch (e: any) {
      setError(e.message || "Failed to load ticket");
    } finally {
      setSelectedLoading(false);
    }
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await createTicket({
        subject: createForm.subject,
        description: createForm.description,
        priority: createForm.priority,
        category: createForm.category,
        customerId: createForm.customerId || undefined,
        bookingId: createForm.bookingId || undefined,
      });
      if (!res.success) throw new Error(res.message);
      setShowCreate(false);
      setCreateForm({ subject: "", description: "", priority: "MEDIUM", category: "OTHER", customerId: "", bookingId: "" });
      load(1);
    } catch (e: any) {
      setError(e.message || "Failed to create ticket");
    } finally {
      setCreating(false);
    }
  };

  const patchSelected = async (patch: Record<string, unknown>) => {
    if (!selected) return;
    try {
      const res = await updateTicket(selected.id, patch);
      if (!res.success) throw new Error(res.message);
      setSelected({ ...selected, ...res.data });
      load(pagination.page);
    } catch (e: any) {
      setError(e.message || "Failed to update ticket");
    }
  };

  const sendReply = async () => {
    if (!selected || !replyBody.trim()) return;
    setSendingReply(true);
    try {
      const res = await addTicketMessage(selected.id, replyBody.trim(), replyInternal);
      if (!res.success) throw new Error(res.message);
      setReplyBody("");
      setReplyInternal(false);
      await openTicket(selected.id);
    } catch (e: any) {
      setError(e.message || "Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const removeTicket = async (id: string) => {
    if (!confirm("Delete this ticket? This cannot be undone.")) return;
    try {
      const res = await deleteTicket(id);
      if (!res.success) throw new Error(res.message);
      if (selected?.id === id) setSelected(null);
      load(pagination.page);
    } catch (e: any) {
      setError(e.message || "Failed to delete ticket");
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Support Tickets</h1>
          <p className="mt-1 text-sm text-gray-500">Track and resolve issues raised for your business</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate((s) => !s)}
          className="h-11 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white"
        >
          {showCreate ? "Cancel" : "New ticket"}
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10">{error}</div>}

      {showCreate && (
        <form onSubmit={onCreate} className="grid gap-3 rounded-2xl border p-5 sm:grid-cols-2 dark:border-gray-800">
          <input
            required
            placeholder="Subject"
            value={createForm.subject}
            onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
            className={`${inputCls} sm:col-span-2`}
          />
          <textarea
            required
            placeholder="Describe the issue"
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            className={`${inputCls} h-28 py-2 sm:col-span-2`}
          />
          <select
            value={createForm.priority}
            onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value as TicketPriority })}
            className={inputCls}
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={createForm.category}
            onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
            className={inputCls}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <input
            placeholder="Related customer ID (optional)"
            value={createForm.customerId}
            onChange={(e) => setCreateForm({ ...createForm, customerId: e.target.value })}
            className={inputCls}
          />
          <input
            placeholder="Related booking ID (optional)"
            value={createForm.bookingId}
            onChange={(e) => setCreateForm({ ...createForm, bookingId: e.target.value })}
            className={inputCls}
          />
          <button
            type="submit"
            disabled={creating}
            className="h-11 rounded-lg bg-brand-500 text-sm font-medium text-white disabled:opacity-60 sm:col-span-2"
          >
            {creating ? "Creating…" : "Create ticket"}
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-3">
        <input
          placeholder="Search subject or description…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(1)}
          className={`${inputCls} max-w-xs`}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputCls} max-w-[180px]`}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={`${inputCls} max-w-[160px]`}>
          <option value="">All priorities</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button type="button" onClick={() => load(1)} className="h-11 rounded-lg border px-4 text-sm dark:border-gray-700">
          Apply
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border dark:border-gray-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-white/[0.03]">
              <tr>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  className="cursor-pointer border-t hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]"
                  onClick={() => openTicket(t.id)}
                >
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">{t.subject}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLS[t.status]}`}>
                      {t.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-xs ${PRIORITY_CLS[t.priority]}`}>{t.priority}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {CATEGORY_OPTIONS.find((c) => c.value === t.category)?.label || t.category || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{fmt(t.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="text-red-600 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTicket(t.id);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!tickets.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No tickets yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-gray-500 dark:border-gray-800">
              <span>Page {pagination.page} of {pagination.totalPages} · {pagination.total} tickets</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => load(pagination.page - 1)}
                  className="rounded border px-3 py-1 disabled:opacity-40 dark:border-gray-700"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => load(pagination.page + 1)}
                  className="rounded border px-3 py-1 disabled:opacity-40 dark:border-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedLoading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">{selected.subject}</h2>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">{selected.description}</p>
                  </div>
                  <button type="button" onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                    ✕
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Status</label>
                    <select
                      value={selected.status}
                      onChange={(e) => patchSelected({ status: e.target.value })}
                      className={inputCls}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Priority</label>
                    <select
                      value={selected.priority}
                      onChange={(e) => patchSelected({ priority: e.target.value })}
                      className={inputCls}
                    >
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Category</label>
                    <select
                      value={selected.category || "OTHER"}
                      onChange={(e) => patchSelected({ category: e.target.value })}
                      className={inputCls}
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Messages</h3>
                  <div className="mt-2 max-h-64 space-y-3 overflow-y-auto">
                    {(selected.messages || []).map((m) => (
                      <div
                        key={m.id}
                        className={`rounded-lg p-3 text-sm ${
                          m.isInternal
                            ? "bg-amber-50 dark:bg-amber-500/10"
                            : "bg-gray-50 dark:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{m.isInternal ? "Internal note" : "Reply"}</span>
                          <span>{fmt(m.createdAt)}</span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-gray-700 dark:text-gray-200">{m.body}</p>
                      </div>
                    ))}
                    {!selected.messages?.length && (
                      <p className="text-sm text-gray-400">No messages yet</p>
                    )}
                  </div>

                  <div className="mt-3 space-y-2">
                    <textarea
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder="Write a reply…"
                      className={`${inputCls} h-20 py-2`}
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-gray-500">
                        <input
                          type="checkbox"
                          checked={replyInternal}
                          onChange={(e) => setReplyInternal(e.target.checked)}
                        />
                        Internal note (not visible to customer)
                      </label>
                      <button
                        type="button"
                        disabled={sendingReply || !replyBody.trim()}
                        onClick={sendReply}
                        className="h-9 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white disabled:opacity-60"
                      >
                        {sendingReply ? "Sending…" : "Send"}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
