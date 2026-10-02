"use client";

import { Fragment, useEffect, useState } from "react";
import {
  listInquiries,
  updateInquiryStatus,
  type InquiryStatus,
  type Pagination,
  type PlatformInquiry,
} from "@/app/api/superAdmin.api";

const STATUSES: InquiryStatus[] = ["NEW", "IN_PROGRESS", "RESOLVED", "SPAM"];

const KIND_LABEL: Record<string, string> = { SUPPORT: "Support", DEMO: "Demo request" };

const STATUS_STYLE: Record<InquiryStatus, string> = {
  NEW: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400",
  IN_PROGRESS: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  RESOLVED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  SPAM: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

function replyHref(i: PlatformInquiry) {
  const subject = `Re: ${i.subject || (i.kind === "DEMO" ? "your demo request" : "your message")} [${i.reference}]`;
  return `mailto:${i.email}?subject=${encodeURIComponent(subject)}`;
}

export default function SuperAdminInquiriesPage() {
  const [items, setItems] = useState<PlatformInquiry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [newCount, setNewCount] = useState(0);
  const [status, setStatus] = useState("");
  const [kind, setKind] = useState("");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  // Bumped to force a reload (after a status change).
  const [reloadKey, setReloadKey] = useState(0);

  // Loading state is switched on by the handlers that change what is shown, so
  // this effect only syncs with the network - and a slow earlier response can
  // never overwrite a newer one.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await listInquiries({
          status: status || undefined,
          kind: kind || undefined,
          q: search || undefined,
          page,
          limit: 20,
        });
        if (cancelled) return;
        setItems(res.data);
        setPagination(res.pagination);
        setNewCount(res.newCount);
        setError("");
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load inquiries");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, kind, search, page, reloadKey]);

  /** Change a filter or the page: show the spinner, go back to page 1 for filters. */
  const show = (apply: () => void, resetPage = true) => {
    setLoading(true);
    if (resetPage) setPage(1);
    apply();
  };

  const changeStatus = async (i: PlatformInquiry, next: InquiryStatus) => {
    if (next === i.status) return;
    setBusyId(i.id);
    try {
      await updateInquiryStatus(i.id, next);
      setLoading(true);
      setReloadKey((k) => k + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const selectClass =
    "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Inquiries
          {newCount > 0 && (
            <span className="ml-2 rounded-full bg-brand-500 px-2 py-0.5 align-middle text-xs font-medium text-white">
              {newCount} new
            </span>
          )}
        </h1>
        <p className="text-sm text-gray-500">
          Support messages and demo requests from the marketing site. Reply by email; the sender sees your address.
        </p>
      </div>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          show(() => setSearch(query.trim()));
        }}
      >
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => show(() => setStatus(e.target.value))}
          className={selectClass}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by type"
          value={kind}
          onChange={(e) => show(() => setKind(e.target.value))}
          className={selectClass}
        >
          <option value="">All types</option>
          <option value="SUPPORT">Support</option>
          <option value="DEMO">Demo request</option>
        </select>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, company, reference"
          aria-label="Search inquiries"
          className={`${selectClass} min-w-[16rem] flex-1`}
        />
        <button type="submit" className="rounded-lg border px-3 py-2 text-sm">
          Search
        </button>
      </form>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((i) => {
                const open = openId === i.id;
                return (
                  <Fragment key={i.id}>
                    <tr className={i.status === "NEW" ? "bg-brand-50/40 dark:bg-brand-500/5" : undefined}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">{i.name}</div>
                        <div className="text-xs text-gray-500">{i.email}</div>
                        {i.company && <div className="text-xs text-gray-500">{i.company}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {KIND_LABEL[i.kind] || i.kind}
                        {i.category && <div className="text-gray-400">{i.category}</div>}
                      </td>
                      <td className="max-w-md px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setOpenId(open ? null : i.id)}
                          aria-expanded={open}
                          className="text-left text-gray-700 hover:underline dark:text-gray-300"
                        >
                          <span className="line-clamp-2">
                            {i.subject ? `${i.subject} — ` : ""}
                            {i.message || "(no message)"}
                          </span>
                        </button>
                        <div className="mt-1 text-xs text-gray-400">{i.reference}</div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          aria-label={`Status for ${i.name}`}
                          value={i.status}
                          disabled={busyId === i.id}
                          onChange={(e) => changeStatus(i, e.target.value as InquiryStatus)}
                          className={`rounded border-0 px-2 py-1 text-xs font-medium ${STATUS_STYLE[i.status]}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{new Date(i.createdAt).toLocaleString()}</td>
                    </tr>
                    {open && (
                      <tr className="bg-gray-50 dark:bg-white/[0.02]">
                        <td colSpan={5} className="px-4 py-4">
                          <p className="whitespace-pre-wrap break-words text-sm text-gray-800 dark:text-gray-200">
                            {i.message || "(no message)"}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            {i.phone && <span>Phone: {i.phone}</span>}
                            {i.source && <span>Source: {i.source}</span>}
                            <a
                              href={replyHref(i)}
                              className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
                            >
                              Reply by email
                            </a>
                            {!i.notifiedAt && (
                              <span className="text-amber-600">
                                Team was not emailed about this — check PLATFORM_INBOX_EMAIL and the mail provider.
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No inquiries
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
              onClick={() => show(() => setPage((p) => Math.max(1, p - 1)), false)}
              className="rounded-lg border px-3 py-1 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => show(() => setPage((p) => p + 1), false)}
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
