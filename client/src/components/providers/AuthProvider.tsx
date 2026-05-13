import { useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { DEMO_MODE } from '@/lib/demoMode';
import type { UserPublic } from '@superstore/shared';

interface MeResponse {
  success: true;
  data: { user: UserPublic; accessToken: string };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, clearAuth, setLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (DEMO_MODE) {
      // In demo mode there is no server — restore session from persisted store.
      setLoading(false);
      return;
    }

    // Attempt silent token refresh on every page load.
    // The httpOnly refresh-token cookie is sent automatically.
    api
      .post<MeResponse>('/auth/refresh')
      .then(({ data }) => {
        setUser(data.data.user, data.data.accessToken);
      })
      .catch(() => {
        // No valid refresh token — mark as unauthenticated.
        // ProtectedRoute handles the redirect when needed.
        clearAuth();
      });

    // Listen for forced-logout events fired by the 401 response interceptor
    // (e.g. refresh token expired mid-session).
    function handleLogout(e: Event) {
      clearAuth();
      const from = (e as CustomEvent<{ from?: string }>).detail?.from;
      const safePath = from && from !== '/login' ? from : undefined;
      const to = safePath
        ? `/login?redirect=${encodeURIComponent(safePath)}`
        : '/login';
      navigate(to, { replace: true });
    }

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
