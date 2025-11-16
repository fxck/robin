import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Flex, Text } from '@radix-ui/themes';
import { api, queryClient } from '../lib/api-client';

export const Route = createFileRoute('/auth/callback/google')({
  component: GoogleCallback,
});

function GoogleCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Connecting to Google...');

  console.log('[GoogleCallback] Component rendered');

  useEffect(() => {
    console.log('[GoogleCallback] useEffect running');
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const errorParam = params.get('error');

      console.log('[OAuth] Callback received:', { code: !!code, state: !!state, error: errorParam });

      if (errorParam) {
        setError(`Google OAuth error: ${errorParam}`);
        setTimeout(() => navigate({ to: '/auth' }), 3000);
        return;
      }

      if (!code || !state) {
        setError('Missing authorization code or state');
        setTimeout(() => navigate({ to: '/auth' }), 3000);
        return;
      }

      try {
        setStatus('Exchanging authorization code...');

        // Exchange code for session
        const response = await api.post<{ user: any; session: any }>('/api/auth/oauth/google/exchange', {
          code,
          state,
          redirectUri: `${window.location.origin}/auth/callback/google`,
        });

        console.log('[OAuth] Exchange response:', { hasUser: !!response.user, hasSession: !!response.session });

        if (response.user) {
          setStatus('Sign in successful! Redirecting...');

          // Invalidate all queries to refresh auth state
          await queryClient.invalidateQueries();

          // Small delay to ensure cookie is set
          await new Promise(resolve => setTimeout(resolve, 500));

          // Success! Redirect to dashboard with full page reload to ensure auth state is updated
          window.location.href = '/dashboard';
        } else {
          setError('Failed to authenticate with Google');
          setTimeout(() => navigate({ to: '/auth' }), 3000);
        }
      } catch (err: any) {
        console.error('[OAuth] Callback error:', err);
        setError(err?.message || 'Failed to complete Google sign-in');
        setTimeout(() => navigate({ to: '/auth' }), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <Flex direction="column" align="center" gap="4" className="glass-surface p-8 max-w-md">
        {error ? (
          <>
            <Text size="5" weight="bold" className="text-red-400">
              Authentication Error
            </Text>
            <Text size="3" className="text-center text-gray-300">
              {error}
            </Text>
            <Text size="2" className="text-gray-400">
              Redirecting to sign in...
            </Text>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400" />
            <Text size="4" weight="medium">
              {status}
            </Text>
          </>
        )}
      </Flex>
    </div>
  );
}
