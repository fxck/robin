import { createAuthClient } from 'better-auth/react';

// Get base URL from environment or use sensible defaults
const getBaseURL = () => {
  // In Vite environments, check for VITE_API_URL
  // @ts-ignore - import.meta.env is available in Vite runtime
  if (typeof import.meta !== 'undefined' && 'env' in import.meta) {
    // @ts-ignore
    const viteApiUrl = import.meta.env?.['VITE_API_URL'];
    if (viteApiUrl) {
      return viteApiUrl as string;
    }
  }

  // In browser, use window origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Fallback for SSR
  return 'http://localhost:3000';
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;
