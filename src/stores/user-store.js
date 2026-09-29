import { create } from 'zustand';
import { removeAuthCookie } from '@/src/app/actions/auth';
import { getAuthUser, setAuthSession, clearAuthSession } from '@/src/lib/auth-session';
import { resetSessionGuard } from '@/src/utils/axios';

// `user` is a UI cache. The session itself is the httpOnly cookie pair the API
// proxy reads — this store never holds access or refresh tokens.
export const useUserStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  _hasHydrated: false,

  hydrate: () => {
    const user = getAuthUser();
    set({ user, token: null, isAuthenticated: !!user });
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setAuth: (user, remember = true) => {
    setAuthSession(user, remember);
    resetSessionGuard();
    set({ user, token: null, isAuthenticated: !!user });
  },

  logout: async () => {
    clearAuthSession();
    set({ user: null, token: null, isAuthenticated: false });
    await removeAuthCookie();
  },
}));
