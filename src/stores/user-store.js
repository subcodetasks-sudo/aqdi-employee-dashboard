import { create } from 'zustand';
import { removeAuthCookie } from '@/src/app/actions/auth';
import { getAccessToken, getAuthUser, setAuthSession, clearAuthSession } from '@/src/lib/auth-session';
import { resetSessionGuard } from '@/src/utils/axios';

// Reactive cache over the auth-session storage module (src/lib/auth-session.js),
// which is the actual source of truth for tokens — read/written directly by
// src/utils/axios.js's interceptors, including on silent background refresh.
// This store exists so components can reactively read `user`/`isAuthenticated`
// without polling storage.
export const useUserStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  _hasHydrated: false,

  // Client-only: pulls the current session out of storage into memory. Call
  // once on mount (see components/auth/StoreHydrator.jsx) — never during SSR.
  hydrate: () => {
    const user = getAuthUser();
    const token = getAccessToken();
    set({ user, token, isAuthenticated: !!(user && token) });
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setAuth: (user, token, remember = true, refreshToken = null) => {
    setAuthSession({ accessToken: token, refreshToken }, user, remember);
    resetSessionGuard();
    set({ user, token, isAuthenticated: !!(user && token) });
  },

  logout: async () => {
    clearAuthSession();
    set({ user: null, token: null, isAuthenticated: false });
    await removeAuthCookie();
  },
}));
