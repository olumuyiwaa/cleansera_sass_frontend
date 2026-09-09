"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addAddress,
} from "@/app/api/customers.api";

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
  addresses?: any[];
  _count?: { bookings?: number };
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listCustomers({ q: q || undefined, take: 100 });
      if (!res.success) throw new Error(res.message || "Failed");
      setCustomers(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (id: string) => {
    const res = await getCustomer(id);
    if (res.success) setSelected(res.data);
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createCustomer(form);
    if (!res.success) {
      setError(res.message || "Create failed");
      return;
    }
    setShowCreate(false);
    setForm({ firstName: "", lastName: "", phone: "", email: "", notes: "" });
    load();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this customer?")) return;
    await deleteCustomer(id);
    setSelected(null);
    load();
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Customers</h1>
          <p className="mt-1 text-sm text-gray-500">CRM — search, view history, manage addresses</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          + Add customer
        </button>
      </div>

      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, phone, email..."
          className="h-11 flex-1 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        <button type="button" onClick={load} className="rounded-lg border px-4 text-sm">
          Search
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-white/[0.03]">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Bookings</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3">
                    {c.firstName} {c.lastName}
                  </td>
                  <td className="px-4 py-3">{c.phone}</td>
                  <td className="px-4 py-3">{c.email || "—"}</td>
                  <td className="px-4 py-3">{c._count?.bookings ?? "—"}</td>
                  <td className="px-4 py-3">
                    <button type="button" className="text-brand-500 hover:underline" onClick={() => openDetail(c.id)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {!customers.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No customers yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={onCreate} className="w-full max-w-md space-y-3 rounded-2xl bg-white p-6 dark:bg-gray-900">
            <h2 className="text-lg font-semibold">New customer</h2>
            {(["firstName", "lastName", "phone", "email"] as const).map((k) => (
              <input
                key={k}
                required={k !== "email"}
                placeholder={k}
                value={(form as any)[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                className="h-11 w-full rounded-lg border px-3 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            ))}
            <textarea
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-lg border px-4 py-2 text-sm">
                Cancel
              </button>
              <button type="submit" className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white">
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-900">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {selected.firstName} {selected.lastName}
                </h2>
                <p className="text-sm text-gray-500">
                  {selected.phone} · {selected.email || "no email"}
                </p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="text-gray-400">
                ✕
              </button>
            </div>
            {selected.notes && <p className="mt-3 text-sm">{selected.notes}</p>}
            <h3 className="mt-4 text-sm font-semibold">Addresses</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {(selected.addresses || []).map((a: any) => (
                <li key={a.id}>
                  {a.line1}, {a.city}, {a.state}
                </li>
              ))}
              {!selected.addresses?.length && <li className="text-gray-500">No addresses</li>}
            </ul>
            <h3 className="mt-4 text-sm font-semibold">Recent bookings</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {(selected.bookings || []).slice(0, 5).map((b: any) => (
                <li key={b.id}>
                  {new Date(b.scheduledStart).toLocaleString()} — {b.status}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => onDelete(selected.id)}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600"
              >
                Delete
              </button>
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg border px-4 py-2 text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
