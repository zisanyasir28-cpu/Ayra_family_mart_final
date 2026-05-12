import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import CustomerLayout from './components/layouts/CustomerLayout';
import AdminLayout    from './components/layouts/AdminLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────

// Storefront
const HomePage         = lazy(() => import('./pages/customer/HomePage'));
const ProductsPage     = lazy(() => import('./pages/customer/ProductsPage'));
const CheckoutPage     = lazy(() => import('./pages/customer/CheckoutPage'));
const OrdersPage       = lazy(() => import('./pages/customer/OrdersPage'));
const OrderDetailPage  = lazy(() => import('./pages/customer/OrderDetailPage'));
const OrderSuccessPage = lazy(() => import('./pages/customer/OrderSuccessPage'));

// Auth (outside CustomerLayout — own centered layout)
const LoginPage           = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage        = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage  = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage   = lazy(() => import('./pages/auth/ResetPasswordPage'));

// Admin
const AdminProductsPage   = lazy(() => import('./pages/admin/products/ProductsListPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/categories/CategoriesPage'));

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

function AdminLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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

      {/* ── Admin panel — under AdminLayout (auth check inside layout) ──── */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/products" replace />} />
        <Route
          path="products"
          element={
            <Suspense fallback={<AdminLoader />}>
              <AdminProductsPage />
            </Suspense>
          }
        />
        <Route
          path="categories"
          element={
            <Suspense fallback={<AdminLoader />}>
              <AdminCategoriesPage />
            </Suspense>
          }
        />
        {/* Placeholder admin pages */}
        <Route path="orders"    element={<AdminPlaceholder title="Orders"    emoji="📦" />} />
        <Route path="customers" element={<AdminPlaceholder title="Customers" emoji="👥" />} />
        <Route path="coupons"   element={<AdminPlaceholder title="Coupons"   emoji="🎫" />} />
        <Route path="campaigns" element={<AdminPlaceholder title="Campaigns" emoji="📣" />} />
        <Route path="settings"  element={<AdminPlaceholder title="Settings"  emoji="⚙️" />} />
      </Route>

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
                <OrdersPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/success/:id"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <OrderSuccessPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <OrderDetailPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <CheckoutPage />
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

function AdminPlaceholder({ title, emoji }: { title: string; emoji: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="text-6xl">{emoji}</span>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">Coming in a future phase.</p>
    </div>
  );
}
