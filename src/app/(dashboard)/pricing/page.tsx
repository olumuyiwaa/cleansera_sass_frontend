"use client";

import React, { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { getPricing, updatePricing, PolicyValueType } from "@/app/api/pricing.api";
import { currencySymbol } from "@/app/services/currency";

// cents <-> a plain dollar/major-unit string for the input fields, so the
// business types "0.35" instead of "35" and never has to think in cents.
function centsToMajor(cents: number | null): string {
  if (cents === null || cents === undefined) return "";
  return (cents / 100).toString();
}
function majorToCents(major: string): number | null {
  if (major.trim() === "") return null;
  const n = Number(major);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

const FREQUENCIES = ["WEEKLY", "BIWEEKLY", "MONTHLY"] as const;

export default function PricingSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  // Per-business PER_SQFT / PER_ROOM rates. Left blank = fall back to the
  // platform default rate (today's one-rate-for-everyone behavior).
  const [rates, setRates] = useState({ perSqft: "", perRoom: "" });

  const [freqDiscounts, setFreqDiscounts] = useState<Record<string, string>>({
    WEEKLY: "",
    BIWEEKLY: "",
    MONTHLY: "",
  });

  const [deposit, setDeposit] = useState<{ type: PolicyValueType | ""; value: string }>({
    type: "",
    value: "",
  });

  const [cancellation, setCancellation] = useState<{
    windowHours: string;
    feeType: PolicyValueType | "";
    feeValue: string;
  }>({ windowHours: "", feeType: "", feeValue: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const p = await getPricing();
      setRates({ perSqft: centsToMajor(p.perSqftCents), perRoom: centsToMajor(p.perRoomCents) });
      const fd = p.frequencyDiscounts || {};
      setFreqDiscounts({
        WEEKLY: fd.WEEKLY != null ? String(Math.round(fd.WEEKLY * 100)) : "",
        BIWEEKLY: fd.BIWEEKLY != null ? String(Math.round(fd.BIWEEKLY * 100)) : "",
        MONTHLY: fd.MONTHLY != null ? String(Math.round(fd.MONTHLY * 100)) : "",
      });
      setDeposit({ type: p.depositType || "", value: p.depositValue != null ? String(p.depositValue) : "" });
      setCancellation({
        windowHours: p.cancellationWindowHours != null ? String(p.cancellationWindowHours) : "",
        feeType: p.cancellationFeeType || "",
        feeValue: p.cancellationFeeValue != null ? String(p.cancellationFeeValue) : "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pricing settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved("");
    try {
      await updatePricing({
        perSqftCents: majorToCents(rates.perSqft),
        perRoomCents: majorToCents(rates.perRoom),
      });
      setSaved("Rates saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save rates");
    } finally {
      setSaving(false);
    }
  };

  const saveFrequency = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved("");
    try {
      const discounts: Record<string, number> = {};
      for (const f of FREQUENCIES) {
        const v = freqDiscounts[f];
        if (v.trim() !== "") discounts[f] = Number(v) / 100;
      }
      await updatePricing({ frequencyDiscounts: discounts });
      setSaved("Frequency discounts saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save frequency discounts");
    } finally {
      setSaving(false);
    }
  };

  const saveDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved("");
    try {
      await updatePricing({
        depositType: deposit.type || null,
        depositValue: deposit.value.trim() !== "" ? Number(deposit.value) : null,
      });
      setSaved("Deposit policy saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save deposit policy");
    } finally {
      setSaving(false);
    }
  };

  const saveCancellation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved("");
    try {
      await updatePricing({
        cancellationWindowHours: cancellation.windowHours.trim() !== "" ? Number(cancellation.windowHours) : null,
        cancellationFeeType: cancellation.feeType || null,
        cancellationFeeValue: cancellation.feeValue.trim() !== "" ? Number(cancellation.feeValue) : null,
      });
      setSaved("Cancellation policy saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save cancellation policy");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading…</div>;

  return (
    <div className="p-4 md:p-6 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Pricing</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          These rates and policies apply to your business only — other businesses on CleanSera set their own.
          Leave a rate blank to use the platform default instead.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-600 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400">
          {saved}
        </div>
      )}

      {/* PER_SQFT / PER_ROOM rates */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.02]">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Per-Sqft / Per-Room Rates
        </h2>
        <p className="mb-4 text-xs text-gray-400">
          Used by any service whose pricing model is &quot;Per Sqft&quot; or &quot;Per Room&quot;.
        </p>
        <form onSubmit={saveRates} className="space-y-4 max-w-md">
          <div>
            <Label>Rate per square foot ({currencySymbol()})</Label>
            <Input
              type="number"
              step={0.01}
              min="0"
              placeholder="Platform default (0.10)"
              value={rates.perSqft}
              onChange={(e) => setRates({ ...rates, perSqft: e.target.value })}
            />
          </div>
          <div>
            <Label>Rate per room ({currencySymbol()})</Label>
            <Input
              type="number"
              step={0.01}
              min="0"
              placeholder="Platform default (15.00)"
              value={rates.perRoom}
              onChange={(e) => setRates({ ...rates, perRoom: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Rates"}</Button>
        </form>
      </section>

      {/* Frequency discounts */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.02]">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Recurring Frequency Discounts
        </h2>
        <form onSubmit={saveFrequency} className="space-y-4 max-w-md">
          {FREQUENCIES.map((f) => (
            <div key={f}>
              <Label>{f} discount (%)</Label>
              <Input
                type="number"
                step={1}
                min="0"
                max="100"
                placeholder="0"
                value={freqDiscounts[f]}
                onChange={(e) => setFreqDiscounts({ ...freqDiscounts, [f]: e.target.value })}
              />
            </div>
          ))}
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Discounts"}</Button>
        </form>
      </section>

      {/* Deposit policy */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.02]">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Deposit Policy
        </h2>
        <p className="mb-4 text-xs text-gray-400">Collected from the customer at booking time, before scheduling.</p>
        <form onSubmit={saveDeposit} className="space-y-4 max-w-md">
          <div>
            <Label>Deposit type</Label>
            <select
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              value={deposit.type}
              onChange={(e) => setDeposit({ ...deposit, type: e.target.value as PolicyValueType | "" })}
            >
              <option value="">No deposit required</option>
              <option value="PERCENT">Percent of job total</option>
              <option value="AMOUNT">Fixed amount</option>
            </select>
          </div>
          {deposit.type && (
            <div>
              <Label>{deposit.type === "PERCENT" ? "Deposit percent (0-100)" : "Deposit amount (cents)"}</Label>
              <Input
                type="number"
                min="0"
                value={deposit.value}
                onChange={(e) => setDeposit({ ...deposit, value: e.target.value })}
              />
            </div>
          )}
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Deposit Policy"}</Button>
        </form>
      </section>

      {/* Cancellation policy */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.02]">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Cancellation Policy
        </h2>
        <p className="mb-4 text-xs text-gray-400">
          A fee applies when a customer cancels inside the window below. Leave blank for free cancellation anytime.
        </p>
        <form onSubmit={saveCancellation} className="space-y-4 max-w-md">
          <div>
            <Label>Free-cancellation window (hours before the job)</Label>
            <Input
              type="number"
              min="0"
              placeholder="e.g. 24"
              value={cancellation.windowHours}
              onChange={(e) => setCancellation({ ...cancellation, windowHours: e.target.value })}
            />
          </div>
          <div>
            <Label>Cancellation fee type</Label>
            <select
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              value={cancellation.feeType}
              onChange={(e) => setCancellation({ ...cancellation, feeType: e.target.value as PolicyValueType | "" })}
            >
              <option value="">No fee</option>
              <option value="PERCENT">Percent of job total</option>
              <option value="AMOUNT">Fixed amount</option>
            </select>
          </div>
          {cancellation.feeType && (
            <div>
              <Label>{cancellation.feeType === "PERCENT" ? "Fee percent (0-100)" : "Fee amount (cents)"}</Label>
              <Input
                type="number"
                min="0"
                value={cancellation.feeValue}
                onChange={(e) => setCancellation({ ...cancellation, feeValue: e.target.value })}
              />
            </div>
          )}
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Cancellation Policy"}</Button>
        </form>
      </section>
    </div>
  );
}
