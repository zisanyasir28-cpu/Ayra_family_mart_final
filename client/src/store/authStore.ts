import { create } from 'zustand';
import { setAccessToken } from '@/lib/api';
import type { UserPublic } from '@superstore/shared';

interface AuthState {
  user: UserPublic | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserPublic, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user, token) => {
    setAccessToken(token);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  clearAuth: () => {
    setAccessToken(null);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
