import { createFileRoute, Outlet, useNavigate, useMatches } from '@tanstack/react-router';
import { useState } from 'react';
import { AuthForm } from '../components/auth-form';

export const Route = createFileRoute('/auth')({
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const navigate = useNavigate();
  const matches = useMatches();

  // Debug: log matches
  console.log('[Auth Route] Matches:', matches.map(m => ({ id: m.id, pathname: m.pathname })));

  // If there's a child route (like /auth/callback/google), render only the Outlet
  // Check if the last match is a child of /auth by looking for /callback/google in the id
  const hasChildRoute = matches.some(match => match.id === '/auth/callback/google');
  console.log('[Auth Route] Has child route:', hasChildRoute);

  if (hasChildRoute) {
    console.log('[Auth Route] Rendering Outlet');
    return <Outlet />;
  }

  console.log('[Auth Route] Rendering auth form');

  return (
    <div className="auth-layout mesh-gradient">
      <div className="max-w-[540px] mx-auto px-5 md:px-8">
        <div className="flex flex-col items-center justify-center gap-8" style={{ minHeight: 'calc(100vh - 60px)', paddingTop: 'var(--space-9)', paddingBottom: 'var(--space-9)' }}>
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-lg text-gray-400">
              {mode === 'signin'
                ? 'Sign in to continue to Robin'
                : 'Start your writing journey'}
            </p>
          </div>

          <AuthForm
            mode={mode}
            onToggleMode={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            onSuccess={() => {
              navigate({ to: '/dashboard', search: { verified: false } });
            }}
          />
        </div>
      </div>
    </div>
  );
}
