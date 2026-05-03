import { useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { UserPublic } from '@superstore/shared';

interface MeResponse {
  success: true;
  data: { user: UserPublic; accessToken: string };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, clearAuth, setLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Attempt silent token refresh on mount
    api
      .post<MeResponse>('/auth/refresh')
      .then(({ data }) => {
        setUser(data.data.user, data.data.accessToken);
      })
      .catch(() => {
        clearAuth();
      });

    // Listen for forced logout from axios interceptor
    const handleLogout = () => {
      clearAuth();
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [setUser, clearAuth, setLoading, navigate]);

  return <>{children}</>;
}
