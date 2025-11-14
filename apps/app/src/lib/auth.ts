import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;

// Password reset functions - using direct API calls since Better Auth client uses wrong endpoint
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const forgetPassword = async ({ email, redirectTo }: { email: string; redirectTo?: string }) => {
  const response = await fetch(`${baseURL}/api/auth/request-password-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, redirectTo }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to send reset email' }));
    return { error };
  }

  return { data: await response.json() };
};

export const resetPassword = async ({ newPassword, token }: { newPassword: string; token: string }) => {
  const response = await fetch(`${baseURL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ newPassword, token }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to reset password' }));
    return { error };
  }

  return { data: await response.json() };
};
