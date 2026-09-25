"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getStorefront } from "@/app/api/widget.api";
import { setActiveCurrency } from "@/app/services/currency";
import { useActiveCurrency } from "@/app/services/useActiveCurrency";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import {
    requestPortalAccess,
    verifyPortalAccess,
    listPortalBookings,
    cancelPortalBooking,
    reschedulePortalBooking,
    leavePortalReview,
    tipPortalBooking,
    formatMoney,
    statusLabel,
    statusColor,
    type PortalBooking,
    type PortalCustomer,
} from "@/app/api/portal.api";

type Step = "phone" | "code" | "bookings";

const tokenKey = (slug: string) => `cleansera_portal_token_${slug}`;
const customerKey = (slug: string) => `cleansera_portal_customer_${slug}`;

function cleanerName(b: PortalBooking) {
    const a = b.assignments?.[0]?.cleaner?.user;
    if (!a) return null;
    return `${a.firstName} ${a.lastName}`.trim();
}

export default function CustomerPortalPage() {
    const params = useParams();
    // Unified under /[subdomain]/portal — param is now "subdomain"
    const slug = (params?.subdomain as string) || (params?.slug as string) || "";
    // Amounts were formatted with a hardcoded USD default. Use the business's own currency.
    const currency = useActiveCurrency();
    const locale = useLocale();
    const t = useTranslations("Portal");
    const tStatus = useTranslations("Portal.status");

    const formatWhen = useCallback(
        (iso: string) =>
            new Date(iso).toLocaleString(locale, {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
            }),
        [locale]
    );
    useEffect(() => {
        if (!slug) return;
        getStorefront(slug)
            .then((s) => setActiveCurrency(s.business?.currency))
            .catch(() => {
                /* keep the default currency */
            });
    }, [slug]);

    const [step, setStep] = useState<Step>("phone");
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [token, setToken] = useState<string | null>(null);
    const [customer, setCustomer] = useState<PortalCustomer | null>(null);
    const [bookings, setBookings] = useState<PortalBooking[]>([]);
    const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [msg, setMsg] = useState("");

    const [detail, setDetail] = useState<PortalBooking | null>(null);
    const [rescheduleId, setRescheduleId] = useState<string | null>(null);
    const [rescheduleStart, setRescheduleStart] = useState("");
    const [reviewId, setReviewId] = useState<string | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [tipId, setTipId] = useState<string | null>(null);
    const [tipCents, setTipCents] = useState(500);

    const loadBookings = useCallback(
        async (tok: string) => {
            const list = await listPortalBookings(slug, tok);
            setBookings(list);
        },
        [slug]
    );

    useEffect(() => {
        if (!slug || typeof window === "undefined") return;
        const t = localStorage.getItem(tokenKey(slug));
        const c = localStorage.getItem(customerKey(slug));
        if (t && c) {
            try {
                setToken(t);
                setCustomer(JSON.parse(c));
                setStep("bookings");
            } catch {
                localStorage.removeItem(tokenKey(slug));
                localStorage.removeItem(customerKey(slug));
            }
        }
    }, [slug]);

    useEffect(() => {
        if (step !== "bookings" || !token || !slug) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError("");
            try {
                await loadBookings(token);
            } catch (e) {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : t("errors.failedToLoadBookings"));
                    localStorage.removeItem(tokenKey(slug));
                    localStorage.removeItem(customerKey(slug));
                    setToken(null);
                    setCustomer(null);
                    setStep("phone");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [step, token, slug, loadBookings, t]);

    const filtered = useMemo(() => {
        const now = Date.now();
        return bookings.filter((b) => {
            const start = new Date(b.scheduledStart).getTime();
            if (filter === "upcoming") {
                return start >= now && !["CANCELLED", "COMPLETED"].includes(b.status);
            }
            if (filter === "past") {
                return start < now || ["CANCELLED", "COMPLETED"].includes(b.status);
            }
            return true;
        });
    }, [bookings, filter]);

    const stats = useMemo(() => {
        const now = Date.now();
        const upcoming = bookings.filter(
            (b) =>
                new Date(b.scheduledStart).getTime() >= now &&
                !["CANCELLED", "COMPLETED"].includes(b.status)
        ).length;
        const completed = bookings.filter((b) => b.status === "COMPLETED").length;
        return { upcoming, completed, total: bookings.length };
    }, [bookings]);

    const sendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMsg("");
        try {
            await requestPortalAccess(slug, phone.trim());
            setMsg(t("success.codeSent"));
            setStep("code");
        } catch (err) {
            setError(err instanceof Error ? err.message : t("errors.failedToSendCode"));
        } finally {
            setLoading(false);
        }
    };

    const verify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const data = await verifyPortalAccess(slug, phone.trim(), code.trim());
            localStorage.setItem(tokenKey(slug), data.token);
            localStorage.setItem(customerKey(slug), JSON.stringify(data.customer));
            setToken(data.token);
            setCustomer(data.customer);
            setStep("bookings");
        } catch (err) {
            setError(err instanceof Error ? err.message : t("errors.invalidCode"));
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem(tokenKey(slug));
        localStorage.removeItem(customerKey(slug));
        setToken(null);
        setCustomer(null);
        setBookings([]);
        setStep("phone");
    };

    const handleCancel = async (id: string) => {
        if (!token) return;
        if (!confirm(t("confirmCancel"))) {
            return;
        }
        setLoading(true);
        setError("");
        try {
            await cancelPortalBooking(slug, token, id, "Cancelled by customer");
            await loadBookings(token);
            setDetail(null);
            setMsg(t("success.bookingCancelled"));
        } catch (err) {
            setError(err instanceof Error ? err.message : t("errors.cancelFailed"));
        } finally {
            setLoading(false);
        }
    };

    const handleReschedule = async () => {
        if (!token || !rescheduleId || !rescheduleStart) return;
        setLoading(true);
        setError("");
        try {
            await reschedulePortalBooking(
                slug,
                token,
                rescheduleId,
                new Date(rescheduleStart).toISOString()
            );
            setRescheduleId(null);
            await loadBookings(token);
            setMsg(t("success.bookingRescheduled"));
        } catch (err) {
            setError(err instanceof Error ? err.message : t("errors.rescheduleFailed"));
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async () => {
        if (!token || !reviewId) return;
        setLoading(true);
        setError("");
        try {
            await leavePortalReview(slug, token, reviewId, rating, comment || undefined);
            setReviewId(null);
            setComment("");
            await loadBookings(token);
            setMsg(t("success.reviewThanks"));
        } catch (err) {
            setError(err instanceof Error ? err.message : t("errors.reviewFailed"));
        } finally {
            setLoading(false);
        }
    };

    const handleTip = async () => {
        if (!token || !tipId || tipCents < 50) return;
        setLoading(true);
        setError("");
        try {
            const origin = typeof window !== "undefined" ? window.location.origin : "";
            const path = `/${encodeURIComponent(slug)}/portal`;
            const data = await tipPortalBooking(
                slug,
                token,
                tipId,
                tipCents,
                `${origin}${path}?tipped=1`,
                `${origin}${path}?tip_cancelled=1`
            );
            if (data.url) {
                window.location.href = data.url;
                return;
            }
            setError(t("errors.couldNotStartTipCheckout"));
        } catch (err) {
            setError(err instanceof Error ? err.message : t("errors.tipFailed"));
        } finally {
            setLoading(false);
        }
    };

    const canModify = (b: PortalBooking) =>
        !["COMPLETED", "CANCELLED", "IN_PROGRESS"].includes(b.status);

    return (
        <div className="min-h-screen bg-[#f4f7f5] text-gray-900">
            {/* Ambient background */}
            <div
                className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
                aria-hidden
            >
                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
                <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-teal-100/50 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-100/30 blur-3xl" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-white/60 bg-white/80 shadow-sm backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
                            <SparkleIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                                {t("header.badge")}
                            </p>
                            <h1 className="text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
                                {t("header.title")}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        {customer && (
                            <span className="hidden text-sm text-gray-500 sm:inline">
                {customer.firstName} {customer.lastName}
              </span>
                        )}
                        <LanguageSwitcher />
                        <Link
                            href={`/${encodeURIComponent(slug)}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                        >
                            {t("header.site")}
                        </Link>
                        <Link
                            href={`/book-now/${encodeURIComponent(slug)}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"
                        >
                            <PlusIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">{t("header.bookAgain")}</span>
                            <span className="sm:hidden">{t("header.book")}</span>
                        </Link>
                        {customer && (
                            <button
                                type="button"
                                onClick={logout}
                                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                            >
                                {t("header.signOut")}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                {/* Alerts */}
                {(error || msg) && (
                    <div className="mb-6 space-y-2">
                        {error && (
                            <div
                                role="alert"
                                className="flex items-start gap-3 rounded-2xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm text-red-800"
                            >
                                <span className="mt-0.5 text-red-500">●</span>
                                <span className="flex-1">{error}</span>
                                <button
                                    type="button"
                                    onClick={() => setError("")}
                                    className="text-red-400 hover:text-red-600"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        {msg && (
                            <div
                                role="status"
                                className="flex items-start gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
                            >
                                <span className="mt-0.5 text-emerald-500">●</span>
                                <span className="flex-1">{msg}</span>
                                <button
                                    type="button"
                                    onClick={() => setMsg("")}
                                    className="text-emerald-400 hover:text-emerald-700"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Auth screens (centered card on desktop) ── */}
                {(step === "phone" || step === "code") && (
                    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
                        {/* Marketing panel — desktop only */}
                        <div className="hidden lg:block">
                            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-700">
                                {t("marketing.selfService")}
                            </p>
                            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 xl:text-4xl">
                                {t("marketing.heading")}
                            </h2>
                            <p className="mt-4 max-w-md text-base leading-relaxed text-gray-600">
                                {t("marketing.description")}
                            </p>
                            <ul className="mt-8 space-y-3 text-sm text-gray-600">
                                {[
                                    t("marketing.feature1"),
                                    t("marketing.feature2"),
                                    t("marketing.feature3"),
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mx-auto w-full max-w-md lg:mx-0">
                            {step === "phone" && (
                                <form
                                    onSubmit={sendCode}
                                    className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xl shadow-gray-200/50 sm:p-8"
                                >
                                    <div className="mb-6 text-center lg:text-left">
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            {t("phoneStep.heading")}
                                        </h2>
                                        <p className="mt-2 text-sm leading-relaxed text-gray-500">
                                            {t("phoneStep.description")}
                                        </p>
                                    </div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        {t("phoneStep.phoneLabel")}
                                    </label>
                                    <input
                                        className="mb-5 h-12 w-full rounded-2xl border border-gray-200 bg-gray-50/80 px-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder={t("phoneStep.phonePlaceholder")}
                                        autoComplete="tel"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || !phone.trim()}
                                        className="h-12 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60"
                                    >
                                        {loading ? t("phoneStep.sending") : t("phoneStep.sendCode")}
                                    </button>
                                </form>
                            )}

                            {step === "code" && (
                                <form
                                    onSubmit={verify}
                                    className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xl shadow-gray-200/50 sm:p-8"
                                >
                                    <div className="mb-6 text-center lg:text-left">
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            {t("codeStep.heading")}
                                        </h2>
                                        <p className="mt-2 text-sm text-gray-500">
                                            {t("codeStep.sentTo")}{" "}
                                            <span className="font-medium text-gray-800">{phone}</span>
                                        </p>
                                    </div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        {t("codeStep.codeLabel")}
                                    </label>
                                    <input
                                        className="mb-5 h-14 w-full rounded-2xl border border-gray-200 bg-gray-50/80 px-4 text-center text-2xl font-semibold tracking-[0.5em] outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15"
                                        value={code}
                                        onChange={(e) =>
                                            setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                                        }
                                        placeholder="••••••"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || code.length < 6}
                                        className="h-12 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60"
                                    >
                                        {loading ? t("codeStep.verifying") : t("codeStep.continue")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep("phone");
                                            setCode("");
                                        }}
                                        className="mt-4 w-full text-sm text-gray-500 transition hover:text-gray-800"
                                    >
                                        {t("codeStep.useDifferentPhone")}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Bookings dashboard ── */}
                {step === "bookings" && customer && (
                    <div className="space-y-8">
                        {/* Welcome + stats */}
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                                    {t("welcome", { name: customer.firstName })}
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">{customer.phone}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3 sm:gap-4">
                                <StatCard label={t("stats.upcoming")} value={stats.upcoming} accent />
                                <StatCard label={t("stats.completed")} value={stats.completed} />
                                <StatCard label={t("stats.total")} value={stats.total} />
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="inline-flex rounded-2xl bg-white p-1 shadow-sm ring-1 ring-gray-200/80">
                                {(
                                    [
                                        ["upcoming", t("filters.upcoming")],
                                        ["past", t("filters.past")],
                                        ["all", t("filters.all")],
                                    ] as const
                                ).map(([key, label]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setFilter(key)}
                                        className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                                            filter === key
                                                ? "bg-emerald-600 text-white shadow-sm"
                                                : "text-gray-600 hover:text-gray-900"
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            {loading && (
                                <p className="text-sm text-gray-400">{t("filters.refreshing")}</p>
                            )}
                        </div>

                        {/* Booking grid */}
                        {loading && bookings.length === 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-48 animate-pulse rounded-3xl bg-white/80 ring-1 ring-gray-100"
                                    />
                                ))}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-gray-200 bg-white/70 px-6 py-16 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                    <CalendarIcon className="h-7 w-7" />
                                </div>
                                <p className="text-base font-medium text-gray-900">
                                    {t("empty.noBookings")}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    {t("empty.scheduleWhenReady")}
                                </p>
                                <Link
                                    href={`/book-now/${encodeURIComponent(slug)}`}
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                                >
                                    <PlusIcon className="h-4 w-4" />
                                    {t("empty.bookACleaning")}
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {filtered.map((b) => (
                                    <article
                                        key={b.id}
                                        className="group flex flex-col rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/5"
                                    >
                                        <div className="mb-3 flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="truncate text-base font-semibold text-gray-900">
                                                    {b.service?.name || t("card.defaultServiceName")}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {formatWhen(b.scheduledStart)}
                                                </p>
                                            </div>
                                            <span
                                                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusColor(
                                                    b.status
                                                )}`}
                                            >
                        {statusLabel(b.status, tStatus)}
                      </span>
                                        </div>

                                        {(b.city || cleanerName(b)) && (
                                            <div className="mb-4 space-y-1.5 text-xs text-gray-500">
                                                {b.city && (
                                                    <p className="flex items-center gap-1.5 truncate">
                                                        <PinIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                                        {[b.addressLine1, b.city].filter(Boolean).join(", ")}
                                                    </p>
                                                )}
                                                {cleanerName(b) && (
                                                    <p className="flex items-center gap-1.5">
                                                        <UserIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                                        {cleanerName(b)}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-auto border-t border-gray-100 pt-4">
                                            <div className="mb-3 flex items-center justify-between">
                                                <p className="text-lg font-semibold tabular-nums text-gray-900">
                                                    {formatMoney(b.quotedPriceCents)}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <ActionBtn onClick={() => setDetail(b)}>{t("card.details")}</ActionBtn>
                                                {canModify(b) && (
                                                    <>
                                                        <ActionBtn
                                                            onClick={() => {
                                                                setRescheduleId(b.id);
                                                                setRescheduleStart("");
                                                            }}
                                                        >
                                                            {t("card.reschedule")}
                                                        </ActionBtn>
                                                        <ActionBtn
                                                            danger
                                                            onClick={() => handleCancel(b.id)}
                                                        >
                                                            {t("card.cancel")}
                                                        </ActionBtn>
                                                    </>
                                                )}
                                                {b.status === "COMPLETED" && !b.review && (
                                                    <ActionBtn
                                                        primary
                                                        onClick={() => {
                                                            setReviewId(b.id);
                                                            setRating(5);
                                                            setComment("");
                                                        }}
                                                    >
                                                        {t("card.review")}
                                                    </ActionBtn>
                                                )}
                                                {b.status === "COMPLETED" && !b.tipAmountCents && (
                                                    <ActionBtn
                                                        onClick={() => {
                                                            setTipId(b.id);
                                                            setTipCents(500);
                                                        }}
                                                    >
                                                        {t("card.tip")}
                                                    </ActionBtn>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-center text-xs text-gray-400 sm:px-6 lg:px-8">
                {t("footer")}
            </footer>

            {/* ── Modals ── */}
            {detail && (
                <Modal onClose={() => setDetail(null)} title={t("detailModal.title")} wide>
                    <dl className="grid gap-4 sm:grid-cols-2">
                        <DetailRow label={t("detailModal.service")} value={detail.service?.name || "—"} />
                        <DetailRow label={t("detailModal.when")} value={formatWhen(detail.scheduledStart)} />
                        <DetailRow
                            label={t("detailModal.address")}
                            value={[detail.addressLine1, detail.city, detail.state]
                                .filter(Boolean)
                                .join(", ")}
                        />
                        <DetailRow label={t("detailModal.status")} value={statusLabel(detail.status, tStatus)} />
                        <DetailRow
                            label={t("detailModal.price")}
                            value={formatMoney(detail.quotedPriceCents)}
                        />
                        {detail.tipAmountCents != null && detail.tipAmountCents > 0 && (
                            <DetailRow
                                label={t("detailModal.tip")}
                                value={formatMoney(detail.tipAmountCents)}
                            />
                        )}
                        {cleanerName(detail) && (
                            <DetailRow label={t("detailModal.cleaner")} value={cleanerName(detail)!} />
                        )}
                        {detail.review && (
                            <DetailRow
                                label={t("detailModal.yourReview")}
                                value={`${detail.review.rating}/5${
                                    detail.review.comment ? ` — ${detail.review.comment}` : ""
                                }`}
                            />
                        )}
                    </dl>
                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={() => setDetail(null)}
                            className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                        >
                            {t("detailModal.close")}
                        </button>
                    </div>
                </Modal>
            )}

            {rescheduleId && (
                <Modal onClose={() => setRescheduleId(null)} title={t("rescheduleModal.title")}>
                    <p className="mb-4 text-sm text-gray-600">
                        {t("rescheduleModal.description")}
                    </p>
                    <input
                        type="datetime-local"
                        className="mb-5 h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                        value={rescheduleStart}
                        onChange={(e) => setRescheduleStart(e.target.value)}
                    />
                    <ModalActions
                        onClose={() => setRescheduleId(null)}
                        onConfirm={handleReschedule}
                        confirmLabel={t("rescheduleModal.save")}
                        disabled={loading || !rescheduleStart}
                        loading={loading}
                    />
                </Modal>
            )}

            {reviewId && (
                <Modal onClose={() => setReviewId(null)} title={t("reviewModal.title")}>
                    <div className="mb-4 flex justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => setRating(n)}
                                className={`text-3xl transition ${
                                    n <= rating
                                        ? "text-amber-400 scale-110"
                                        : "text-gray-200 hover:text-amber-200"
                                }`}
                                aria-label={t("reviewModal.starsAriaLabel", { n })}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    <textarea
                        className="mb-5 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                        rows={3}
                        placeholder={t("reviewModal.commentPlaceholder")}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <ModalActions
                        onClose={() => setReviewId(null)}
                        onConfirm={handleReview}
                        confirmLabel={t("reviewModal.submit")}
                        disabled={loading}
                        loading={loading}
                    />
                </Modal>
            )}

            {tipId && (
                <Modal onClose={() => setTipId(null)} title={t("tipModal.title")}>
                    <p className="mb-4 text-sm text-gray-600">
                        {t("tipModal.description")}
                    </p>
                    <div className="mb-4 grid grid-cols-4 gap-2">
                        {[300, 500, 1000, 2000].map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setTipCents(c)}
                                className={`rounded-xl border py-2.5 text-sm font-semibold transition ${
                                    tipCents === c
                                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20"
                                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                {formatMoney(c)}
                            </button>
                        ))}
                    </div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-500">
                        {t("tipModal.customAmount", { currency })}
                    </label>
                    <input
                        type="number"
                        min={0.5}
                        step={0.5}
                        className="mb-5 h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                        value={(tipCents / 100).toFixed(2)}
                        onChange={(e) =>
                            setTipCents(Math.max(50, Math.round(Number(e.target.value) * 100)))
                        }
                    />
                    <ModalActions
                        onClose={() => setTipId(null)}
                        onConfirm={handleTip}
                        confirmLabel={t("tipModal.tipButton", { amount: formatMoney(tipCents) })}
                        disabled={loading || tipCents < 50}
                        loading={loading}
                    />
                </Modal>
            )}
        </div>
    );
}

/* ─── Small UI pieces ─── */

function StatCard({
                      label,
                      value,
                      accent,
                  }: {
    label: string;
    value: number;
    accent?: boolean;
}) {
    return (
        <div
            className={`min-w-[5.5rem] rounded-2xl px-4 py-3 text-center shadow-sm ring-1 ${
                accent
                    ? "bg-emerald-600 text-white ring-emerald-600"
                    : "bg-white text-gray-900 ring-gray-200/80"
            }`}
        >
            <p
                className={`text-2xl font-semibold tabular-nums ${
                    accent ? "text-white" : "text-gray-900"
                }`}
            >
                {value}
            </p>
            <p
                className={`text-[11px] font-medium uppercase tracking-wide ${
                    accent ? "text-emerald-100" : "text-gray-500"
                }`}
            >
                {label}
            </p>
        </div>
    );
}

function ActionBtn({
                       children,
                       onClick,
                       primary,
                       danger,
                   }: {
    children: React.ReactNode;
    onClick: () => void;
    primary?: boolean;
    danger?: boolean;
}) {
    const base =
        "rounded-xl px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-1";
    if (danger) {
        return (
            <button
                type="button"
                onClick={onClick}
                className={`${base} border border-red-200 text-red-600 hover:bg-red-50 focus:ring-red-200`}
            >
                {children}
            </button>
        );
    }
    if (primary) {
        return (
            <button
                type="button"
                onClick={onClick}
                className={`${base} bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-300`}
            >
                {children}
            </button>
        );
    }
    return (
        <button
            type="button"
            onClick={onClick}
            className={`${base} border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-200`}
        >
            {children}
        </button>
    );
}

function Modal({
                   title,
                   children,
                   onClose,
                   wide,
               }: {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
    wide?: boolean;
}) {
    const t = useTranslations("Portal");
    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/40 p-4 backdrop-blur-sm sm:items-center"
            onClick={onClose}
        >
            <div
                className={`w-full rounded-3xl bg-white p-6 shadow-2xl sm:p-7 ${
                    wide ? "max-w-lg" : "max-w-md"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-5 flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        aria-label={t("closeAria")}
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

function ModalActions({
                          onClose,
                          onConfirm,
                          confirmLabel,
                          disabled,
                          loading,
                      }: {
    onClose: () => void;
    onConfirm: () => void;
    confirmLabel: string;
    disabled?: boolean;
    loading?: boolean;
}) {
    const t = useTranslations("Portal");
    return (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
                {t("modalCancel")}
            </button>
            <button
                type="button"
                onClick={onConfirm}
                disabled={disabled}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
            >
                {loading ? t("pleaseWait") : confirmLabel}
            </button>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {label}
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-gray-900">{value || "—"}</dd>
        </div>
    );
}

/* Icons (inline SVG — no extra deps) */

function SparkleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2l1.8 5.4L19 9.2l-5.2 1.8L12 16.4l-1.8-5.4L5 9.2l5.2-1.8L12 2zm6 10l.9 2.7L22 16l-3.1.9L18 20l-.9-3.1L14 16l3.1-.9L18 12zM6 14l.7 2.1L9 17l-2.3.7L6 20l-.7-2.3L3 17l2.3-.9L6 14z" />
        </svg>
    );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
    );
}

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function CalendarIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
        </svg>
    );
}

function PinIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
            <circle cx="12" cy="10" r="2.5" />
        </svg>
    );
}

function UserIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 19c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" strokeLinecap="round" />
        </svg>
    );
}