"use client";

import { useEffect, useState, useCallback } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import {
  listBookings,
  createBooking,
  confirmBooking,
  completeBooking,
  assignBookingCleaner,
} from "@/app/api/bookings.api";
import { listCustomers, createCustomer } from "@/app/api/customers.api";
import { listServices } from "@/app/api/services.api";
import { Booking, BookingStatus, Customer, Service, formatMoney } from "@/app/api/cleansera-types";

const STATUS_COLOR: Record<BookingStatus, "success" | "warning" | "error" | "light" | "info"> = {
  REQUESTED: "warning",
  CONFIRMED: "info",
  ASSIGNED: "info",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "light",
};

const STATUS_FILTERS: (BookingStatus | "ALL")[] = [
  "ALL", "REQUESTED", "CONFIRMED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED",
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCustomerMode, setNewCustomerMode] = useState(false);

  const [form, setForm] = useState({
    customerId: "",
    newCustomer: { firstName: "", lastName: "", phone: "", email: "" },
    serviceId: "",
    addressLine1: "",
    city: "",
    state: "",
    scheduledStart: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [b, c, s] = await Promise.all([
        listBookings(statusFilter === "ALL" ? undefined : statusFilter),
        listCustomers(),
        listServices(),
      ]);
      setBookings(b);
      setCustomers(c);
      setServices(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let customerId = form.customerId;
      if (newCustomerMode) {
        const created = await createCustomer(form.newCustomer);
        customerId = created.id;
      }
      await createBooking({
        customerId,
        serviceId: form.serviceId,
        addressLine1: form.addressLine1,
        city: form.city,
        state: form.state,
        scheduledStart: new Date(form.scheduledStart).toISOString(),
      });
      setShowCreateModal(false);
      setForm({
        customerId: "", newCustomer: { firstName: "", lastName: "", phone: "", email: "" },
        serviceId: "", addressLine1: "", city: "", state: "", scheduledStart: "",
      });
      setNewCustomerMode(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async (id: string) => {
    setError("");
    try {
      await confirmBooking(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm booking");
    }
  };

  const handleComplete = async (id: string) => {
    setError("");
    try {
      await completeBooking(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete booking");
    }
  };

  const handleAutoAssign = async (id: string) => {
    setError("");
    try {
      await assignBookingCleaner(id); // no cleanerId -> backend auto-selects
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign a cleaner");
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Bookings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            One-time and recurring cleaning jobs for your customers.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>New Booking</Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              statusFilter === s
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300"
            }`}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase().replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Customer</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Service</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Scheduled</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Price</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading && (
                <TableRow><TableCell className="px-5 py-6 text-center text-gray-500" colSpan={6}>Loading…</TableCell></TableRow>
              )}
              {!loading && bookings.length === 0 && (
                <TableRow><TableCell className="px-5 py-6 text-center text-gray-500" colSpan={6}>No bookings yet</TableCell></TableRow>
              )}
              {!loading &&
                bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      {b.customer ? `${b.customer.firstName} ${b.customer.lastName}` : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{b.service?.name || "—"}</TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(b.scheduledStart).toLocaleString()}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatMoney(b.quotedPriceCents)}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge color={STATUS_COLOR[b.status]} size="sm">{b.status}</Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 space-x-3">
                      {b.status === "REQUESTED" && (
                        <button onClick={() => handleConfirm(b.id)} className="text-sm font-medium text-brand-500 hover:text-brand-600">
                          Confirm
                        </button>
                      )}
                      {(b.status === "CONFIRMED") && (
                        <button onClick={() => handleAutoAssign(b.id)} className="text-sm font-medium text-brand-500 hover:text-brand-600">
                          Auto-assign
                        </button>
                      )}
                      {(b.status === "ASSIGNED" || b.status === "IN_PROGRESS") && (
                        <button onClick={() => handleComplete(b.id)} className="text-sm font-medium text-success-500 hover:text-success-600">
                          Mark Complete
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create booking modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} className="max-w-lg p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">New Booking</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Customer</Label>
              <button
                type="button"
                onClick={() => setNewCustomerMode(!newCustomerMode)}
                className="text-xs font-medium text-brand-500 hover:text-brand-600"
              >
                {newCustomerMode ? "Choose existing customer" : "+ New customer"}
              </button>
            </div>

            {!newCustomerMode ? (
              <select
                value={form.customerId}
                onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">Select a customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.phone}</option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="First name" value={form.newCustomer.firstName}
                  onChange={(e) => setForm({ ...form, newCustomer: { ...form.newCustomer, firstName: e.target.value } })} required />
                <Input placeholder="Last name" value={form.newCustomer.lastName}
                  onChange={(e) => setForm({ ...form, newCustomer: { ...form.newCustomer, lastName: e.target.value } })} required />
                <Input placeholder="Phone" value={form.newCustomer.phone}
                  onChange={(e) => setForm({ ...form, newCustomer: { ...form.newCustomer, phone: e.target.value } })} required />
                <Input placeholder="Email (optional)" value={form.newCustomer.email}
                  onChange={(e) => setForm({ ...form, newCustomer: { ...form.newCustomer, email: e.target.value } })} />
              </div>
            )}
          </div>

          <div>
            <Label>Service</Label>
            <select
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
              required
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Select a service…</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {formatMoney(s.basePriceCents)}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Address</Label>
            <Input placeholder="Address line 1" value={form.addressLine1}
              onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            <Input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
          </div>

          <div>
            <Label>Scheduled Start</Label>
            <Input type="datetime-local" value={form.scheduledStart} onChange={(e) => setForm({ ...form, scheduledStart: e.target.value })} required />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create Booking"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
