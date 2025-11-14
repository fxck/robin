import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, TextField, Button, Text, Box, Flex } from '@radix-ui/themes';
import { toast } from 'sonner';
import { ArrowLeft, Mail } from 'lucide-react';
import { forgetPassword } from '../lib/auth';

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const result = await forgetPassword({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to send reset email');
      }

      setSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again later.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card style={{ maxWidth: 450, width: '100%' }}>
          <Flex direction="column" gap="4">
            <Flex align="center" gap="3">
              <Box
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Mail size={24} />
              </Box>
              <Box>
                <Text size="5" weight="bold">
                  Check your email
                </Text>
                <Text size="2" color="gray">
                  Password reset link sent
                </Text>
              </Box>
            </Flex>

            <Text size="3" color="gray">
              We've sent a password reset link to:
            </Text>
            <Text size="3" weight="medium">
              {email}
            </Text>

            <Text size="2" color="gray">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </Text>

            <Flex direction="column" gap="2" mt="2">
              <Button
                size="3"
                onClick={() => navigate({ to: '/auth' })}
                variant="soft"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </Button>

              <Button
                size="2"
                variant="ghost"
                onClick={() => {
                  setSent(false);
                  setEmail('');
                }}
              >
                Resend email
              </Button>
            </Flex>
          </Flex>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card style={{ maxWidth: 450, width: '100%' }}>
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="4">
            <Box>
              <Text size="6" weight="bold">
                Forgot your password?
              </Text>
              <Text size="2" color="gray" mt="2">
                Enter your email address and we'll send you a link to reset your password.
              </Text>
            </Box>

            <Box>
              <TextField.Root
                size="3"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              >
                <TextField.Slot>
                  <Mail size={16} />
                </TextField.Slot>
              </TextField.Root>
            </Box>

            <Flex direction="column" gap="2">
              <Button size="3" type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <Link to="/auth">
                <Button size="3" variant="ghost" style={{ width: '100%' }}>
                  <ArrowLeft size={16} />
                  Back to Sign In
                </Button>
              </Link>
            </Flex>
          </Flex>
        </form>
      </Card>
    </div>
  );
}
