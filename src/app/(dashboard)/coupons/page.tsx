"use client";

import React, { useEffect, useState } from "react";
import {
  listCoupons,
  createCoupon,
  deleteCoupon,
  type Coupon,
  type CouponType,
} from "@/app/api/coupons.api";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "PERCENT" as CouponType,
    value: 10,
    expiresAt: "",
  });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listCoupons();
      setCoupons((res.data as Coupon[]) || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load coupons");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await createCoupon({
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      });
      setForm({ code: "", type: "PERCENT", value: 10, expiresAt: "" });
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create coupon");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Deactivate this coupon? Existing bookings that used it are unaffected.")) return;
    setError("");
    try {
      await deleteCoupon(id);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete coupon");
    }
  };

  return (
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Coupons</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Discount codes for the booking widget
          </p>
        </div>

        <form
            onSubmit={onCreate}
            className="grid gap-3 rounded-2xl border border-gray-200 p-5 sm:grid-cols-2 lg:grid-cols-5 dark:border-gray-800"
        >
          <input
              required
              placeholder="CODE"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="h-11 rounded-lg border border-gray-300 px-3 text-sm uppercase dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as CouponType })}
              className="h-11 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="PERCENT">Percent %</option>
            <option value="AMOUNT">Fixed amount (cents)</option>
          </select>
          <input
              type="number"
              min={0}
              required
              value={form.value}
              onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
              className="h-11 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              placeholder={form.type === "PERCENT" ? "e.g. 10" : "e.g. 500"}
          />
          <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              className="h-11 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              title="Optional expiry"
          />
          <button
              type="submit"
              disabled={busy}
              className="h-11 rounded-lg bg-brand-500 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create coupon"}
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
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3">Redeemed</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3" />
                </tr>
                </thead>
                <tbody>
                {coupons.map((c) => (
                    <tr key={c.id} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                      <td className="px-4 py-3">{c.type}</td>
                      <td className="px-4 py-3">
                        {c.type === "PERCENT" ? `${c.value}%` : `${c.value} cents`}
                      </td>
                      <td className="px-4 py-3">{c.isActive ? "Yes" : "No"}</td>
                      <td className="px-4 py-3">{c.redeemedCount ?? 0}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {c.isActive && (
                            <button
                                type="button"
                                className="text-red-600 hover:underline"
                                onClick={() => onDelete(c.id)}
                            >
                              Deactivate
                            </button>
                        )}
                      </td>
                    </tr>
                ))}
                {!coupons.length && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No coupons yet
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