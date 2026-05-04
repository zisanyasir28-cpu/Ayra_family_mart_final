import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import CustomerLayout from './components/layouts/CustomerLayout';

// Lazy-loaded pages
const HomePage      = lazy(() => import('./pages/customer/HomePage'));
const ProductsPage  = lazy(() => import('./pages/customer/ProductsPage'));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Customer-facing storefront under CustomerLayout */}
      <Route element={<CustomerLayout />}>
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
        {/* Placeholder routes — will be built in future phases */}
        <Route path="/cart"     element={<PlaceholderPage title="Cart" emoji="🛒" />} />
        <Route path="/wishlist" element={<PlaceholderPage title="Wishlist" emoji="❤️" />} />
        <Route path="/account"  element={<PlaceholderPage title="My Account" emoji="👤" />} />
        <Route path="/orders"   element={<PlaceholderPage title="My Orders" emoji="📦" />} />
        <Route path="/login"    element={<PlaceholderPage title="Login" emoji="🔑" />} />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function PlaceholderPage({ title, emoji }: { title: string; emoji: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="text-7xl">{emoji}</span>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground">Coming in the next phase.</p>
    </div>
  );
}
