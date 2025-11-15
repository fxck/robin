import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Box, Container, Flex, Heading, Text } from '@radix-ui/themes';
import { AuthForm } from '../components/auth-form';

export const Route = createFileRoute('/auth')({
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const navigate = useNavigate();

  return (
    <Box style={{ minHeight: 'calc(100vh - 60px)' }}>
      <Container size="1">
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="6"
          style={{ minHeight: 'calc(100vh - 60px)', paddingTop: 'var(--space-9)', paddingBottom: 'var(--space-9)' }}
        >
          <Flex direction="column" align="center" gap="2" style={{ textAlign: 'center' }}>
            <Heading size="7">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </Heading>
            <Text size="3" color="gray">
              {mode === 'signin'
                ? 'Sign in to access your dashboard'
                : 'Get started with Robin today'}
            </Text>
          </Flex>

          <AuthForm
            mode={mode}
            onToggleMode={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            onSuccess={() => {
              navigate({ to: '/dashboard' });
            }}
          />
        </Flex>
      </Container>
    </Box>
  );
}
