import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, TextField, Button, Text, Box, Flex, Callout } from '@radix-ui/themes';
import { toast } from 'sonner';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { resetPassword } from '../lib/auth';

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || '',
  }),
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (passwordStrength === 'weak') {
      toast.error('Please choose a stronger password');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword({
        newPassword: password,
        token,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to reset password');
      }

      toast.success('Password reset successful! You can now sign in.');
      navigate({ to: '/auth' });
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage = error.message || 'Failed to reset password. The link may have expired.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card style={{ maxWidth: 450, width: '100%' }}>
          <Flex direction="column" gap="4">
            <Callout.Root color="red">
              <Callout.Icon>
                <AlertCircle size={20} />
              </Callout.Icon>
              <Callout.Text>
                <Text weight="bold">Invalid Reset Link</Text>
                <Text size="2">
                  This password reset link is invalid or has expired. Please request a new one.
                </Text>
              </Callout.Text>
            </Callout.Root>

            <Button
              size="3"
              onClick={() => navigate({ to: '/forgot-password' })}
            >
              Request New Link
            </Button>
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
                Reset your password
              </Text>
              <Text size="2" color="gray" mt="2">
                Enter a new password for your account.
              </Text>
            </Box>

            <Box>
              <Text size="2" weight="medium" mb="1">
                New Password
              </Text>
              <TextField.Root
                size="3"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={loading}
              >
                <TextField.Slot>
                  <Lock size={16} />
                </TextField.Slot>
              </TextField.Root>

              {password && (
                <Box mt="2">
                  <Flex align="center" gap="2">
                    <Box
                      style={{
                        height: 4,
                        flex: 1,
                        backgroundColor:
                          passwordStrength === 'strong'
                            ? 'var(--green-9)'
                            : passwordStrength === 'medium'
                            ? 'var(--amber-9)'
                            : 'var(--red-9)',
                        borderRadius: 2,
                      }}
                    />
                    <Text
                      size="1"
                      color={
                        passwordStrength === 'strong'
                          ? 'green'
                          : passwordStrength === 'medium'
                          ? 'amber'
                          : 'red'
                      }
                    >
                      {passwordStrength === 'strong'
                        ? 'Strong'
                        : passwordStrength === 'medium'
                        ? 'Medium'
                        : 'Weak'}
                    </Text>
                  </Flex>
                </Box>
              )}
            </Box>

            <Box>
              <Text size="2" weight="medium" mb="1">
                Confirm Password
              </Text>
              <TextField.Root
                size="3"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={loading}
              >
                <TextField.Slot>
                  <Lock size={16} />
                </TextField.Slot>
              </TextField.Root>

              {confirmPassword && password !== confirmPassword && (
                <Text size="1" color="red" mt="1">
                  Passwords do not match
                </Text>
              )}

              {confirmPassword && password === confirmPassword && (
                <Flex align="center" gap="1" mt="1">
                  <CheckCircle size={12} color="var(--green-9)" />
                  <Text size="1" color="green">
                    Passwords match
                  </Text>
                </Flex>
              )}
            </Box>

            <Flex align="center" gap="2">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="showPassword" style={{ cursor: 'pointer' }}>
                <Text size="2">Show password</Text>
              </label>
            </Flex>

            <Callout.Root size="1" color="blue">
              <Callout.Text>
                <Text size="1">
                  Password must be at least 8 characters long and include a mix of letters and numbers.
                </Text>
              </Callout.Text>
            </Callout.Root>

            <Button size="3" type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Flex>
        </form>
      </Card>
    </div>
  );
}

function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (password.length < 8) return 'weak';

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const score = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  if (score >= 3 && password.length >= 12) return 'strong';
  if (score >= 2 && password.length >= 8) return 'medium';
  return 'weak';
}
