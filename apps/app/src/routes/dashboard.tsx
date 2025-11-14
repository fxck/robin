import { createFileRoute, redirect, Link } from '@tanstack/react-router';
import { Box, Button, Card, Container, Flex, Heading, Text, Grid } from '@radix-ui/themes';
import { FileText, PlusCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { useSession, signOut } from '../lib/auth';
import { authClient } from '../lib/auth';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: '/auth' });
    }
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { data: session, isPending: isLoading, error } = useSession();

  if (isLoading) {
    return (
      <Container>
        <Flex align="center" justify="center" style={{ minHeight: '100vh' }}>
          <Text>Loading...</Text>
        </Flex>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Flex align="center" justify="center" direction="column" gap="4" style={{ minHeight: '100vh' }}>
          <Text color="red" size="3">Failed to load session</Text>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Flex>
      </Container>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <Container size="3">
      <Box py="9">
        <Flex justify="between" align="center" mb="6">
          <Heading size="8">Dashboard</Heading>
          <Button variant="soft" color="gray" onClick={handleSignOut}>
            Sign Out
          </Button>
        </Flex>

        <Flex direction="column" gap="6">
          {/* User Info Card */}
          <Card>
            <Flex direction="column" gap="2">
              <Heading size="4">Welcome back!</Heading>
              {session?.user && (
                <Flex direction="column" gap="1">
                  <Text size="2">
                    <strong>Name:</strong> {session.user.name || 'Not provided'}
                  </Text>
                  <Text size="2">
                    <strong>Email:</strong> {session.user.email}
                  </Text>
                </Flex>
              )}
            </Flex>
          </Card>

          {/* Quick Actions Grid */}
          <Box>
            <Heading size="5" mb="4">Quick Actions</Heading>
            <Grid columns={{ initial: '1', sm: '2' }} gap="4">
              <Link to="/admin/posts" style={{ textDecoration: 'none' }}>
                <Card style={{ cursor: 'pointer', height: '100%' }} className="action-card">
                  <Flex direction="column" gap="3" align="center" py="4">
                    <FileText size={32} color="var(--accent-9)" />
                    <Heading size="4">Manage Posts</Heading>
                    <Text size="2" color="gray" align="center">
                      View and edit all your posts
                    </Text>
                  </Flex>
                </Card>
              </Link>

              <Link to="/admin/posts/new" style={{ textDecoration: 'none' }}>
                <Card style={{ cursor: 'pointer', height: '100%' }} className="action-card">
                  <Flex direction="column" gap="3" align="center" py="4">
                    <PlusCircle size={32} color="var(--accent-9)" />
                    <Heading size="4">Create Post</Heading>
                    <Text size="2" color="gray" align="center">
                      Write and publish a new post
                    </Text>
                  </Flex>
                </Card>
              </Link>

              <Link to="/posts" style={{ textDecoration: 'none' }}>
                <Card style={{ cursor: 'pointer', height: '100%' }} className="action-card">
                  <Flex direction="column" gap="3" align="center" py="4">
                    <TrendingUp size={32} color="var(--accent-9)" />
                    <Heading size="4">View Blog</Heading>
                    <Text size="2" color="gray" align="center">
                      See public-facing blog
                    </Text>
                  </Flex>
                </Card>
              </Link>

              <Card style={{ cursor: 'not-allowed', height: '100%', opacity: 0.6 }}>
                <Flex direction="column" gap="3" align="center" py="4">
                  <BarChart3 size={32} color="var(--gray-9)" />
                  <Heading size="4">Analytics</Heading>
                  <Text size="2" color="gray" align="center">
                    Coming soon...
                  </Text>
                </Flex>
              </Card>
            </Grid>
          </Box>
        </Flex>

        <style>{`
          .action-card {
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .action-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          }
        `}</style>
      </Box>
    </Container>
  );
}
