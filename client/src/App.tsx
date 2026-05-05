import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import CustomerLayout from './components/layouts/CustomerLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────

// Storefront
const HomePage     = lazy(() => import('./pages/customer/HomePage'));
const ProductsPage = lazy(() => import('./pages/customer/ProductsPage'));

// Auth (outside CustomerLayout — own centered layout)
const LoginPage           = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage        = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage  = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage   = lazy(() => import('./pages/auth/ResetPasswordPage'));

// ─── Loaders ─────────────────────────────────────────────────────────────────

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
    </div>
  );
}

function AuthLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-teal-50">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      {/* ── Auth pages — standalone (no navbar/footer) ──────────────────── */}
      <Route
        path="/login"
        element={
          <Suspense fallback={<AuthLoader />}>
            <LoginPage />
          </Suspense>
        }
      />
      <Route
        path="/register"
        element={
          <Suspense fallback={<AuthLoader />}>
            <RegisterPage />
          </Suspense>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <Suspense fallback={<AuthLoader />}>
            <ForgotPasswordPage />
          </Suspense>
        }
      />
      <Route
        path="/reset-password"
        element={
          <Suspense fallback={<AuthLoader />}>
            <ResetPasswordPage />
          </Suspense>
        }
      />

      {/* ── Customer storefront — under CustomerLayout ───────────────────── */}
      <Route element={<CustomerLayout />}>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <Suspense fallback={<PageLoader />}>
              <HomePage />
            </Suspense>
          }
        />
        <Route
          path="/products"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProductsPage />
            </Suspense>
          }
        />

        {/* Protected routes — redirect to /login if unauthenticated */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <PlaceholderPage title="My Account" emoji="👤" />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <PlaceholderPage title="My Orders" emoji="📦" />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <PlaceholderPage title="Checkout" emoji="💳" />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Public placeholder routes */}
        <Route path="/wishlist" element={<PlaceholderPage title="Wishlist" emoji="❤️" />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

// ─── Placeholder (removed once real pages are built) ─────────────────────────

function PlaceholderPage({ title, emoji }: { title: string; emoji: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="text-7xl">{emoji}</span>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground">Coming in the next phase.</p>
    </div>
  );
}
