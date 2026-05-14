// Sentry must be imported first so it can patch error handlers before anything throws.
import { Sentry } from '@/lib/sentry';
import './store/themeStore'; // boots theme matchMedia listener

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/components/providers/AuthProvider';
import App from './App';
import '@/styles/globals.css';

// ─── Error fallback for Sentry's ErrorBoundary ────────────────────────────────
function ErrorFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center text-foreground">
      <span className="text-6xl">⚠️</span>
      <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
      <p className="max-w-md text-cream/55">
        The page crashed unexpectedly. Our team has been notified.
      </p>
      <button
        onClick={() => location.reload()}
        className="rounded-full bg-saffron px-5 py-2.5 font-bold text-bg hover:bg-saffron/90"
      >
        Reload page
      </button>
    </div>
  );
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </AuthProvider>
        </BrowserRouter>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
);
