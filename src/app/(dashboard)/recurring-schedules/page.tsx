"use client";

import React, { useEffect, useState } from "react";
import {
    listRecurringSchedules,
    createRecurringSchedule,
    cancelRecurringSchedule,
    pauseRecurringSchedule,
    resumeRecurringSchedule,
} from "@/app/api/bookings.api";
import { listCustomersForBooking } from "@/app/api/customers.api";
import { listServices } from "@/app/api/services.api";
import {
    RecurringSchedule,
    RecurrenceFrequency,
    Customer,
    Service,
} from "@/app/api/cleansera-types";

const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

export default function RecurringSchedulesPage() {
    const [schedules, setSchedules] = useState<RecurringSchedule[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        customerId: "",
        serviceId: "",
        frequency: "WEEKLY" as RecurrenceFrequency,
        dayOfWeek: 1,
        startTime: "09:00",
    });

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const [s, c, sv] = await Promise.all([
                listRecurringSchedules(),
                listCustomersForBooking(),
                listServices(),
            ]);
            setSchedules(s || []);
            setCustomers(c || []);
            setServices(sv || []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const onCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.customerId || !form.serviceId) return;
        setError("");
        try {
            await createRecurringSchedule(form);
            setForm({
                customerId: "",
                serviceId: "",
                frequency: "WEEKLY",
                dayOfWeek: 1,
                startTime: "09:00",
            });
            setShowForm(false);
            load();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to create");
        }
    };

    const withBusy = async (id: string, fn: () => Promise<unknown>) => {
        setBusyId(id);
        setError("");
        try {
            await fn();
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Action failed");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                        Recurring Schedules
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Standing cleanings that automatically create new bookings on
                        their cadence.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm((v) => !v)}
                    className="h-10 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white dark:bg-white/10"
                >
                    {showForm ? "Cancel" : "New recurring schedule"}
                </button>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}

            {showForm && (
                <form
                    onSubmit={onCreate}
                    className="grid gap-3 rounded-2xl border p-5 sm:grid-cols-5 dark:border-gray-800"
                >
                    <select
                        required
                        value={form.customerId}
                        onChange={(e) =>
                            setForm({ ...form, customerId: e.target.value })
                        }
                        className="h-11 rounded-lg border px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                    >
                        <option value="">Customer…</option>
                        {customers.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.firstName} {c.lastName}
                            </option>
                        ))}
                    </select>
                    <select
                        required
                        value={form.serviceId}
                        onChange={(e) =>
                            setForm({ ...form, serviceId: e.target.value })
                        }
                        className="h-11 rounded-lg border px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                    >
                        <option value="">Service…</option>
                        {services.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={form.frequency}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                frequency: e.target.value as RecurrenceFrequency,
                            })
                        }
                        className="h-11 rounded-lg border px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                    >
                        <option value="WEEKLY">Weekly</option>
                        <option value="BIWEEKLY">Every 2 weeks</option>
                        <option value="MONTHLY">Monthly</option>
                    </select>
                    <select
                        value={form.dayOfWeek}
                        onChange={(e) =>
                            setForm({ ...form, dayOfWeek: Number(e.target.value) })
                        }
                        className="h-11 rounded-lg border px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                    >
                        {DAYS.map((d, i) => (
                            <option key={d} value={i}>
                                {d}
                            </option>
                        ))}
                    </select>
                    <input
                        type="time"
                        required
                        value={form.startTime}
                        onChange={(e) =>
                            setForm({ ...form, startTime: e.target.value })
                        }
                        className="h-11 rounded-lg border px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                    />
                    <button
                        type="submit"
                        className="col-span-full h-11 rounded-lg bg-gray-900 text-sm font-medium text-white dark:bg-white/10"
                    >
                        Create schedule
                    </button>
                </form>
            )}

            <div className="overflow-x-auto rounded-2xl border dark:border-gray-800">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 dark:bg-white/5">
                        <tr>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Service</th>
                            <th className="p-3">Cadence</th>
                            <th className="p-3">Next run</th>
                            <th className="p-3">Status</th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={6} className="p-4 text-center text-gray-400">
                                    Loading…
                                </td>
                            </tr>
                        )}
                        {!loading && schedules.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-4 text-center text-gray-400">
                                    No recurring schedules yet.
                                </td>
                            </tr>
                        )}
                        {schedules.map((s) => (
                            <tr
                                key={s.id}
                                className="border-t dark:border-gray-800"
                            >
                                <td className="p-3">
                                    {s.customer
                                        ? `${s.customer.firstName} ${s.customer.lastName}`
                                        : s.customerId}
                                </td>
                                <td className="p-3">
                                    {s.service?.name || s.serviceId}
                                </td>
                                <td className="p-3">
                                    {s.frequency === "WEEKLY"
                                        ? "Weekly"
                                        : s.frequency === "BIWEEKLY"
                                        ? "Every 2 weeks"
                                        : "Monthly"}{" "}
                                    · {DAYS[s.dayOfWeek]} {s.startTime}
                                </td>
                                <td className="p-3">
                                    {new Date(s.nextRunDate).toLocaleDateString()}
                                </td>
                                <td className="p-3">
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                            s.isActive
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-gray-100 text-gray-500 dark:bg-white/10"
                                        }`}
                                    >
                                        {s.isActive ? "Active" : "Paused"}
                                    </span>
                                </td>
                                <td className="space-x-2 p-3 text-right">
                                    {s.isActive ? (
                                        <button
                                            disabled={busyId === s.id}
                                            onClick={() =>
                                                withBusy(s.id, () =>
                                                    pauseRecurringSchedule(s.id)
                                                )
                                            }
                                            className="text-xs font-medium text-amber-600 disabled:opacity-40"
                                        >
                                            Pause
                                        </button>
                                    ) : (
                                        <button
                                            disabled={busyId === s.id}
                                            onClick={() =>
                                                withBusy(s.id, () =>
                                                    resumeRecurringSchedule(s.id)
                                                )
                                            }
                                            className="text-xs font-medium text-green-600 disabled:opacity-40"
                                        >
                                            Resume
                                        </button>
                                    )}
                                    <button
                                        disabled={busyId === s.id}
                                        onClick={() => {
                                            if (
                                                !confirm(
                                                    "Cancel this recurring schedule? This can't be undone."
                                                )
                                            )
                                                return;
                                            withBusy(s.id, () =>
                                                cancelRecurringSchedule(s.id)
                                            );
                                        }}
                                        className="text-xs font-medium text-red-600 disabled:opacity-40"
                                    >
                                        Cancel
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
