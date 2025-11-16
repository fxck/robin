import { createRootRoute, Outlet, HeadContent, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Theme, Box } from '@radix-ui/themes';
import { Toaster } from 'sonner';
import { Suspense } from 'react';
import { queryClient } from '../lib/api-client';
import { ErrorBoundary } from '../components/error-boundary';
import { AppBar } from '../components/navigation';
import '@radix-ui/themes/styles.css';
import '../styles.css';

export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        name: 'description',
        content: 'Robin - A modern full-stack blog platform for sharing ideas and stories',
      },
      {
        name: 'keywords',
        content: 'blog, writing, stories, articles, community',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:site_name',
        content: 'Robin',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
    ],
    links: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
    ],
  }),
});

function RootComponent() {
  return (
    <ErrorBoundary>
      <HeadContent />
      <QueryClientProvider client={queryClient}>
        <Theme appearance="dark" accentColor="purple" radius="medium">
          <Box style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
            <AppBar />
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
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
      <Scripts />
    </ErrorBoundary>
  );
}
