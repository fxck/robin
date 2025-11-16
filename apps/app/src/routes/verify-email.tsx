import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Container, Flex, Heading, Text, Spinner } from '@radix-ui/themes';
import { authClient } from '../lib/auth';
import { toast } from 'sonner';

export const Route = createFileRoute('/verify-email')({
  component: VerifyEmailPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || '',
  }),
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('No verification token provided');
        return;
      }

      try {
        // Call Better Auth verify endpoint via fetch
        // We use fetch directly because Better Auth client might not expose verifyEmail method
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/verify-email`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ token }),
          }
        );

        if (!response.ok) {
          const error = await response.json().catch(() => ({
            message: 'Failed to verify email',
          }));
          throw new Error(error.message || 'Verification failed');
        }

        setStatus('success');
        toast.success('Email verified successfully!');

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate({ to: '/dashboard', search: { verified: 'true' } });
        }, 2000);
      } catch (error) {
        setStatus('error');
        const message = error instanceof Error ? error.message : 'Failed to verify email';
        setErrorMessage(message);
        toast.error(message);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="auth-layout mesh-gradient">
      <Container size="2">
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="6"
          style={{ minHeight: 'calc(100vh - 60px)' }}
        >
          <div className="glass-surface p-8 max-w-md w-full">
            <Flex direction="column" align="center" gap="5">
              {status === 'verifying' && (
                <>
                  <Spinner size="3" />
                  <Heading size="6" align="center">
                    Verifying your email...
                  </Heading>
                  <Text size="3" color="gray" align="center">
                    Please wait while we verify your email address.
                  </Text>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="text-6xl">✓</div>
                  <Heading size="6" align="center" className="text-green-400">
                    Email Verified!
                  </Heading>
                  <Text size="3" color="gray" align="center">
                    Your email has been successfully verified. Redirecting you to the dashboard...
                  </Text>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="text-6xl">✗</div>
                  <Heading size="6" align="center" className="text-red-400">
                    Verification Failed
                  </Heading>
                  <Text size="3" color="gray" align="center">
                    {errorMessage || 'Something went wrong during verification.'}
                  </Text>
                  <Text size="2" color="gray" align="center" className="pt-4">
                    The verification link may have expired or is invalid.{' '}
                    <button
                      onClick={() => navigate({ to: '/dashboard' })}
                      className="text-amber-400 hover:text-amber-300 underline"
                    >
                      Go to dashboard
                    </button>
                  </Text>
                </>
              )}
            </Flex>
          </div>
        </Flex>
      </Container>
    </div>
  );
}
