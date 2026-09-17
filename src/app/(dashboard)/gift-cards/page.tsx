"use client";

import React, { useEffect, useState } from "react";
import {
  listGiftCards,
  issueGiftCard,
  deactivateGiftCard,
  type GiftCard,
} from "@/app/api/giftCards.api";

function centsToDollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function GiftCardsPage() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    code: "",
    valueDollars: 50,
    recipientName: "",
    recipientEmail: "",
    message: "",
    expiresAt: "",
  });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listGiftCards();
      setGiftCards((res.data as GiftCard[]) || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load gift cards");
      setGiftCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await issueGiftCard({
        code: form.code.trim() ? form.code.trim().toUpperCase() : undefined,
        initialValueCents: Math.round(Number(form.valueDollars) * 100),
        recipientName: form.recipientName.trim() || undefined,
        recipientEmail: form.recipientEmail.trim() || undefined,
        message: form.message.trim() || undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      });
      setForm({ code: "", valueDollars: 50, recipientName: "", recipientEmail: "", message: "", expiresAt: "" });
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to issue gift card");
    } finally {
      setBusy(false);
    }
  };

  const onDeactivate = async (id: string) => {
    if (!confirm("Deactivate this gift card? Its remaining balance will no longer be redeemable.")) return;
    setError("");
    try {
      await deactivateGiftCard(id);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to deactivate gift card");
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Gift Cards</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Issue a stored-value card a customer can redeem, in full or in part, against any future booking.
          Customers apply a code at checkout in the booking widget.
        </p>
      </div>

      <form
        onSubmit={onIssue}
        className="grid gap-3 rounded-2xl border border-gray-200 p-5 sm:grid-cols-2 lg:grid-cols-6 dark:border-gray-800"
      >
        <input
          placeholder="Code (auto-generated if blank)"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          className="h-11 rounded-lg border border-gray-300 px-3 text-sm uppercase dark:border-gray-700 dark:bg-gray-900 dark:text-white lg:col-span-2"
        />
        <input
          type="number"
          min={1}
          step="0.01"
          required
          value={form.valueDollars}
          onChange={(e) => setForm({ ...form, valueDollars: Number(e.target.value) })}
          placeholder="Value ($)"
          className="h-11 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
        <input
          placeholder="Recipient name (optional)"
          value={form.recipientName}
          onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
          className="h-11 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
        <input
          type="email"
          placeholder="Recipient email (optional)"
          value={form.recipientEmail}
          onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
          className="h-11 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
        <input
          type="date"
          value={form.expiresAt}
          onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
          title="Optional expiry"
          className="h-11 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
        <input
          placeholder="Gift message (optional)"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="h-11 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white lg:col-span-4"
        />
        <button
          type="submit"
          disabled={busy}
          className="h-11 rounded-lg bg-brand-500 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60 lg:col-span-2"
        >
          {busy ? "Issuing…" : "Issue gift card"}
        </button>
      </form>

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
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Initial Value</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {giftCards.map((g) => (
                <tr key={g.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3 font-mono font-medium">{g.code}</td>
                  <td className="px-4 py-3">{g.recipientName || g.recipientEmail || "—"}</td>
                  <td className="px-4 py-3">{centsToDollars(g.balanceCents)}</td>
                  <td className="px-4 py-3 text-gray-500">{centsToDollars(g.initialValueCents)}</td>
                  <td className="px-4 py-3">{g.isActive ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {g.expiresAt ? new Date(g.expiresAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {g.isActive && (
                      <button
                        type="button"
                        className="text-red-600 hover:underline"
                        onClick={() => onDeactivate(g.id)}
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!giftCards.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No gift cards yet
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
