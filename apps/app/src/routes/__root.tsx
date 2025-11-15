import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Theme, Box } from '@radix-ui/themes';
import { Toaster } from 'sonner';
import { queryClient } from '../lib/api-client';
import { ErrorBoundary } from '../components/error-boundary';
import { Navigation } from '../components/navigation';
import '@radix-ui/themes/styles.css';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Theme appearance="dark" accentColor="purple" radius="medium">
          <Box style={{ minHeight: '100vh', background: 'var(--gray-1)' }}>
            <Navigation />
            <Outlet />
          </Box>
          <Toaster position="top-right" richColors />
          {import.meta.env.DEV && (
            <>
              <TanStackRouterDevtools position="bottom-right" />
              <ReactQueryDevtools initialIsOpen={false} />
            </>
          )}
        </Theme>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
