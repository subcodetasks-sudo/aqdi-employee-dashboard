import axios from "axios";
import { toast } from "sonner";

import { clearAuthSession, readLegacyTokens, clearLegacyTokens } from "@/src/lib/auth-session";
import { useUserStore } from "@/src/stores/user-store";
import { removeAuthCookie } from "@/src/app/actions/auth";

function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }

  return process.env.NEXT_PUBLIC_BASE_URL;
}

export const AUTH_ENDPOINTS = {
  login: "/admin/employees/login",
  refresh: "/admin/employees/refresh-token",
  logout: "/admin/employees/logout",
  fcm: "/admin/employees/fcm",
};

export const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 25000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": "ar",
  },
});

function isLoginPage() {
  return typeof window !== "undefined" && window.location.pathname.startsWith("/login");
}

function isLogoutRequest(url = "") {
  return url.includes(AUTH_ENDPOINTS.logout);
}

let sessionExpired = false;

export function resetSessionGuard() {
  sessionExpired = false;
}

async function forceLogout() {
  if (sessionExpired) return;
  sessionExpired = true;

  const { disconnectFcmToken, getStoredFcmToken } = await import("@/src/lib/firebase/messaging");
  const fcmToken = getStoredFcmToken();
  const payload = {};
  if (fcmToken) payload.fcm_token = fcmToken;

  axiosInstance.post(AUTH_ENDPOINTS.logout, payload).catch(() => {});
  await disconnectFcmToken().catch(() => {});
  clearAuthSession();

  if (typeof window !== "undefined") {
    await removeAuthCookie().catch(() => {});
  }

  if (typeof window !== "undefined" && !isLoginPage()) {
    toast.error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1200);
  }
}

axiosInstance.interceptors.request.use((config) => {
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  // Tokens are httpOnly cookies attached by the browser. Never copy them onto
  // the request from script-readable storage.
  if (config.headers) {
    delete config.headers.Authorization;
    delete config.headers.authorization;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const expired = error.response?.headers?.["x-session-expired"] === "1";
    const url = error.config?.url || "";

    if (status === 401 && expired && !isLogoutRequest(url)) {
      const original = error.config;
      // A parallel request may have just saved a new session cookie. Retry once
      // before treating the 401 as a dead login.
      if (original && !original._sessionRetry) {
        original._sessionRetry = true;
        return axiosInstance(original);
      }

      useUserStore.setState({ user: null, token: null, isAuthenticated: false });
      forceLogout();
    }

    return Promise.reject(error);
  }
);

/**
 * Moves a legacy localStorage session into httpOnly cookies before the app
 * renders authenticated queries. Safe to call when there is nothing to move.
 */
export async function bootstrapAuthSession() {
  const legacy = readLegacyTokens();
  if (!legacy) {
    clearLegacyTokens();
    return;
  }

  try {
    const response = await fetch("/api/auth/adopt-session", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        token: legacy.accessToken,
        refresh_token: legacy.refreshToken,
        token_expires_at: legacy.expiresAt,
        remember: legacy.remember,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) {
      clearLegacyTokens();
    }
  } catch {
    // Keep the legacy copy so the next load can try again.
  }
}
