import { Component, type ReactNode } from 'react';
import { captureException } from '@/lib/sentry';

interface Props {
  fallback: (error: unknown) => ReactNode;
  children: ReactNode;
}

interface State {
  error: unknown;
}

/**
 * Lightweight top-level error boundary. Replaces Sentry.ErrorBoundary so the
 * Sentry SDK no longer has to be in the static import graph — caught errors are
 * forwarded to captureException(), which no-ops until Sentry is lazily loaded.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  override componentDidCatch(error: unknown): void {
    captureException(error);
  }

  override render(): ReactNode {
    if (this.state.error !== null) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}
