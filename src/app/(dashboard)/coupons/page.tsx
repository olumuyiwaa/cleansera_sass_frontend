"use client";

import React, { useEffect, useState } from "react";
import { listCoupons, createCoupon, deleteCoupon } from "@/app/api/coupons.api";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    code: "",
    type: "PERCENT" as "PERCENT" | "AMOUNT",
    value: 10,
    expiresAt: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await listCoupons();
      if (!res.success) throw new Error(res.message);
      setCoupons(res.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createCoupon({
      code: form.code.toUpperCase(),
      type: form.type,
      value: Number(form.value),
      expiresAt: form.expiresAt || undefined,
    });
    if (!res.success) {
      setError(res.message || "Failed");
      return;
    }
    setForm({ code: "", type: "PERCENT", value: 10, expiresAt: "" });
    load();
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Coupons</h1>
        <p className="mt-1 text-sm text-gray-500">Discount codes for the booking widget</p>
      </div>

      <form onSubmit={onCreate} className="grid gap-3 rounded-2xl border p-5 sm:grid-cols-4 dark:border-gray-800">
        <input
          required
          placeholder="CODE"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          className="h-11 rounded-lg border px-3 text-sm uppercase dark:border-gray-700 dark:bg-gray-900"
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as any })}
          className="h-11 rounded-lg border px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
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
          className="h-11 rounded-lg border px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        <button type="submit" className="h-11 rounded-lg bg-brand-500 text-sm font-medium text-white">
          Create coupon
        </button>
      </form>

      {error && <div className="text-sm text-red-600">{error}</div>}
      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border dark:border-gray-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-white/[0.03]">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Redeemed</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-t dark:border-gray-800">
                  <td className="px-4 py-3 font-mono">{c.code}</td>
                  <td className="px-4 py-3">{c.type}</td>
                  <td className="px-4 py-3">{c.type === "PERCENT" ? `${c.value}%` : c.value}</td>
                  <td className="px-4 py-3">{c.isActive ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">{c.redeemedCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-red-600 hover:underline"
                      onClick={async () => {
                        await deleteCoupon(c.id);
                        load();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!coupons.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
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
