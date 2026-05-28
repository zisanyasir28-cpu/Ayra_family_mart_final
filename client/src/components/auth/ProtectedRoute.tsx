import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { AyraSpinner } from '@/components/ui/AyraLoader';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // AuthProvider is still completing the initial refresh — show a spinner
  // so we neither flash protected content nor incorrectly redirect.
  if (isLoading) {
    return <AyraSpinner className="min-h-[60vh]" />;
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return (
      <Navigate
        to={`${redirectTo}?redirect=${redirect}`}
        replace
        state={{ from: location }}
      />
    );
  }

  return <>{children}</>;
}
