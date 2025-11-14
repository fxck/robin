import { createFileRoute, Link } from '@tanstack/react-router';
import { Box, Button, Container, Flex, Heading, Text } from '@radix-ui/themes';
import { ArrowRight, Zap, Shield, Rocket } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <Container size="4">
      <Flex direction="column" gap="9" py="9">
        {/* Hero Section */}
        <Flex direction="column" align="center" gap="4" style={{ textAlign: 'center' }}>
          <Heading size="9" weight="bold">
            Welcome to Robin
          </Heading>
          <Text size="5" color="gray">
            A modern full-stack platform built with React, Nitro, and Better Auth
          </Text>
          <Flex gap="3" mt="4">
            <Link to="/posts">
              <Button size="3" variant="solid">
                Read Blog <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="3" variant="outline">
                Admin Dashboard
              </Button>
            </Link>
          </Flex>
        </Flex>

        {/* Features Grid */}
        <Flex gap="4" wrap="wrap" justify="center">
          <Card
            icon={<Zap />}
            title="Lightning Fast"
            description="Built with Vite and Nitro for blazing fast development and production performance"
          />
          <Card
            icon={<Shield />}
            title="Secure by Default"
            description="Better Auth integration with OAuth, magic links, and session management"
          />
          <Card
            icon={<Rocket />}
            title="Production Ready"
            description="TypeScript, Zod validation, and comprehensive error handling out of the box"
          />
        </Flex>

        {/* Tech Stack */}
        <Box style={{ textAlign: 'center' }}>
          <Heading size="6" mb="4">
            Modern Tech Stack
          </Heading>
          <Flex gap="2" wrap="wrap" justify="center">
            {['React 19', 'TanStack Router', 'Radix UI', 'Nitro', 'Better Auth', 'Drizzle ORM'].map(
              (tech) => (
                <Box
                  key={tech}
                  px="3"
                  py="1"
                  style={{
                    background: 'var(--gray-a3)',
                    borderRadius: 'var(--radius-2)',
                  }}
                >
                  <Text size="2" weight="medium">
                    {tech}
                  </Text>
                </Box>
              )
            )}
          </Flex>
        </Box>
      </Flex>
    </Container>
  );
}

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function Card({ icon, title, description }: CardProps) {
  return (
    <Box
      p="5"
      style={{
        background: 'var(--gray-a2)',
        borderRadius: 'var(--radius-3)',
        border: '1px solid var(--gray-a5)',
        maxWidth: '300px',
      }}
    >
      <Flex direction="column" gap="2">
        <Box style={{ color: 'var(--accent-9)' }}>{icon}</Box>
        <Heading size="4">{title}</Heading>
        <Text size="2" color="gray">
          {description}
        </Text>
      </Flex>
    </Box>
  );
}
