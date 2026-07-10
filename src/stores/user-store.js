import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { removeAuthCookie } from '@/src/app/actions/auth';

const REMEMBER_KEY = 'auth-remember';

// "Remember me" off -> keep the session in sessionStorage so it clears when the browser closes.
function getActiveStorage() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REMEMBER_KEY) === 'false' ? sessionStorage : localStorage;
}

function clearAllAuthStorage(name) {
  localStorage.removeItem(name);
  sessionStorage.removeItem(name);
}

const hybridStorage = {
  getItem: (name) => getActiveStorage()?.getItem(name) ?? null,
  setItem: (name, value) => getActiveStorage()?.setItem(name, value),
  removeItem: (name) => clearAllAuthStorage(name),
};

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        set({ token });
        if (token) {
          getActiveStorage()?.setItem('token', token);
        } else {
          clearAllAuthStorage('token');
        }
      },

      setAuth: (user, token, remember = true) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(REMEMBER_KEY, remember ? 'true' : 'false');
        }
        set({ user, token, isAuthenticated: !!(user && token) });
        if (token) {
          getActiveStorage()?.setItem('token', token);
        } else {
          clearAllAuthStorage('token');
        }
      },

      logout: async () => {
        set({ user: null, token: null, isAuthenticated: false });
        clearAllAuthStorage('token');
        clearAllAuthStorage('user-storage');
        localStorage.removeItem(REMEMBER_KEY);
        await removeAuthCookie();
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => hybridStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      skipHydration: true,
      onRehydrateStorage: () => (state, error) => {
        if (!error && typeof window !== 'undefined') {
          const storedToken = getActiveStorage()?.getItem('token');
          if (storedToken && !state?.token) {
            useUserStore.setState({ token: storedToken, isAuthenticated: true });
          }
        }

        useUserStore.setState({ _hasHydrated: true });
      },
    }
  )
);
