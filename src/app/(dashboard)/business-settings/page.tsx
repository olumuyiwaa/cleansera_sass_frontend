"use client";

import React, { useEffect, useState, useCallback } from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import {
  getBusiness,
  updateBusiness,
  getBranding,
  updateBranding,
  listHours,
  updateHours,
  listServiceAreas,
  createServiceArea,
  deleteServiceArea,
  ServiceArea,
  BusinessHours,
  BusinessBranding,
  StripeConnectStatus,
  refreshStripeConnectStatus,
  getStripeConnectStatus,
  startStripeConnectOnboarding,
} from "@/app/api/businesses.api";
import { Business } from "@/app/api/cleansera-types";
import StripeConnectOptionalCard from "@/components/business/StripeConnectOptionalCard";
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function BusinessSettingsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [branding, setBranding] = useState<BusinessBranding | null>(null);
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [areaForm, setAreaForm] = useState({ name: "", centerLat: "", centerLng: "", radiusMeters: "10000" });
  const [areaSaving, setAreaSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);

  const [nameForm, setNameForm] = useState({ name: "", timezone: "", customDomain: "" });
  const [taxForm, setTaxForm] = useState({ legalName: "", kvkNumber: "", vatNumber: "", invoiceIban: "", vatRateBps: "2100" });
  const [brandForm, setBrandForm] = useState({ tagline: "", primaryColor: "", accentColor: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [b, br, h] = await Promise.all([getBusiness(), getBranding(), listHours()]);
      setBusiness(b);
      setBranding(br);
      setHours(h.length ? h : DAYS.map((_, i) => ({ dayOfWeek: i, openTime: "08:00", closeTime: "18:00", isClosed: i === 0 })));
      setNameForm({ name: b.name, timezone: b.timezone, customDomain: b.customDomain || "" });
      setTaxForm({
        legalName: b.legalName || "",
        kvkNumber: b.kvkNumber || "",
        vatNumber: b.vatNumber || "",
        invoiceIban: b.invoiceIban || "",
        vatRateBps: String(b.vatRateBps ?? 2100),
      });
      setBrandForm({ tagline: br.tagline || "", primaryColor: br.primaryColor || "", accentColor: br.accentColor || "" });
      setAreas(await listServiceAreas());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load business settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved("");
    try {
      await updateBusiness(nameForm);
      setSaved("Business info saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const saveTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved("");
    try {
      await updateBusiness({
        legalName: taxForm.legalName,
        kvkNumber: taxForm.kvkNumber,
        vatNumber: taxForm.vatNumber,
        invoiceIban: taxForm.invoiceIban,
        vatRateBps: Number(taxForm.vatRateBps),
      });
      setSaved("Invoicing details saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save invoicing details");
    } finally {
      setSaving(false);
    }
  };

  const saveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved("");
    try {
      await updateBranding(brandForm);
      setSaved("Branding saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  const saveHours = async () => {
    setSaving(true);
    setError("");
    setSaved("");
    try {
      await updateHours(hours);
      setSaved("Business hours saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save hours");
    } finally {
      setSaving(false);
    }
  };

  // state
  const [stripe, setStripe] = useState<StripeConnectStatus | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);

// on load + when ?stripe=return|refresh
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeParam = params.get("stripe");
    (async () => {
      if (stripeParam === "return" || stripeParam === "refresh") {
        try { await refreshStripeConnectStatus(); } catch {}
      }
      try {
        setStripe(await getStripeConnectStatus());
      } catch {}
    })();
  }, []);

  const connectStripe = async () => {
    setStripeLoading(true);
    try {
      const { url } = await startStripeConnectOnboarding();
      window.location.href = url; // Stripe hosted onboarding
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start Stripe onboarding");
    } finally {
      setStripeLoading(false);
    }
  };

  const addServiceArea = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(areaForm.centerLat);
    const lng = parseFloat(areaForm.centerLng);
    const radius = parseInt(areaForm.radiusMeters, 10);
    if (!areaForm.name.trim() || Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(radius)) {
      setError("Enter a name, valid latitude/longitude, and a radius for the service area");
      return;
    }
    setAreaSaving(true);
    setError("");
    setSaved("");
    try {
      const created = await createServiceArea({ name: areaForm.name.trim(), centerLat: lat, centerLng: lng, radiusMeters: radius });
      setAreas((prev) => [...prev, created]);
      setAreaForm({ name: "", centerLat: "", centerLng: "", radiusMeters: "10000" });
      setSaved("Service area added");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add service area");
    } finally {
      setAreaSaving(false);
    }
  };

  const removeServiceArea = async (id: string) => {
    if (!confirm("Remove this service area? Bookings outside it will no longer be accepted by the widget.")) return;
    setError("");
    try {
      await deleteServiceArea(id);
      setAreas((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove service area");
    }
  };

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading…</div>;

  return (
    <div className="p-4 md:p-6 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Business Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your booking widget lives at{" "}
          <span className="font-medium">{business?.subdomain}.cleansera.com</span>
          {business?.customDomain ? <> or your custom domain <span className="font-medium">{business.customDomain}</span></> : null}.
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

      {/* General */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.02]">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">General</h2>
        <form onSubmit={saveGeneral} className="space-y-4 max-w-md">
          <div>
            <Label>Business Name</Label>
            <Input value={nameForm.name} onChange={(e) => setNameForm({ ...nameForm, name: e.target.value })} required />
          </div>
          <div>
            <Label>Timezone</Label>
            <Input value={nameForm.timezone} onChange={(e) => setNameForm({ ...nameForm, timezone: e.target.value })} placeholder="Europe/Amsterdam" required />
          </div>
          <div>
            <Label>Custom Domain (optional)</Label>
            <Input value={nameForm.customDomain} onChange={(e) => setNameForm({ ...nameForm, customDomain: e.target.value })} placeholder="book.yourbusiness.com" />
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </form>
      </section>

      {/* Invoicing / BTW */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.02]">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Invoicing &amp; BTW</h2>
        <p className="mb-4 max-w-md text-xs text-gray-500 dark:text-gray-400">
          Required on every Dutch invoice. Your prices are shown to customers including BTW; invoices split out the BTW automatically.
        </p>
        <form onSubmit={saveTax} className="space-y-4 max-w-md">
          <div>
            <Label>Legal name</Label>
            <Input value={taxForm.legalName} onChange={(e) => setTaxForm({ ...taxForm, legalName: e.target.value })} placeholder="Schoon Holding B.V." />
          </div>
          <div>
            <Label>KvK number</Label>
            <Input value={taxForm.kvkNumber} onChange={(e) => setTaxForm({ ...taxForm, kvkNumber: e.target.value })} placeholder="12345678" />
          </div>
          <div>
            <Label>BTW-id</Label>
            <Input value={taxForm.vatNumber} onChange={(e) => setTaxForm({ ...taxForm, vatNumber: e.target.value })} placeholder="NL123456789B01" />
          </div>
          <div>
            <Label>IBAN (shown on invoices)</Label>
            <Input value={taxForm.invoiceIban} onChange={(e) => setTaxForm({ ...taxForm, invoiceIban: e.target.value })} placeholder="NL91 ABNA 0417 1643 00" />
          </div>
          <div>
            <Label>Standard BTW rate</Label>
            <select
              value={taxForm.vatRateBps}
              onChange={(e) => setTaxForm({ ...taxForm, vatRateBps: e.target.value })}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700"
            >
              <option value="2100">21% (standard)</option>
              <option value="900">9% (reduced)</option>
              <option value="0">0%</option>
            </select>
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save invoicing details"}</Button>
        </form>
      </section>

      {/* Branding */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.02]">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Branding</h2>
        <form onSubmit={saveBranding} className="space-y-4 max-w-md">
          <div>
            <Label>Tagline</Label>
            <Input value={brandForm.tagline} onChange={(e) => setBrandForm({ ...brandForm, tagline: e.target.value })} placeholder="Spotless homes, every time" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primary Color</Label>
              <Input type="text" value={brandForm.primaryColor} onChange={(e) => setBrandForm({ ...brandForm, primaryColor: e.target.value })} placeholder="#2563eb" />
            </div>
            <div>
              <Label>Accent Color</Label>
              <Input type="text" value={brandForm.accentColor} onChange={(e) => setBrandForm({ ...brandForm, accentColor: e.target.value })} placeholder="#22c55e" />
            </div>
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </form>
      </section>

      {/* Connect Stripe */}
      <StripeConnectOptionalCard
          stripe={stripe}
          onStripeChange={setStripe}
          onError={setError}
          onSaved={setSaved}
          initialPreferred={(business as any)?.preferredPaymentCollection || "BOTH"}
          initialOfflineInstructions={(business as any)?.offlinePaymentInstructions || ""}
      />

      {/* Hours */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.02]">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Business Hours</h2>
        <div className="space-y-3">
          {hours.map((h, i) => (
            <div key={h.dayOfWeek} className="flex items-center gap-4">
              <span className="w-24 text-sm text-gray-600 dark:text-gray-300">{DAYS[h.dayOfWeek]}</span>
              <label className="flex items-center gap-2 text-xs text-gray-500">
                <input
                  type="checkbox"
                  checked={!h.isClosed}
                  onChange={(e) => {
                    const next = [...hours];
                    next[i] = { ...h, isClosed: !e.target.checked };
                    setHours(next);
                  }}
                />
                Open
              </label>
              {!h.isClosed && (
                <>
                  <input
                    type="time"
                    value={h.openTime}
                    onChange={(e) => {
                      const next = [...hours];
                      next[i] = { ...h, openTime: e.target.value };
                      setHours(next);
                    }}
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="time"
                    value={h.closeTime}
                    onChange={(e) => {
                      const next = [...hours];
                      next[i] = { ...h, closeTime: e.target.value };
                      setHours(next);
                    }}
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </>
              )}
            </div>
          ))}
        </div>
        <Button className="mt-4" onClick={saveHours} disabled={saving}>{saving ? "Saving…" : "Save Hours"}</Button>
      </section>

      {/* Service Areas */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.02]">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Service Areas</h2>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          The widget only accepts bookings whose address falls inside one of these areas. Add at least one before going live.
        </p>

        {areas.length > 0 && (
          <ul className="mb-4 divide-y divide-gray-100 dark:divide-gray-800">
            {areas.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-gray-700 dark:text-gray-200">
                  {a.name} — {a.centerLat.toFixed(4)}, {a.centerLng.toFixed(4)} · {(a.radiusMeters / 1000).toFixed(1)}km radius
                </span>
                <button
                  type="button"
                  onClick={() => removeServiceArea(a.id)}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={addServiceArea} className="grid gap-4 sm:grid-cols-2 max-w-2xl">
          <div>
            <Label>Area Name</Label>
            <Input value={areaForm.name} onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })} placeholder="Downtown Lagos" />
          </div>
          <div>
            <Label>Radius (meters)</Label>
            <Input type="number" value={areaForm.radiusMeters} onChange={(e) => setAreaForm({ ...areaForm, radiusMeters: e.target.value })} placeholder="10000" />
          </div>
          <div>
            <Label>Center Latitude</Label>
            <Input type="number" value={areaForm.centerLat} onChange={(e) => setAreaForm({ ...areaForm, centerLat: e.target.value })} placeholder="6.5244" />
          </div>
          <div>
            <Label>Center Longitude</Label>
            <Input type="number" value={areaForm.centerLng} onChange={(e) => setAreaForm({ ...areaForm, centerLng: e.target.value })} placeholder="3.3792" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={areaSaving}>{areaSaving ? "Adding…" : "Add Service Area"}</Button>
          </div>
        </form>
      </section>
    </div>
  );
}
