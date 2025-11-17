import { Box, Card, Flex, Grid, Text } from '@radix-ui/themes';
import { Image, Avatar } from './image';

/**
 * Showcase component demonstrating all Image placeholder variants
 *
 * Use this as a reference for different placeholder types and use cases
 */
export function ImageShowcase() {
  return (
    <Box p="6">
      <Flex direction="column" gap="6">
        <Text size="8" weight="bold">
          Image Placeholder Showcase
        </Text>

        {/* Bubble Placeholders */}
        <Box>
          <Text size="5" weight="bold" mb="4">
            Abstract Bubble Placeholders
          </Text>
          <Grid columns="3" gap="4">
            <Card>
              <Flex direction="column" gap="2">
                <Image
                  src={null}
                  alt="Post 1"
                  placeholder="bubbles"
                  placeholderText="Beautiful Sunset"
                  aspectRatio={16 / 9}
                  style={{ height: '200px' }}
                />
                <Text size="2" color="gray">
                  Missing post image
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" gap="2">
                <Image
                  src={null}
                  alt="Post 2"
                  placeholder="bubbles"
                  placeholderText="Mountain View"
                  aspectRatio={16 / 9}
                  style={{ height: '200px' }}
                />
                <Text size="2" color="gray">
                  Different gradient (based on text)
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" gap="2">
                <Image
                  src={null}
                  alt="Post 3"
                  placeholder="bubbles"
                  placeholderText="City Lights"
                  aspectRatio={16 / 9}
                  style={{ height: '200px' }}
                />
                <Text size="2" color="gray">
                  Another gradient variant
                </Text>
              </Flex>
            </Card>
          </Grid>
        </Box>

        {/* Initials Placeholders */}
        <Box>
          <Text size="5" weight="bold" mb="4">
            Initials Placeholders (Avatars)
          </Text>
          <Grid columns="4" gap="4">
            <Card>
              <Flex direction="column" align="center" gap="2">
                <Image
                  src={null}
                  alt="John Doe"
                  placeholder="initials"
                  placeholderText="John Doe"
                  aspectRatio={1}
                  style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                />
                <Text size="2" color="gray">
                  John Doe
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" align="center" gap="2">
                <Image
                  src={null}
                  alt="Jane Smith"
                  placeholder="initials"
                  placeholderText="Jane Smith"
                  aspectRatio={1}
                  style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                />
                <Text size="2" color="gray">
                  Jane Smith
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" align="center" gap="2">
                <Image
                  src={null}
                  alt="Bob Johnson"
                  placeholder="initials"
                  placeholderText="Bob Johnson"
                  aspectRatio={1}
                  style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                />
                <Text size="2" color="gray">
                  Bob Johnson
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" align="center" gap="2">
                <Image
                  src={null}
                  alt="Alice Brown"
                  placeholder="initials"
                  placeholderText="Alice Brown"
                  aspectRatio={1}
                  style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                />
                <Text size="2" color="gray">
                  Alice Brown
                </Text>
              </Flex>
            </Card>
          </Grid>
        </Box>

        {/* Avatar Component (Specialized) */}
        <Box>
          <Text size="5" weight="bold" mb="4">
            Avatar Component (Different Sizes)
          </Text>
          <Flex gap="4" align="center">
            <Card>
              <Flex direction="column" align="center" gap="2">
                <Avatar src={null} alt="User" name="Small User" size="small" />
                <Text size="1" color="gray">
                  Small (32px)
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" align="center" gap="2">
                <Avatar src={null} alt="User" name="Medium User" size="medium" />
                <Text size="2" color="gray">
                  Medium (48px)
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" align="center" gap="2">
                <Avatar src={null} alt="User" name="Large User" size="large" />
                <Text size="2" color="gray">
                  Large (64px)
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" align="center" gap="2">
                <Avatar src={null} alt="User" name="Custom User" size={96} />
                <Text size="2" color="gray">
                  Custom (96px)
                </Text>
              </Flex>
            </Card>
          </Flex>
        </Box>

        {/* Icon Placeholders */}
        <Box>
          <Text size="5" weight="bold" mb="4">
            Icon Placeholders
          </Text>
          <Grid columns="3" gap="4">
            <Card>
              <Flex direction="column" gap="2">
                <Image
                  src={null}
                  alt="Image placeholder"
                  placeholder="icon"
                  placeholderIcon="image"
                  aspectRatio={16 / 9}
                  style={{ height: '200px' }}
                />
                <Text size="2" color="gray">
                  Image icon
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" gap="2">
                <Image
                  src={null}
                  alt="User placeholder"
                  placeholder="icon"
                  placeholderIcon="user"
                  aspectRatio={1}
                  style={{ height: '200px' }}
                />
                <Text size="2" color="gray">
                  User icon
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" gap="2">
                <Image
                  src={null}
                  alt="File placeholder"
                  placeholder="icon"
                  placeholderIcon="file"
                  aspectRatio={3 / 4}
                  style={{ height: '200px' }}
                />
                <Text size="2" color="gray">
                  File icon
                </Text>
              </Flex>
            </Card>
          </Grid>
        </Box>

        {/* Skeleton Loading */}
        <Box>
          <Text size="5" weight="bold" mb="4">
            Skeleton Loading States
          </Text>
          <Grid columns="2" gap="4">
            <Card>
              <Flex direction="column" gap="2">
                <Image
                  src={null}
                  alt="Loading"
                  placeholder="skeleton"
                  aspectRatio={16 / 9}
                  style={{ height: '200px' }}
                />
                <Text size="2" color="gray">
                  Skeleton with shimmer (16:9)
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" gap="2">
                <Image
                  src={null}
                  alt="Loading"
                  placeholder="skeleton"
                  aspectRatio={1}
                  style={{ height: '200px' }}
                />
                <Text size="2" color="gray">
                  Skeleton with shimmer (1:1)
                </Text>
              </Flex>
            </Card>
          </Grid>
        </Box>

        {/* Working Images */}
        <Box>
          <Text size="5" weight="bold" mb="4">
            Working Images (with fade-in transition)
          </Text>
          <Grid columns="3" gap="4">
            <Card>
              <Flex direction="column" gap="2">
                <Image
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
                  alt="Mountain"
                  placeholder="bubbles"
                  placeholderText="Mountain"
                  aspectRatio={16 / 9}
                  style={{ height: '200px' }}
                />
                <Text size="2" color="gray">
                  Real image with gradient placeholder
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" gap="2">
                <Avatar
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                  alt="Person"
                  name="Sarah Wilson"
                  size="large"
                />
                <Text size="2" color="gray">
                  Avatar with real image
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" gap="2">
                <Image
                  src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400"
                  alt="Abstract"
                  placeholder="skeleton"
                  aspectRatio={16 / 9}
                  style={{ height: '200px' }}
                />
                <Text size="2" color="gray">
                  Real image with skeleton placeholder
                </Text>
              </Flex>
            </Card>
          </Grid>
        </Box>

        {/* Usage Examples */}
        <Box>
          <Text size="5" weight="bold" mb="4">
            Usage Examples
          </Text>
          <Card>
            <Flex direction="column" gap="3">
              <Text size="3" weight="medium">
                Import:
              </Text>
              <pre
                style={{
                  background: 'var(--gray-3)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-2)',
                  overflow: 'auto',
                }}
              >
                {`import { Image, Avatar } from '@/components';`}
              </pre>

              <Text size="3" weight="medium" mt="3">
                Basic Usage:
              </Text>
              <pre
                style={{
                  background: 'var(--gray-3)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-2)',
                  overflow: 'auto',
                }}
              >
                {`// Post cover image
<Image
  src={post.coverImageUrl}
  alt={post.title}
  placeholder="gradient"
  placeholderText={post.title}
  aspectRatio={16 / 9}
/>

// User avatar
<Avatar
  src={user.avatarUrl}
  alt={user.name}
  name={user.name}
  size="medium"
/>

// Profile picture (large)
<Image
  src={user.profilePictureUrl}
  alt={user.name}
  placeholder="initials"
  placeholderText={user.name}
  aspectRatio={1}
  style={{ width: '200px', height: '200px', borderRadius: '50%' }}
/>`}
              </pre>
            </Flex>
          </Card>
        </Box>
      </Flex>
    </Box>
  );
}
