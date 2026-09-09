const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://159.203.13.162:8000/api/v1";

import { sessionService } from "../services/session.service";

export async function refreshAccessToken() {
    const refreshToken =
        sessionService.getRefreshToken();

    if (!refreshToken) {
        throw new Error("No refresh token found");
    }

    const res = await fetch(
        `${API_BASE_URL}/auth/refresh`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
        }
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(
            data?.message || "Refresh failed"
        );
    }

    sessionService.setTokens(
        data.data.accessToken,
        data.data.refreshToken
    );

    return data.data.accessToken;
}