import axios from "axios";
import { toast } from "sonner";

import { useUserStore } from "@/src/stores/user-store";

function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }

  return process.env.NEXT_PUBLIC_BASE_URL;
}

export const axiosInstance = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Separate, interceptor-free instance for the refresh-token call itself,
// so a 401 from the refresh endpoint doesn't recurse back into the response
// interceptor below.
const refreshClient = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// TEMPORARY: these endpoints return HTTP 401 for permission-denied instead of 403.
// Remove entries here once the backend ships proper 403s for that endpoint family.
const KNOWN_401_FOR_PERMISSION_DENIED = ['/admin/analytics/', '/admin/reports/', '/admin/dashboard-analytics'];

function forceLogout() {
    const { logout } = useUserStore.getState();
    logout();
    if (typeof window !== "undefined") {
        toast.error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى");
        // window.location.href is a hard reload — delay it slightly so the
        // toast (rendered via a portal that a hard nav would unmount instantly)
        // is actually visible before the page unloads.
        setTimeout(() => {
            window.location.href = "/login";
        }, 1200);
    }
}

// Dedupes concurrent 401s into a single in-flight refresh call; every request
// that 401s while a refresh is already running awaits this same promise
// instead of firing its own refresh request.
let refreshPromise = null;

function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const { refreshToken, setToken, setRefreshToken } = useUserStore.getState();
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }
            const res = await refreshClient.post('/admin/employees/refresh-token', { refresh_token: refreshToken });
            const newToken = res.data?.data?.token;
            const newRefreshToken = res.data?.data?.refresh_token;
            if (!newToken) {
                throw new Error('Refresh response missing token');
            }
            setToken(newToken);
            setRefreshToken(newRefreshToken || refreshToken);
            return newToken;
        })().finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
}

axiosInstance.interceptors.request.use((config) => {
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    }

    let token = useUserStore.getState().token;
    if (!token && typeof window !== 'undefined') {
        token = localStorage.getItem('token') || sessionStorage.getItem('token');
    }
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        // Skip the login endpoint itself: a 401 there just means wrong credentials,
        // not an expired session, so it shouldn't force-logout/redirect.
        const isLoginRequest = error.config?.url?.includes('/admin/employees/login');
        const isRefreshRequest = error.config?.url?.includes('/admin/employees/refresh-token');
        const skipAuthLogout = error.config?.skipAuthLogout === true;
        const requestUrl = error.config?.url || '';
        const isScopedPermissionEndpoint = KNOWN_401_FOR_PERMISSION_DENIED.some((path) => requestUrl.includes(path));

        // A real 403 means "authenticated but not permitted" — never logout/redirect
        // for it, just let the caller handle/display the error.
        if (status === 403) {
            return Promise.reject(error);
        }

        if (status === 401 && !isLoginRequest && !isRefreshRequest && !skipAuthLogout && !isScopedPermissionEndpoint) {
            const { refreshToken } = useUserStore.getState();
            const alreadyRetried = error.config?._retriedAfterRefresh === true;

            if (refreshToken && !alreadyRetried) {
                try {
                    const newToken = await refreshAccessToken();
                    const retriedConfig = { ...error.config, _retriedAfterRefresh: true };
                    retriedConfig.headers = { ...retriedConfig.headers, Authorization: `Bearer ${newToken}` };
                    return axiosInstance(retriedConfig);
                } catch (refreshError) {
                    forceLogout();
                    return Promise.reject(error);
                }
            }

            forceLogout();
        }
        return Promise.reject(error);
    }
);
