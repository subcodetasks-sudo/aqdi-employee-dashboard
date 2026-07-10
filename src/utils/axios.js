import axios from "axios";


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

axiosInstance.interceptors.request.use((config) => {
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
        // Skip the login endpoint itself: a 401 there just means wrong credentials,
        // not an expired session, so it shouldn't force-logout/redirect.
        const isLoginRequest = error.config?.url?.includes('/admin/employees/login');
        if (error.response?.status === 401 && !isLoginRequest) {
            const { logout } = useUserStore.getState();
            await logout();
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

