"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/app/auth/useAuth";
import { useRouter } from "next/navigation";
import {
    getMe,
    updateMe,
    changePassword,
    generate2FA,
    verifyEnable2FA,
    disable2FA,
    type CurrentUserProfile,
} from "@/app/api/profile.api";

function formatDate(value?: string | null) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function formatRole(role?: string | null) {
    if (!role) return "—";
    return role
        .split("_")
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(" ");
}

export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // 2FA
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [otpauthUrl, setOtpauthUrl] = useState("");
    const [base32, setBase32] = useState("");
    const [totpCode, setTotpCode] = useState("");
    const [twoFaBusy, setTwoFaBusy] = useState(false);

    useEffect(() => {
        if (!isLoading && user === null) {
            router.replace("/");
        }
    }, [user, isLoading, router]);

    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        setError("");
        try {
            const data = await getMe();
            setProfile(data);
            setFirstName(data.firstName || "");
            setLastName(data.lastName || "");
            setPhone(data.phone || "");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load profile");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    async function handleUpdateProfile() {
        setIsSaving(true);
        setError("");
        setSuccess("");
        try {
            const updated = await updateMe({ firstName, lastName, phone: phone || null });
            setProfile(updated);
            setSuccess("Profile updated successfully.");
            // Keep auth context in sync if shape matches
            if (setUser && user) {
                setUser({ ...user, firstName: updated.firstName, lastName: updated.lastName, phone: updated.phone } as typeof user);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleChangePassword() {
        setIsChangingPassword(true);
        setError("");
        setSuccess("");
        try {
            await changePassword({ currentPassword, newPassword });
            setSuccess("Password changed. You may need to sign in again on other devices.");
            setCurrentPassword("");
            setNewPassword("");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to change password");
        } finally {
            setIsChangingPassword(false);
        }
    }

    async function handleStart2FA() {
        setTwoFaBusy(true);
        setError("");
        try {
            const secret = await generate2FA();
            setOtpauthUrl(secret.otpauth_url || "");
            setBase32(secret.base32 || "");
            setShow2FASetup(true);
            setTotpCode("");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to start 2FA setup");
        } finally {
            setTwoFaBusy(false);
        }
    }

    async function handleConfirm2FA() {
        if (!totpCode.trim()) return;
        setTwoFaBusy(true);
        setError("");
        try {
            await verifyEnable2FA(totpCode.trim());
            setShow2FASetup(false);
            setSuccess("Two-factor authentication enabled.");
            await fetchProfile();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Invalid code");
        } finally {
            setTwoFaBusy(false);
        }
    }

    async function handleDisable2FA() {
        if (!confirm("Disable two-factor authentication?")) return;
        setTwoFaBusy(true);
        setError("");
        try {
            await disable2FA();
            setSuccess("Two-factor authentication disabled.");
            await fetchProfile();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to disable 2FA");
        } finally {
            setTwoFaBusy(false);
        }
    }

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                Loading profile…
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-6">
            {/* Summary */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
                        {(firstName?.charAt(0) || "?").toUpperCase()}
                        {(lastName?.charAt(0) || "").toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {firstName} {lastName}
                        </h1>
                        <p className="text-sm text-gray-500">{profile?.email}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {profile?.businessRole && (
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  {formatRole(profile.businessRole)}
                </span>
                            )}
                            {profile?.business?.name && (
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-white/[0.06] dark:text-gray-300">
                  {profile.business.name}
                </span>
                            )}
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    profile?.isEmailVerified
                                        ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300"
                                        : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                                }`}
                            >
                {profile?.isEmailVerified ? "Email verified" : "Email not verified"}
              </span>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                    {error}
                </div>
            )}
            {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400">
                    {success}
                </div>
            )}

            {/* Personal info */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h2 className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">
                    Personal information
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="rounded-lg border border-gray-300 p-3 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                    <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        className="rounded-lg border border-gray-300 p-3 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone number"
                        className="rounded-lg border border-gray-300 p-3 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                    <input
                        value={profile?.email || ""}
                        disabled
                        className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-500 dark:border-gray-800 dark:bg-gray-900/50"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleUpdateProfile}
                    disabled={isSaving}
                    className="mt-5 rounded-lg bg-brand-500 px-5 py-3 text-white hover:bg-brand-600 disabled:opacity-60"
                >
                    {isSaving ? "Saving…" : "Save changes"}
                </button>
            </div>

            {/* Account */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h2 className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">
                    Account
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <Info label="Role" value={formatRole(profile?.businessRole)} />
                    <Info label="Business" value={profile?.business?.name} />
                    <Info label="Timezone" value={profile?.business?.timezone} />
                    <Info label="Member since" value={formatDate(profile?.createdAt)} />
                </div>

                <div className="mt-6 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase text-gray-500">Two-factor authentication</p>
                            <p className="mt-1 font-medium text-gray-900 dark:text-white">
                                {profile?.twoFactorEnabled ? "Enabled" : "Disabled"}
                            </p>
                        </div>
                        {profile?.twoFactorEnabled ? (
                            <button
                                type="button"
                                onClick={handleDisable2FA}
                                disabled={twoFaBusy}
                                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                            >
                                Disable
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleStart2FA}
                                disabled={twoFaBusy}
                                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                            >
                                {twoFaBusy ? "…" : "Enable"}
                            </button>
                        )}
                    </div>

                    {show2FASetup && (
                        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Add this secret to your authenticator app, then enter a 6-digit code to confirm.
                            </p>
                            {base32 && (
                                <p className="break-all rounded-lg bg-gray-50 p-3 font-mono text-xs dark:bg-gray-900">
                                    {base32}
                                </p>
                            )}
                            {otpauthUrl && (
                                <p className="break-all text-xs text-gray-400">{otpauthUrl}</p>
                            )}
                            <div className="flex flex-wrap gap-2">
                                <input
                                    value={totpCode}
                                    onChange={(e) => setTotpCode(e.target.value)}
                                    placeholder="6-digit code"
                                    className="h-11 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={handleConfirm2FA}
                                    disabled={twoFaBusy || !totpCode.trim()}
                                    className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                                >
                                    Confirm & enable
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShow2FASetup(false)}
                                    className="rounded-lg border px-4 py-2 text-sm text-gray-600 dark:border-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Password */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h2 className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">
                    Change password
                </h2>
                <div className="grid max-w-md gap-4">
                    <input
                        type="password"
                        placeholder="Current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="rounded-lg border border-gray-300 p-3 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                    <input
                        type="password"
                        placeholder="New password (min 8 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="rounded-lg border border-gray-300 p-3 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                    <button
                        type="button"
                        onClick={handleChangePassword}
                        disabled={isChangingPassword || !currentPassword || newPassword.length < 8}
                        className="rounded-lg bg-brand-500 px-5 py-3 text-white hover:bg-brand-600 disabled:opacity-60"
                    >
                        {isChangingPassword ? "Updating…" : "Change password"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Info({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <p className="text-xs uppercase text-gray-500">{label}</p>
            <p className="mt-1 font-medium text-gray-900 dark:text-white">{value || "—"}</p>
        </div>
    );
}