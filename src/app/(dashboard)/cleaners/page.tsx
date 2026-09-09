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
  listCleaners,
  onboardCleaner,
  offboardCleaner,
} from "@/app/api/cleaners.api";
import { Cleaner, CleanerStatus, cleanerDisplayName } from "@/app/api/cleansera-types";

const STATUS_COLOR: Record<CleanerStatus, "success" | "warning" | "error" | "light"> = {
  ACTIVE: "success",
  PENDING: "warning",
  SUSPENDED: "warning",
  OFFBOARDED: "light",
};

const STATUS_FILTERS: (CleanerStatus | "ALL")[] = ["ALL", "ACTIVE", "PENDING", "SUSPENDED", "OFFBOARDED"];

export default function CleanersPage() {
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [statusFilter, setStatusFilter] = useState<CleanerStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showOffboardModal, setShowOffboardModal] = useState<Cleaner | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", hireDate: "" });
  const [offboardReason, setOffboardReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listCleaners(statusFilter === "ALL" ? undefined : statusFilter);
      setCleaners(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cleaners");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onboardCleaner({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        hireDate: form.hireDate || undefined,
      });
      setShowOnboardModal(false);
      setForm({ firstName: "", lastName: "", email: "", phone: "", hireDate: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to onboard cleaner");
    } finally {
      setSaving(false);
    }
  };

  const handleOffboard = async () => {
    if (!showOffboardModal) return;
    setSaving(true);
    setError("");
    try {
      await offboardCleaner(showOffboardModal.id, offboardReason || undefined);
      setShowOffboardModal(null);
      setOffboardReason("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to offboard cleaner");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Cleaners</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cleaners you onboard here belong only to your business — there's no cross-business marketplace.
          </p>
        </div>
        <Button onClick={() => setShowOnboardModal(true)}>Onboard Cleaner</Button>
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
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Name</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Email</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Phone</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Hired</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading && (
                <TableRow>
                  <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={6}>Loading…</TableCell>
                </TableRow>
              )}
              {!loading && cleaners.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={6}>No cleaners yet</TableCell>
                </TableRow>
              )}
              {!loading &&
                cleaners.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      {cleanerDisplayName(c)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{c.user.email}</TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{c.user.phone || "—"}</TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {c.hireDate ? new Date(c.hireDate).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge color={STATUS_COLOR[c.status]} size="sm">{c.status}</Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      {c.status === "ACTIVE" && (
                        <button
                          onClick={() => setShowOffboardModal(c)}
                          className="text-sm font-medium text-error-500 hover:text-error-600"
                        >
                          Offboard
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Onboard modal */}
      <Modal isOpen={showOnboardModal} onClose={() => setShowOnboardModal(false)} className="max-w-md p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Onboard a Cleaner</h2>
        <form onSubmit={handleOnboard} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <Label>Hire Date</Label>
            <Input type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowOnboardModal(false)} type="button">Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Onboarding…" : "Onboard"}</Button>
          </div>
        </form>
      </Modal>

      {/* Offboard modal */}
      <Modal isOpen={!!showOffboardModal} onClose={() => setShowOffboardModal(null)} className="max-w-md p-6">
        <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
          Offboard {showOffboardModal ? cleanerDisplayName(showOffboardModal) : ""}
        </h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          This ends their active status with your business. Past bookings and reviews are kept.
        </p>
        <Label>Reason (optional)</Label>
        <Input value={offboardReason} onChange={(e) => setOffboardReason(e.target.value)} />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setShowOffboardModal(null)} type="button">Cancel</Button>
          <Button onClick={handleOffboard} disabled={saving}>{saving ? "Offboarding…" : "Confirm Offboard"}</Button>
        </div>
      </Modal>
    </div>
  );
}
