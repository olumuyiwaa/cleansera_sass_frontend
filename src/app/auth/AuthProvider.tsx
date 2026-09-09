"use client";

import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { AuthContextType, User } from "../api/types";
import { authApi, LoginPayload } from "../api/auth.api";
import { sessionService } from "../services/session.service";
import { socketService } from "@/app/services/socket.service";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSetUser = async () => {
    const me = await authApi.getMe();
    setUser(me);
  };

  const login = async (payload: LoginPayload) => {
    const envelope = await authApi.login(payload);
    // cleansera_sass nests tokens inside data — never at the envelope root
    const { accessToken, refreshToken } = envelope.data;
    sessionService.setTokens(accessToken, refreshToken);
    socketService.connect(accessToken);
    await fetchAndSetUser();
  };

  const logout = async () => {
    try {
      const refreshToken = sessionService.getRefreshToken();
      if (refreshToken) await authApi.logout(refreshToken);
    } catch (err) {
      console.error("Logout API error:", err);
    }

    sessionService.clearSession();
    socketService.disconnect();
    setUser(null);
    window.location.href = "/";
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = sessionService.getAccessToken();
        if (!token) return;

        socketService.connect(token);
        await fetchAndSetUser();
      } catch {
        sessionService.clearSession();
        socketService.disconnect();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
