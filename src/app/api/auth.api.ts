import { authFetch } from "@/app/api/authFetch";

// ─── Shared envelope ──────────────────────────────────────────
// Every cleansera_sass response follows this shape: { success, message, data }.
// Unlike some other backends, tokens live INSIDE data — never at the
// envelope root — for both /auth/login and /auth/refresh.
interface ApiEnvelope<T> {
    success: boolean;
    message: string | null;
    data: T;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface RegisterBusinessPayload {
    businessName: string;
    subdomain: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface CurrentUser {
    id: string;
    email: string;
    phone: string | null;
    firstName: string;
    lastName: string;
    isEmailVerified: boolean;
    twoFactorEnabled: boolean;
    createdAt: string;
    globalRole: "SUPER_ADMIN" | "PLATFORM_USER";
    businessId: string | null;
    businessRole: "BUSINESS_OWNER" | "BUSINESS_MANAGER" | "CLEANER" | null;
    business: { id: string; name: string; subdomain: string; timezone: string } | null;
}

async function post<T>(path: string, body?: unknown): Promise<ApiEnvelope<T>> {
    return authFetch(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined });
}

export const authApi = {
    register: (payload: RegisterBusinessPayload) => post<AuthTokens>("/auth/register", payload),

    login: (payload: LoginPayload) => post<AuthTokens>("/auth/login", payload),

    refresh: (refreshToken: string) => post<AuthTokens>("/auth/refresh", { refreshToken }),

    logout: (refreshToken: string) => post<null>("/auth/logout", { refreshToken }),

    requestPasswordReset: (email: string) => post<null>("/auth/password-reset/request", { email }),

    confirmPasswordReset: (token: string, password: string) =>
        post<null>("/auth/password-reset/confirm", { token, password }),

    requestEmailVerify: () => post<null>("/auth/email/verify/request"),

    confirmEmailVerify: (code: string) => post<null>("/auth/email/verify/confirm", { code }),

    generate2FA: () => post<{ otpauth_url: string; base32: string }>("/auth/2fa/generate"),

    verifyEnable2FA: (token: string) => post<null>("/auth/2fa/verify-enable", { token }),

    // Our backend's disable route needs no confirmation payload — it acts on
    // the authenticated user directly — but the modal UI collects one for
    // extra confirmation before calling this, so accept and ignore it.
    disable2FA: (_confirmation?: { totpCode?: string; password?: string }) => post<null>("/auth/2fa/disable"),

    // ─── Convenience aliases used by the auth pages ──────────────────
    // cleansera_sass's email-verify routes require an authenticated
    // session (they act on req.user, not a userId/email from the request
    // body), so these ignore any userId/email argument the page passes
    // and act on whoever's currently logged in.
    forgotPassword: (email: string) => post<null>("/auth/password-reset/request", { email }),

    resetPassword: (payload: { token: string; password: string }) =>
        post<null>("/auth/password-reset/confirm", payload),

    verifyEmail: (payload: { userId?: string; code: string }) =>
        post<null>("/auth/email/verify/confirm", { code: payload.code }),

    resendVerification: (_email?: string) => post<null>("/auth/email/verify/request"),

    getMe: async () => {
        const result = await authFetch("/auth/me", { method: "GET" });
        return result.data as CurrentUser;
    },
};
