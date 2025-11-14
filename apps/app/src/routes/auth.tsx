import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Container, Flex } from '@radix-ui/themes';
import { AuthForm } from '../components/auth-form';

export const Route = createFileRoute('/auth')({
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const navigate = useNavigate();

  return (
    <Container size="1">
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ minHeight: '100vh' }}
      >
        <AuthForm
          mode={mode}
          onToggleMode={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          onSuccess={() => {
            navigate({ to: '/dashboard' });
          }}
        />
      </Flex>
    </Container>
  );
}
