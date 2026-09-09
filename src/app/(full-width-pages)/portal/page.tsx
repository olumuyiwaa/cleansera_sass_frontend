"use client";

import { useEffect, useState } from "react";
import {
  requestPortalAccess,
  verifyPortalAccess,
  listPortalBookings,
  cancelPortalBooking,
  reschedulePortalBooking,
  leavePortalReview,
} from "@/app/api/portal.api";

type Customer = { id: string; firstName: string; lastName: string; email: string | null; phone: string };

const TOKEN_KEY = "cleansera_portal_token";
const CUSTOMER_KEY = "cleansera_portal_customer";

export default function CustomerPortalPage() {
  const [step, setStep] = useState<"phone" | "code" | "bookings">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleStart, setRescheduleStart] = useState("");
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    const c = typeof window !== "undefined" ? localStorage.getItem(CUSTOMER_KEY) : null;
    if (t && c) {
      setToken(t);
      setCustomer(JSON.parse(c));
      setStep("bookings");
    }
  }, []);

  useEffect(() => {
    if (step === "bookings" && token) {
      (async () => {
        setLoading(true);
        setError("");
        try {
          const list = await listPortalBookings(token);
          setBookings(list);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Failed to load bookings");
          // token may be expired
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(CUSTOMER_KEY);
          setStep("phone");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [step, token]);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMsg("");
    try {
      await requestPortalAccess(phone);
      setMsg("If we found your account, a code was sent by SMS/email.");
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await verifyPortalAccess(phone, code);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(data.customer));
      setToken(data.token);
      setCustomer(data.customer);
      setStep("bookings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_KEY);
    setToken(null);
    setCustomer(null);
    setBookings([]);
    setStep("phone");
  };

  const handleCancel = async (id: string) => {
    if (!token || !confirm("Cancel this booking? (must be at least 12 hours before)")) return;
    setLoading(true);
    setError("");
    try {
      await cancelPortalBooking(token, id);
      setBookings(await listPortalBookings(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!token || !rescheduleId || !rescheduleStart) return;
    setLoading(true);
    setError("");
    try {
      await reschedulePortalBooking(token, rescheduleId, new Date(rescheduleStart).toISOString());
      setRescheduleId(null);
      setBookings(await listPortalBookings(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reschedule failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!token || !reviewId) return;
    setLoading(true);
    setError("");
    try {
      await leavePortalReview(token, reviewId, rating, comment || undefined);
      setReviewId(null);
      setComment("");
      setBookings(await listPortalBookings(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-gray-50 px-4 py-10 dark:bg-gray-950">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My cleanings</h1>
        <p className="mt-1 text-sm text-gray-500">View, reschedule, or cancel your bookings</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {msg && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{msg}</div>
      )}

      {step === "phone" && (
        <form onSubmit={sendCode} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone number</label>
          <input
            className="mb-4 h-11 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234…"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg bg-emerald-700 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send access code"}
          </button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={verify} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">6-digit code</label>
          <input
            className="mb-4 h-11 w-full rounded-lg border border-gray-300 px-3 text-sm tracking-widest dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg bg-emerald-700 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {loading ? "Verifying…" : "Continue"}
          </button>
          <button type="button" onClick={() => setStep("phone")} className="mt-3 w-full text-sm text-gray-500">
            Use a different phone
          </button>
        </form>
      )}

      {step === "bookings" && customer && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Hi, <span className="font-medium">{customer.firstName}</span>
            </p>
            <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-800">
              Sign out
            </button>
          </div>

          {loading && <p className="text-sm text-gray-500">Loading…</p>}

          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{b.service?.name || "Cleaning"}</p>
                    <p className="text-sm text-gray-500">{new Date(b.scheduledStart).toLocaleString()}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-gray-400">{b.status}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {!["COMPLETED", "CANCELLED", "IN_PROGRESS"].includes(b.status) && (
                    <>
                      <button
                        onClick={() => {
                          setRescheduleId(b.id);
                          setRescheduleStart("");
                        }}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {b.status === "COMPLETED" && !b.review && (
                    <button
                      onClick={() => {
                        setReviewId(b.id);
                        setRating(5);
                        setComment("");
                      }}
                      className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700"
                    >
                      Leave review
                    </button>
                  )}
                </div>
              </div>
            ))}
            {!loading && bookings.length === 0 && (
              <p className="text-center text-sm text-gray-500">No bookings yet.</p>
            )}
          </div>

          {rescheduleId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-sm rounded-xl bg-white p-5 dark:bg-gray-900">
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Reschedule</h3>
                <input
                  type="datetime-local"
                  className="mb-4 h-11 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  value={rescheduleStart}
                  onChange={(e) => setRescheduleStart(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setRescheduleId(null)} className="px-3 py-2 text-sm text-gray-500">
                    Close
                  </button>
                  <button
                    onClick={handleReschedule}
                    disabled={loading || !rescheduleStart}
                    className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {reviewId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-sm rounded-xl bg-white p-5 dark:bg-gray-900">
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Rate your cleaning</h3>
                <select
                  className="mb-3 h-11 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
                <textarea
                  className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  rows={3}
                  placeholder="Optional comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setReviewId(null)} className="px-3 py-2 text-sm text-gray-500">
                    Close
                  </button>
                  <button
                    onClick={handleReview}
                    disabled={loading}
                    className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
