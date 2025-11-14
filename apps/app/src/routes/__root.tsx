import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Theme } from '@radix-ui/themes';
import { Toaster } from 'sonner';
import { queryClient } from '../lib/api-client';
import { ErrorBoundary } from '../components/error-boundary';
import '@radix-ui/themes/styles.css';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Theme appearance="dark" accentColor="purple" radius="medium" style={{ minHeight: '100vh' }}>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Outlet />
          </div>
          <Toaster position="top-right" richColors />
          <TanStackRouterDevtools position="bottom-right" />
          <ReactQueryDevtools initialIsOpen={false} />
        </Theme>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
