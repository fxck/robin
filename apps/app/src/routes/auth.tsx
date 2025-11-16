import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { AuthForm } from '../components/auth-form';

export const Route = createFileRoute('/auth')({
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const navigate = useNavigate();

  return (
    <div className="auth-layout mesh-gradient">
      <div className="mx-auto px-5 md:px-8" style={{ maxWidth: '450px' }}>
        <div className="flex flex-col items-center justify-center gap-8" style={{ minHeight: 'calc(100vh - 60px)', paddingTop: 'var(--space-9)', paddingBottom: 'var(--space-9)' }}>
          <div className="text-center space-y-2 w-full">
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
