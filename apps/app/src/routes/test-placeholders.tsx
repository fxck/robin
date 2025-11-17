import { createFileRoute } from '@tanstack/react-router';
import { Box, Container, Grid, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { Image } from '../components/image';

export const Route = createFileRoute('/test-placeholders')({
  component: TestPlaceholders,
});

function TestPlaceholders() {
  return (
    <Container size="4" py="8">
      <Flex direction="column" gap="8">
        <div>
          <Heading size="8" mb="2">Image Placeholder System Test</Heading>
          <Text size="3" color="gray">
            Testing the new blur-up and abstract bubble placeholders
          </Text>
        </div>

        {/* Blur Placeholders for Existing Images */}
        <Box>
          <Heading size="6" mb="4">Blur-up Placeholders (Existing Images)</Heading>
          <Text size="2" color="gray" mb="4">
            Tiny blurred gradient → full image with smooth transition
          </Text>
          <Grid columns="3" gap="4">
            <Card>
              <Flex direction="column" gap="2">
                <Image
                  src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba"
                  alt="Nature 1"
                  placeholder="blur"
                  placeholderText="Beautiful Sunset Over Mountains"
                  aspectRatio={16 / 9}
                  style={{ height: '200px' }}
                />
                <Text size="2" color="gray">
                  Blur-up: Sunset
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" gap="2">
                <Image
                  src="https://images.unsplash.com/photo-1682687221038-404cb8830901"
                  alt="Nature 2"
                  placeholder="blur"
                  placeholderText="Ocean Waves at Golden Hour"
                  aspectRatio={16 / 9}
                  style={{ height: '200px' }}
                />
                <Text size="2" color="gray">
                  Blur-up: Ocean
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" gap="2">
                <Image
                  src="https://images.unsplash.com/photo-1682687982501-1e58ab814714"
                  alt="Nature 3"
                  placeholder="blur"
                  placeholderText="Forest Path in Autumn"
                  aspectRatio={16 / 9}
                  style={{ height: '200px' }}
                />
                <Text size="2" color="gray">
                  Blur-up: Forest
                </Text>
              </Flex>
            </Card>
          </Grid>
        </Box>

        {/* Abstract Bubble Placeholders for Non-Existing Images */}
        <Box>
          <Heading size="6" mb="4">Abstract Bubble Placeholders (Non-Existing Images)</Heading>
          <Text size="2" color="gray" mb="4">
            Extremely blurred dark pastel bubbles - no icons
          </Text>
          <Grid columns="3" gap="4">
            <Card>
              <Flex direction="column" gap="2">
                <Image
                  src={null}
                  alt="Post 1"
                  placeholder="bubbles"
                  placeholderText="The Future of AI Technology"
                  aspectRatio={16 / 9}
                  style={{ height: '200px' }}
                />
                <Text size="2" color="gray">
                  Bubbles: AI Post
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" gap="2">
                <Image
                  src={null}
                  alt="Post 2"
                  placeholder="bubbles"
                  placeholderText="Web Development Best Practices"
                  aspectRatio={16 / 9}
                  style={{ height: '200px' }}
                />
                <Text size="2" color="gray">
                  Bubbles: Dev Post
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" gap="2">
                <Image
                  src={null}
                  alt="Post 3"
                  placeholder="bubbles"
                  placeholderText="Design Systems in Modern Apps"
                  aspectRatio={16 / 9}
                  style={{ height: '200px' }}
                />
                <Text size="2" color="gray">
                  Bubbles: Design Post
                </Text>
              </Flex>
            </Card>
          </Grid>
        </Box>

        {/* Default Blur Mode (Auto-switches) */}
        <Box>
          <Heading size="6" mb="4">Default "blur" Mode (Auto-switches)</Heading>
          <Text size="2" color="gray" mb="4">
            Uses tiny blur for existing images, bubbles for missing images
          </Text>
          <Grid columns="2" gap="4">
            <Card>
              <Flex direction="column" gap="2">
                <Image
                  src="https://images.unsplash.com/photo-1682687220063-4742bd7fd538"
                  alt="With Image"
                  placeholder="blur"
                  placeholderText="Mountain Valley"
                  aspectRatio={16 / 9}
                  style={{ height: '200px' }}
                />
                <Text size="2" color="gray">
                  Has image → uses tiny blur
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" gap="2">
                <Image
                  src={null}
                  alt="Without Image"
                  placeholder="blur"
                  placeholderText="Creative Writing Tips"
                  aspectRatio={16 / 9}
                  style={{ height: '200px' }}
                />
                <Text size="2" color="gray">
                  No image → uses bubbles
                </Text>
              </Flex>
            </Card>
          </Grid>
        </Box>

        {/* Different Aspect Ratios */}
        <Box>
          <Heading size="6" mb="4">Different Aspect Ratios</Heading>
          <Grid columns="3" gap="4">
            <Card>
              <Flex direction="column" gap="2">
                <Image
                  src={null}
                  alt="Square"
                  placeholder="bubbles"
                  placeholderText="Square Format"
                  aspectRatio={1}
                  style={{ height: '200px' }}
                />
                <Text size="2" color="gray">
                  1:1 (Square)
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" gap="2">
                <Image
                  src={null}
                  alt="Portrait"
                  placeholder="bubbles"
                  placeholderText="Portrait Format"
                  aspectRatio={9 / 16}
                  style={{ height: '300px' }}
                />
                <Text size="2" color="gray">
                  9:16 (Portrait)
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" gap="2">
                <Image
                  src={null}
                  alt="Ultra-wide"
                  placeholder="bubbles"
                  placeholderText="Ultra-wide Format"
                  aspectRatio={21 / 9}
                  style={{ height: '150px' }}
                />
                <Text size="2" color="gray">
                  21:9 (Ultra-wide)
                </Text>
              </Flex>
            </Card>
          </Grid>
        </Box>
      </Flex>
    </Container>
  );
}
