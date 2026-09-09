"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import {authFetch} from "@/app/api/authFetch";
import {NotificationItem, Pagination} from "@/app/api/types";
import {useAuth} from "@/app/auth/useAuth";
import {useRouter} from "next/navigation";

function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;

    return "Something went wrong.";
}

function formatDateTime(value?: string | null) {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function formatLabel(value?: string | null) {
    if (!value) return "-";

    return value.replaceAll("_", " ");
}

function getNotificationBadgeClass(type: string) {
    switch (type) {
        case "CREDENTIAL_APPROVED":
        case "BOOKING_CONFIRMATION":
            return "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300";

        case "CREDENTIAL_REJECTED":
        case "SHIFT_CANCELLED":
            return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";

        case "CREDENTIAL_EXPIRY":
        case "PAYMENT_ALERT":
            return "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300";

        case "NEW_MESSAGE":
            return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300";

        default:
            return "bg-gray-100 text-gray-700 dark:bg-white/[0.06] dark:text-gray-300";
    }
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);

    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [unreadOnly, setUnreadOnly] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const { user } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!isLoading && user === null) {
            router.replace("/");
        }
    }, [user,isLoading, router]);
    const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
    const [markingId, setMarkingId] = useState("");

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const queryString = useMemo(() => {
        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("limit", String(limit));

        if (unreadOnly) {
            params.set("unreadOnly", "true");
        }

        return params.toString();
    }, [limit, page, unreadOnly]);


    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            const result = await authFetch(
                `/notifications?${queryString}`,
                {
                    method: "GET",
                }
            );

            if (!result.success) {
                throw new Error(result.message || "Unable to load notifications.");
            }

            setNotifications(result.data || []);
            setPagination(result.pagination || null);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    }, [queryString]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    async function markNotificationAsRead(notificationId: string) {
        setMarkingId(notificationId);
        setError("");
        setSuccessMessage("");

        try {
            const result = await authFetch(
                `/notifications/${notificationId}/read`,
                {
                    method: "PATCH",
                }
            );

            if (!result.success) {
                throw new Error(result.message || "Unable to mark notification as read.");
            }

            setSuccessMessage(result.message || "Notification marked as read.");

            setNotifications((previous) =>
                previous.map((notification) =>
                    notification.id === notificationId
                        ? {
                            ...notification,
                            isRead: true,
                            readAt: new Date().toISOString(),
                        }
                        : notification,
                ),
            );

            if (unreadOnly) {
                await fetchNotifications();
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setMarkingId("");
        }
    }

    async function markAllAsRead() {
        setIsMarkingAllRead(true);
        setError("");
        setSuccessMessage("");

        try {
            const result = await authFetch(
                `/notifications/read-all`,
                {
                    method: "PATCH",
                }
            );

            if (!result.success) {
                throw new Error(result.message || "Unable to mark all notifications as read.");
            }

            setSuccessMessage(result.message || "All notifications marked as read.");

            if (unreadOnly) {
                setNotifications([]);
                setPagination((previous) =>
                    previous
                        ? {
                            ...previous,
                            total: 0,
                            totalPages: 1,
                            hasNext: false,
                            hasPrev: false,
                        }
                        : previous,
                );
            } else {
                setNotifications((previous) =>
                    previous.map((notification) => ({
                        ...notification,
                        isRead: true,
                        readAt: notification.readAt || new Date().toISOString(),
                    })),
                );
            }

            await fetchNotifications();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsMarkingAllRead(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Notifications
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Review and manage your system notifications.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            disabled={isMarkingAllRead || notifications.length === 0}
                            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isMarkingAllRead ? "Saving..." : "Mark All Read"}
                        </button>

                        <button
                            type="button"
                            onClick={fetchNotifications}
                            disabled={isLoading}
                            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        >
                            {isLoading ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                </div>

                {error ? (
                    <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                        {error}
                    </div>
                ) : null}

                {successMessage ? (
                    <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
                        {successMessage}
                    </div>
                ) : null}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <input
                            type="checkbox"
                            checked={unreadOnly}
                            onChange={(event) => {
                                setPage(1);
                                setUnreadOnly(event.target.checked);
                            }}
                        />
                        Show unread only
                    </label>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total: {pagination?.total ?? notifications.length}
                    </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="max-w-full overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                                    Notification
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                                    Type
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                                    Channel
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                                    Status
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                                    Created
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                                    Actions
                                </th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-500">
                                        Loading notifications...
                                    </td>
                                </tr>
                            ) : notifications.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-500">
                                        No notifications found.
                                    </td>
                                </tr>
                            ) : (
                                notifications.map((notification) => (
                                    <tr
                                        key={notification.id}
                                        className={!notification.isRead ? "bg-brand-50/40 dark:bg-brand-500/5" : ""}
                                    >
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                                {notification.title}
                                            </p>
                                            <p className="mt-1 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                                                {notification.body}
                                            </p>
                                            {notification.readAt ? (
                                                <p className="mt-1 text-xs text-gray-400">
                                                    Read: {formatDateTime(notification.readAt)}
                                                </p>
                                            ) : null}
                                        </td>

                                        <td className="px-5 py-4">
                        <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${getNotificationBadgeClass(
                                notification.type,
                            )}`}
                        >
                          {formatLabel(notification.type)}
                        </span>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            {formatLabel(notification.channel)}
                                        </td>

                                        <td className="px-5 py-4">
                                            {notification.isRead ? (
                                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-white/[0.06] dark:text-gray-300">
                            Read
                          </span>
                                            ) : (
                                                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                            Unread
                          </span>
                                            )}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            {formatDateTime(notification.createdAt)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <button
                                                type="button"
                                                onClick={() => markNotificationAsRead(notification.id)}
                                                disabled={notification.isRead || markingId === notification.id}
                                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                                            >
                                                {markingId === notification.id ? "Saving..." : "Mark Read"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Page {pagination?.page ?? page} of {pagination?.totalPages ?? 1}
                    </p>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={!pagination?.hasPrev && page <= 1}
                            onClick={() => setPage((previous) => Math.max(previous - 1, 1))}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        >
                            Previous
                        </button>

                        <button
                            type="button"
                            disabled={pagination ? !pagination.hasNext : notifications.length < limit}
                            onClick={() => setPage((previous) => previous + 1)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}