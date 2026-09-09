import { sessionService } from "../services/session.service";
import { refreshAccessToken } from "./client";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export async function authFetch(
    url: string,
    options: RequestInit = {}
) {
    let token = sessionService.getAccessToken();

    const makeRequest = async (accessToken?: string) =>
        fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${accessToken || token}`,
                ...options.headers,
            },
        });

    let response = await makeRequest();

    if (response.status === 401) {
        try {
            const newToken = await refreshAccessToken();
            response = await makeRequest(newToken);
        } catch {
            sessionService.clearSession();

            window.location.href = "/";

            throw new Error("Session expired");
        }
    }

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Request failed"
        );
    }

    return result;
}