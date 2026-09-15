"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
import Select from "@/components/form/Select";
import { listCleaners } from "@/app/api/cleaners.api";
import {
  listCompensations,
  setCompensation,
  listEarnings,
  listPayouts,
  createPayout,
  markPayoutPaid,
} from "@/app/api/payroll.api";
import {
  Cleaner,
  CleanerCompensation,
  CleanerEarning,
  Payout,
  CompensationType,
  cleanerDisplayName,
  compensationLabel,
  formatMoney,
} from "@/app/api/cleansera-types";

const PAYOUT_STATUS_COLOR: Record<Payout["status"], "warning" | "success" | "light"> = {
  PENDING: "warning",
  PAID: "success",
  CANCELED: "light",
};

export default function PayrollPage() {
  const [tab, setTab] = useState<"rates" | "earnings" | "payouts">("rates");

  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [compensations, setCompensations] = useState<CleanerCompensation[]>([]);
  const [earnings, setEarnings] = useState<CleanerEarning[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [rateModal, setRateModal] = useState<Cleaner | null>(null);
  const [rateForm, setRateForm] = useState<{ type: CompensationType; value: string }>({ type: "PERCENT", value: "" });

  const [payoutCleaner, setPayoutCleaner] = useState<Cleaner | null>(null);

  const compByCleanerId = useMemo(() => {
    const map = new Map<string, CleanerCompensation>();
    compensations.forEach((c) => map.set(c.cleanerId, c));
    return map;
  }, [compensations]);

  const pendingByCleanerId = useMemo(() => {
    const map = new Map<string, number>();
    earnings
      .filter((e) => e.status === "PENDING")
      .forEach((e) => map.set(e.cleanerId, (map.get(e.cleanerId) || 0) + e.amountCents));
    return map;
  }, [earnings]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [c, comp, e, p] = await Promise.all([
        listCleaners("ACTIVE"),
        listCompensations(),
        listEarnings(),
        listPayouts(),
      ]);
      setCleaners(c);
      setCompensations(comp);
      setEarnings(e);
      setPayouts(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openRateModal = (cleaner: Cleaner) => {
    const existing = compByCleanerId.get(cleaner.id);
    setRateForm({
      type: existing?.type || "PERCENT",
      value: existing ? String(existing.value) : "",
    });
    setRateModal(cleaner);
  };

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rateModal) return;
    setSaving(true);
    setError("");
    try {
      await setCompensation(rateModal.id, rateForm.type, parseInt(rateForm.value, 10));
      setRateModal(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save rate");
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePayout = async () => {
    if (!payoutCleaner) return;
    setSaving(true);
    setError("");
    try {
      await createPayout(payoutCleaner.id);
      setPayoutCleaner(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create payout");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (payout: Payout) => {
    setError("");
    try {
      await markPayoutPaid(payout.id, {});
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark payout as paid");
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Payroll</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Set what each cleaner earns per job, track what they&apos;re owed, and record payouts once you&apos;ve
          actually paid them. CleanSera tracks the numbers — sending the money (bank transfer, cash, your own
          payroll run) still happens outside the platform.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {(["rates", "earnings", "payouts"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
              tab === t
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "rates" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Cleaner</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Rate</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Pending</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading && (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={4}>Loading…</TableCell>
                  </TableRow>
                )}
                {!loading && cleaners.length === 0 && (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={4}>No active cleaners yet</TableCell>
                  </TableRow>
                )}
                {!loading &&
                  cleaners.map((c) => {
                    const comp = compByCleanerId.get(c.id);
                    const pending = pendingByCleanerId.get(c.id) || 0;
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                          {cleanerDisplayName(c)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {comp ? compensationLabel(comp) : <span className="italic text-gray-400">Not set</span>}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatMoney(pending)}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex gap-3">
                            <button
                              onClick={() => openRateModal(c)}
                              className="text-sm font-medium text-brand-500 hover:text-brand-600"
                            >
                              {comp ? "Edit rate" : "Set rate"}
                            </button>
                            {pending > 0 && (
                              <button
                                onClick={() => setPayoutCleaner(c)}
                                className="text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-300"
                              >
                                Pay out
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {tab === "earnings" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Cleaner</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Job</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Amount</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Earned</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading && (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={5}>Loading…</TableCell>
                  </TableRow>
                )}
                {!loading && earnings.length === 0 && (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={5}>
                      No earnings yet — they appear here as jobs with a rate configured are completed.
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  earnings.map((e) => {
                    const cleaner = cleaners.find((c) => c.id === e.cleanerId);
                    return (
                      <TableRow key={e.id}>
                        <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                          {cleaner ? cleanerDisplayName(cleaner) : e.cleanerId}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {e.booking ? new Date(e.booking.scheduledAt).toLocaleDateString() : e.bookingId}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{formatMoney(e.amountCents)}</TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(e.earnedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <Badge color={e.status === "PAID" ? "success" : e.status === "VOIDED" ? "error" : "warning"} size="sm">
                            {e.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {tab === "payouts" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Cleaner</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Period</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Total</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading && (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={5}>Loading…</TableCell>
                  </TableRow>
                )}
                {!loading && payouts.length === 0 && (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={5}>No payouts yet</TableCell>
                  </TableRow>
                )}
                {!loading &&
                  payouts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                        {`${p.cleaner.user.firstName} ${p.cleaner.user.lastName}`.trim()}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(p.periodStart).toLocaleDateString()} – {new Date(p.periodEnd).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{formatMoney(p.totalCents)}</TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge color={PAYOUT_STATUS_COLOR[p.status]} size="sm">{p.status}</Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        {p.status === "PENDING" && (
                          <button
                            onClick={() => handleMarkPaid(p)}
                            className="text-sm font-medium text-brand-500 hover:text-brand-600"
                          >
                            Mark as paid
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Set/edit rate modal */}
      <Modal isOpen={!!rateModal} onClose={() => setRateModal(null)} className="max-w-md p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Pay rate for {rateModal ? cleanerDisplayName(rateModal) : ""}
        </h2>
        <form onSubmit={handleSaveRate} className="space-y-4">
          <div>
            <Label>Type</Label>
            <Select
              options={[
                { value: "PERCENT", label: "Percent of job price" },
                { value: "FLAT_PER_JOB", label: "Flat amount per job" },
                { value: "HOURLY", label: "Hourly (based on clocked time)" },
              ]}
              defaultValue={rateForm.type}
              onChange={(value) => setRateForm({ ...rateForm, type: value as CompensationType })}
            />
          </div>
          <div>
            <Label>
              {rateForm.type === "PERCENT"
                ? "Percent (1–100)"
                : rateForm.type === "FLAT_PER_JOB"
                ? "Amount per job (cents)"
                : "Amount per hour (cents)"}
            </Label>
            <Input
              type="number"
              min="1"
              max={rateForm.type === "PERCENT" ? "100" : undefined}
              value={rateForm.value}
              onChange={(e) => setRateForm({ ...rateForm, value: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setRateModal(null)} type="button">Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </Modal>

      {/* Create payout confirmation */}
      <Modal isOpen={!!payoutCleaner} onClose={() => setPayoutCleaner(null)} className="max-w-md p-6">
        <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
          Pay out {payoutCleaner ? cleanerDisplayName(payoutCleaner) : ""}?
        </h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          This batches all of their pending earnings into one payout of{" "}
          <strong>{payoutCleaner ? formatMoney(pendingByCleanerId.get(payoutCleaner.id) || 0) : ""}</strong>.
          You&apos;ll still need to actually send the money — this just records it as owed, then paid once you
          confirm.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => setPayoutCleaner(null)} type="button">Cancel</Button>
          <Button onClick={handleCreatePayout} disabled={saving}>{saving ? "Creating…" : "Create Payout"}</Button>
        </div>
      </Modal>
    </div>
  );
}
