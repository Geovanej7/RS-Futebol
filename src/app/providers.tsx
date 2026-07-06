import { useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useUiStore } from '@/store/ui-store';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

// Módulo-level: garante que o worker do MSW só é iniciado uma vez mesmo com o
// duplo-mount do StrictMode em dev (senão o worker é registrado/logado 2x).
let mockingPromise: Promise<unknown> | null = null;
function startMocking(): Promise<unknown> {
  mockingPromise ??= import('@/mocks/browser').then(({ worker }) =>
    worker.start({ onUnhandledRequest: 'bypass' }),
  );
  return mockingPromise;
}

function ThemeSync({ children }: { children: ReactNode }) {
  const theme = useUiStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return <>{children}</>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [mockingReady, setMockingReady] = useState(import.meta.env.PROD);

  useEffect(() => {
    if (import.meta.env.PROD) return;
    startMocking().then(() => setMockingReady(true));
  }, []);

  if (!mockingReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSync>{children}</ThemeSync>
      <Toaster theme="dark" position="top-right" richColors />
    </QueryClientProvider>
  );
}
