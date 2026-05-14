import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import CustomerLayout from './components/layouts/CustomerLayout';
import AdminLayout    from './components/layouts/AdminLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { InstallPrompt }  from './components/pwa/InstallPrompt';
import { UpdateToast }    from './components/pwa/UpdateToast';

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────

// Storefront
const HomePage         = lazy(() => import('./pages/customer/HomePage'));
const ProductsPage     = lazy(() => import('./pages/customer/ProductsPage'));
const CheckoutPage     = lazy(() => import('./pages/customer/CheckoutPage'));
const OrdersPage       = lazy(() => import('./pages/customer/OrdersPage'));
const OrderDetailPage  = lazy(() => import('./pages/customer/OrderDetailPage'));
const OrderSuccessPage = lazy(() => import('./pages/customer/OrderSuccessPage'));
const AccountPage      = lazy(() => import('./pages/customer/AccountPage'));
const WishlistPage     = lazy(() => import('./pages/customer/WishlistPage'));
const ProductDetailPage = lazy(() => import('./pages/customer/ProductDetailPage'));

// Auth (outside CustomerLayout — own centered layout)
const LoginPage           = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage        = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage  = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage   = lazy(() => import('./pages/auth/ResetPasswordPage'));

// Admin
const AdminDashboardPage   = lazy(() => import('./pages/admin/DashboardPage'));
const AdminProductsPage    = lazy(() => import('./pages/admin/products/ProductsListPage'));
const AdminCategoriesPage  = lazy(() => import('./pages/admin/categories/CategoriesPage'));
const AdminOrdersListPage  = lazy(() => import('./pages/admin/orders/OrdersListPage'));
const AdminOrderDetailPage = lazy(() => import('./pages/admin/orders/OrderDetailPage'));
const AdminCustomersPage   = lazy(() => import('./pages/admin/customers/CustomersPage'));
const AdminCouponsPage     = lazy(() => import('./pages/admin/coupons/CouponsPage'));
const AdminCampaignsPage   = lazy(() => import('./pages/admin/campaigns/CampaignsPage'));

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
    <>
      <InstallPrompt />
      <UpdateToast />
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
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <Suspense fallback={<AdminLoader />}>
              <AdminDashboardPage />
            </Suspense>
          }
        />
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
        <Route
          path="orders"
          element={
            <Suspense fallback={<AdminLoader />}>
              <AdminOrdersListPage />
            </Suspense>
          }
        />
        <Route
          path="orders/:id"
          element={
            <Suspense fallback={<AdminLoader />}>
              <AdminOrderDetailPage />
            </Suspense>
          }
        />
        <Route
          path="customers"
          element={
            <Suspense fallback={<AdminLoader />}>
              <AdminCustomersPage />
            </Suspense>
          }
        />
        <Route
          path="coupons"
          element={
            <Suspense fallback={<AdminLoader />}>
              <AdminCouponsPage />
            </Suspense>
          }
        />
        <Route
          path="campaigns"
          element={
            <Suspense fallback={<AdminLoader />}>
              <AdminCampaignsPage />
            </Suspense>
          }
        />
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
        <Route
          path="/products/:slug"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProductDetailPage />
            </Suspense>
          }
        />

        {/* Protected routes — redirect to /login if unauthenticated */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <AccountPage />
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

        {/* Public routes */}
        <Route
          path="/wishlist"
          element={
            <Suspense fallback={<PageLoader />}>
              <WishlistPage />
            </Suspense>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      </Routes>
    </>
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
