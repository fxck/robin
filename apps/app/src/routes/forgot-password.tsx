import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, TextField, Button, Text, Box, Flex, Container, Heading } from '@radix-ui/themes';
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
      <Box style={{ minHeight: 'calc(100vh - 60px)' }}>
        <Box style={{ maxWidth: '450px', margin: '0 auto', padding: '0 var(--space-5)' }}>
          <Flex
            direction="column"
            align="center"
            justify="center"
            style={{ minHeight: 'calc(100vh - 60px)' }}
          >
            <Card style={{ width: '100%' }}>
              <Flex direction="column" gap="5" p="5">
                <Flex direction="column" align="center" gap="3" style={{ textAlign: 'center' }}>
                  <Box
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-a3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-9)',
                    }}
                  >
                    <Mail size={32} />
                  </Box>
                  <Heading size="6">Check your email</Heading>
                  <Text size="2" color="gray">
                    We've sent a password reset link to <strong>{email}</strong>
                  </Text>
                </Flex>

                <Text size="2" color="gray" style={{ textAlign: 'center' }}>
                  Click the link in the email to reset your password. The link will expire in 1 hour.
                </Text>

                <Flex direction="column" gap="2">
                  <Button size="3" onClick={() => navigate({ to: '/auth' })}>
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
          </Flex>
        </Container>
      </Box>
    );
  }

  return (
    <Box style={{ minHeight: 'calc(100vh - 60px)' }}>
      <Box style={{ maxWidth: '450px', margin: '0 auto', padding: '0 var(--space-5)' }}>
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="6"
          style={{ minHeight: 'calc(100vh - 60px)', paddingTop: 'var(--space-9)', paddingBottom: 'var(--space-9)' }}
        >
          <Flex direction="column" align="center" gap="2" style={{ textAlign: 'center', width: '100%' }}>
            <Heading size="7">Forgot your password?</Heading>
            <Text size="3" color="gray">
              Enter your email and we'll send you a reset link
            </Text>
          </Flex>

          <Card style={{ width: '100%' }}>
            <form onSubmit={handleSubmit}>
              <Flex direction="column" gap="4" p="5">
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

                <Flex direction="column" gap="2">
                  <Button size="3" type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>

                  <Link to="/auth" style={{ textDecoration: 'none' }}>
                    <Button size="3" variant="ghost" style={{ width: '100%' }}>
                      <ArrowLeft size={16} />
                      Back to Sign In
                    </Button>
                  </Link>
                </Flex>
              </Flex>
            </form>
          </Card>
        </Flex>
      </Container>
    </Box>
  );
}
