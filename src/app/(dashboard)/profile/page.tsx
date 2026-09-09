"use client";

import React, { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/app/api/authFetch";
import {TwoFactorModal} from "@/components/modals/twoFactorModal/twoFactorModal";
import { Disable2FAModal } from "@/components/modals/twoFactorModal/Disable2FAModal";
import {useAuth} from "@/app/auth/useAuth";
import {useRouter} from "next/navigation";

type Credential = {
    type: string;
    status: string;
    expiresAt?: string | null;
};

type Wallet = {
    pendingBalance: number;
    availableBalance: number;
    lifetimeEarnings: number;
};

type UserProfile = {
    id: string;
    email: string;
    phone?: string;
    role: string;
    status: string;
    verificationStatus: string;
    twoFactorEnabled: boolean;
    lastLoginAt?: string;

    adminProfile?: {
        firstName: string;
        lastName: string;
        avatarUrl?: string;
    };

    cleanerProfile?: {
        firstName: string;
        lastName: string;
        designation: string;
        bio?: string;
        availabilityRadius?: number;
        credentials: Credential[];
        wallet?: Wallet;
    };

    businessMember?: {
        businessId: string;
        firstName: string;
        lastName: string;
        jobTitle?: string;
    };
};

function formatDate(value?: string | null) {
    if (!value) return "-";
    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [bio, setBio] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!isLoading && user === null) {
            router.replace("/");
        }
    }, [user,isLoading, router]);
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ── 2FA modal state ───────────────────────────────────────────────────
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);

    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await authFetch("/users/me", { method: "GET" });

            if (!result.success) throw new Error(result.message);

            const data = result.data;
            setProfile(data);
            setPhone(data.phone || "");

            if (data.cleanerProfile) {
                setFirstName(data.cleanerProfile.firstName || "");
                setLastName(data.cleanerProfile.lastName || "");
                setBio(data.cleanerProfile.bio || "");
            }

            if (data.adminProfile) {
                setFirstName(data.adminProfile.firstName || "");
                setLastName(data.adminProfile.lastName || "");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    async function updateProfile() {
        setIsSaving(true);
        setError("");
        setSuccess("");

        try {
            const result = await authFetch("/users/me", {
                method: "PATCH",
                body: JSON.stringify({ firstName, lastName, phone, bio }),
            });

            if (!result.success) throw new Error(result.message);

            setSuccess("Profile updated successfully.");
            fetchProfile();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    }

    async function changePassword() {
        setIsChangingPassword(true);
        try {
            const result = await authFetch("/users/me/password", {
                method: "PATCH",
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (!result.success) throw new Error(result.message);

            setSuccess("Password changed successfully.");
            setCurrentPassword("");
            setNewPassword("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsChangingPassword(false);
        }
    }

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
                Loading profile...
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* 2FA Modal */}
            {show2FAModal && (
                <TwoFactorModal
                    isEnabled={profile?.twoFactorEnabled ?? false}
                    onClose={() => setShow2FAModal(false)}
                    onSuccess={() => {
                        // Refresh profile so twoFactorEnabled reflects the new state
                        fetchProfile();
                        setSuccess("Two-factor authentication has been enabled.");
                    }}
                />
            )}

            {showDisable2FAModal && (
                <Disable2FAModal
                    onClose={() => setShowDisable2FAModal(false)}
                    onSuccess={() => {
                    fetchProfile();
                    setSuccess("Two-factor authentication has been disabled.");
                    }}
                />
                )}

            {/* Profile Summary */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-600">
                        {firstName?.charAt(0)}
                        {lastName?.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {firstName} {lastName}
                        </h1>
                        <p className="text-sm text-gray-500">{profile?.email}</p>
                        <div className="mt-2 flex gap-2">
                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                {profile?.status}
                            </span>
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                {profile?.verificationStatus}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
                    {success}
                </div>
            )}

            {/* Personal Information */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h2 className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">
                    Personal Information
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        className="rounded-lg border p-3 text-gray-900 dark:text-white"
                    />
                    <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        className="rounded-lg border p-3 text-gray-900 dark:text-white"
                    />
                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone Number"
                        className="rounded-lg border p-3 text-gray-900 dark:text-white"
                    />
                </div>

                {profile?.cleanerProfile && (
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        placeholder="Bio"
                        className="mt-4 w-full rounded-lg border p-3 text-gray-900 dark:text-white"
                    />
                )}

                <button
                    onClick={updateProfile}
                    disabled={isSaving}
                    className="mt-5 rounded-lg bg-brand-500 px-5 py-3 text-white"
                >
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {/* Account Information */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h2 className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">
                    Account Information
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <Info label="Role" value={profile?.role} />
                    <Info label="Email" value={profile?.email} />
                    <Info
                        label="2FA Enabled"
                        value={profile?.twoFactorEnabled ? "Yes" : "No"}
                        twoFactorEnabled={profile?.twoFactorEnabled}
                        onEnable2FA={() => setShow2FAModal(true)}
                        onDisable2FA={() => setShowDisable2FAModal(true)}
                        />
                    <Info label="Last Login" value={formatDate(profile?.lastLoginAt)} />
                </div>
            </div>

            {/* Change Password */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h2 className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">
                    Change Password
                </h2>
                <div className="grid gap-4">
                    <input
                        type="password"
                        placeholder="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="rounded-lg border p-3 text-gray-900 dark:text-white"
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="rounded-lg border p-3 text-gray-900 dark:text-white"
                    />
                    <button
                        onClick={changePassword}
                        disabled={isChangingPassword}
                        className="rounded-lg bg-brand-500 px-5 py-3 text-white"
                    >
                        {isChangingPassword ? "Updating..." : "Change Password"}
                    </button>
                </div>
            </div>

        </div>
    );
}

// ── Info card ─────────────────────────────────────────────────────────────────

function Info({
  label,
  value,
  twoFactorEnabled,
  onEnable2FA,
  onDisable2FA,
}: {
  label: string;
  value?: string | number;
  twoFactorEnabled?: boolean;
  onEnable2FA?: () => void;
  onDisable2FA?: () => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-gray-500">{label}</p>
          <p className="mt-1 font-medium text-gray-900 dark:text-white">
            {value || "-"}
          </p>
        </div>

        {label === "2FA Enabled" && !twoFactorEnabled && (
          <button
            onClick={onEnable2FA}
            className="rounded-lg bg-brand-500 hover:bg-brand-600 px-4 py-2 text-sm font-medium text-white transition"
          >
            Enable
          </button>
        )}

        {label === "2FA Enabled" && twoFactorEnabled && (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Active
            </span>
            <button
              onClick={onDisable2FA}
              className="rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 px-3 py-1.5 text-xs font-medium transition"
            >
              Disable
            </button>
          </div>
        )}
      </div>
    </div>
  );
}