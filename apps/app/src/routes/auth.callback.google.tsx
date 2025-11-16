import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Flex, Text } from '@radix-ui/themes';
import { api } from '../lib/api-client';

export const Route = createFileRoute('/auth/callback/google')({
  component: GoogleCallback,
});

function GoogleCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const errorParam = params.get('error');

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
        // Exchange code for session
        const response = await api.post<{ user: any; session: any }>('/api/auth/oauth/google/exchange', {
          code,
          state,
          redirectUri: `${window.location.origin}/auth/callback/google`,
        });

        if (response.user) {
          // Success! Redirect to dashboard
          window.location.href = '/dashboard'; // Full reload to update auth state
        } else {
          setError('Failed to authenticate with Google');
          setTimeout(() => navigate({ to: '/auth' }), 3000);
        }
      } catch (err: any) {
        console.error('Google OAuth callback error:', err);
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
              Completing Google sign-in...
            </Text>
          </>
        )}
      </Flex>
    </div>
  );
}
