"use client";

import { useEffect, useState, useCallback } from "react";
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
  BusinessHours,
  BusinessBranding,
} from "@/app/api/businesses.api";
import { Business } from "@/app/api/cleansera-types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function BusinessSettingsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [branding, setBranding] = useState<BusinessBranding | null>(null);
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);

  const [nameForm, setNameForm] = useState({ name: "", timezone: "", customDomain: "" });
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
      setBrandForm({ tagline: br.tagline || "", primaryColor: br.primaryColor || "", accentColor: br.accentColor || "" });
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
            <Input value={nameForm.timezone} onChange={(e) => setNameForm({ ...nameForm, timezone: e.target.value })} placeholder="Africa/Lagos" required />
          </div>
          <div>
            <Label>Custom Domain (optional)</Label>
            <Input value={nameForm.customDomain} onChange={(e) => setNameForm({ ...nameForm, customDomain: e.target.value })} placeholder="book.yourbusiness.com" />
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
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
    </div>
  );
}
