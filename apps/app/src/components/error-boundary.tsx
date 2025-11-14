import { Component, ReactNode } from 'react';
import { Box, Button, Card, Container, Flex, Heading, Text } from '@radix-ui/themes';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container>
          <Flex align="center" justify="center" style={{ minHeight: '100vh' }}>
            <Card size="3" style={{ maxWidth: '500px' }}>
              <Flex direction="column" gap="4">
                <Heading size="6" color="red">
                  Something went wrong
                </Heading>
                <Text size="2" color="gray">
                  We're sorry, but something unexpected happened. Please try refreshing the page.
                </Text>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <Box>
                    <Text size="1" style={{ fontFamily: 'monospace', color: 'var(--red-11)' }}>
                      {this.state.error.message}
                    </Text>
                  </Box>
                )}
                <Flex gap="2">
                  <Button onClick={() => window.location.reload()} size="2">
                    Refresh Page
                  </Button>
                  <Button
                    variant="soft"
                    onClick={() => {
                      this.setState({ hasError: false, error: null });
                    }}
                    size="2"
                  >
                    Try Again
                  </Button>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </Container>
      );
    }

    return this.props.children;
  }
}
