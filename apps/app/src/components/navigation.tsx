import { Link } from '@tanstack/react-router';
import { Flex, Button, Container, Box, Text } from '@radix-ui/themes';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { useSession, signOut } from '../lib/auth';

export function Navigation() {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <Box
      style={{
        borderBottom: '1px solid var(--gray-a5)',
        background: 'var(--color-panel)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Container size="4">
        <Flex align="center" justify="between" py="3">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Text size="4" weight="bold" style={{ color: 'var(--accent-11)' }}>
              Robin
            </Text>
          </Link>

          <Flex align="center" gap="2">
            {session?.user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="2">
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="soft" size="2" onClick={handleSignOut}>
                  <LogOut size={16} />
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="soft" size="2">
                  Sign In
                </Button>
              </Link>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}
