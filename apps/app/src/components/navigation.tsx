import { Link } from '@tanstack/react-router';
import { Flex, Button, Container, Box, Text, Avatar, DropdownMenu } from '@radix-ui/themes';
import { LayoutDashboard, LogOut, Settings, User } from 'lucide-react';
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

                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Button variant="soft" size="2" style={{ cursor: 'pointer' }}>
                      <Avatar
                        size="1"
                        src={session.user.image || undefined}
                        fallback={<User size={12} />}
                        radius="full"
                      />
                      {session.user.name}
                    </Button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Content>
                    <DropdownMenu.Item asChild>
                      <Link to="/settings" style={{ textDecoration: 'none' }}>
                        <Flex align="center" gap="2">
                          <Settings size={16} />
                          Settings
                        </Flex>
                      </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator />

                    <DropdownMenu.Item color="red" onClick={handleSignOut}>
                      <Flex align="center" gap="2">
                        <LogOut size={16} />
                        Sign Out
                      </Flex>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
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
