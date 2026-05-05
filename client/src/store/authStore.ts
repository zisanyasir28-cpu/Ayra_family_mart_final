import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAccessToken } from '@/lib/api';
import type { UserPublic } from '@superstore/shared';

// ─── State interface ──────────────────────────────────────────────────────────

interface AuthState {
  user: UserPublic | null;
  isAuthenticated: boolean;
  isLoading: boolean; // true while the initial refresh is in-flight

  setAuth: (user: UserPublic, accessToken: string) => void;
  clearAuth: () => void;
  updateUser: (patch: Partial<UserPublic>) => void;
  setLoading: (loading: boolean) => void;

  // Legacy alias kept for AuthProvider compatibility
  setUser: (user: UserPublic, token: string) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true, // always start loading so ProtectedRoute doesn't flash

      setAuth: (user, accessToken) => {
        setAccessToken(accessToken);
        set({ user, isAuthenticated: true, isLoading: false });
      },

      clearAuth: () => {
        setAccessToken(null);
        set({ user: null, isAuthenticated: false, isLoading: false });
      },

      updateUser: (patch) => {
        const current = get().user;
        if (current) set({ user: { ...current, ...patch } });
      },

      setLoading: (isLoading) => set({ isLoading }),

      // Legacy alias — keeps AuthProvider working without change
      setUser: (user, token) => {
        setAccessToken(token);
        set({ user, isAuthenticated: true, isLoading: false });
      },
    }),
    {
      name: 'ayra-auth',
      // Only persist user identity — the access token lives in-memory (api.ts)
      // and is restored via the httpOnly refresh-token cookie on each page load.
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
