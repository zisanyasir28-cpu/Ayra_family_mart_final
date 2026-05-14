import { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

interface ProvidersProps {
  children:        ReactNode;
  initialEntries?: string[];
}

function Providers({ children, initialEntries = ['/'] }: ProvidersProps) {
  // New QueryClient per test so cache + requests don't leak
  const qc = new QueryClient({
    defaultOptions: {
      queries:   { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  opts?: RenderOptions & { initialEntries?: string[] },
) {
  const { initialEntries, ...rest } = opts ?? {};
  return render(ui, {
    wrapper: ({ children }) => (
      <Providers initialEntries={initialEntries}>{children}</Providers>
    ),
    ...rest,
  });
}

// Re-export everything from @testing-library/react for convenience
export * from '@testing-library/react';
