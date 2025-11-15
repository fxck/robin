import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Container, Heading, Flex, Button, Card, Text, Box, Separator } from '@radix-ui/themes';
import { Heart, Eye, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { api } from '../../lib/api-client';
import { useSession } from '../../lib/auth';
import { Image, Avatar } from '../../components';
import type { PostResponse } from '@robin/types';

export const Route = createFileRoute('/posts/$id')({
  component: PostPage,
  loader: async ({ params, context }) => {
    try {
      const post = await api.get<PostResponse>(`/api/posts/${params.id}`);
      return post;
    } catch (error) {
      return null;
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData?.post) {
      return {
        meta: [
          {
            title: 'Post Not Found - Robin',
          },
        ],
      };
    }

    const { post } = loaderData;
    const description = post.excerpt || post.content.substring(0, 160).replace(/[#*`]/g, '');
    const imageUrl = post.coverImage || '';
    const publishedDate = new Date(post.publishedAt || post.createdAt).toISOString();

    return {
      meta: [
        {
          title: `${post.title} - Robin`,
        },
        {
          name: 'description',
          content: description,
        },
        {
          name: 'author',
          content: post.author?.name || 'Unknown',
        },
        {
          property: 'article:published_time',
          content: publishedDate,
        },
        {
          property: 'article:author',
          content: post.author?.name || '',
        },
        // Open Graph tags
        {
          property: 'og:type',
          content: 'article',
        },
        {
          property: 'og:title',
          content: post.title,
        },
        {
          property: 'og:description',
          content: description,
        },
        ...(imageUrl ? [{
          property: 'og:image',
          content: imageUrl,
        }] : []),
        // Twitter Card tags
        {
          name: 'twitter:card',
          content: imageUrl ? 'summary_large_image' : 'summary',
        },
        {
          name: 'twitter:title',
          content: post.title,
        },
        {
          name: 'twitter:description',
          content: description,
        },
        ...(imageUrl ? [{
          name: 'twitter:image',
          content: imageUrl,
        }] : []),
      ],
    };
  },
});

function PostPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const loaderData = Route.useLoaderData();

  const { data, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => api.get<PostResponse>(`/api/posts/${id}`),
    initialData: loaderData || undefined,
  });

  const likeMutation = useMutation({
    mutationFn: () => api.post(`/api/posts/${id}/like`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to like post');
    },
  });

  if (isLoading) {
    return (
      <Box style={{ minHeight: 'calc(100vh - 60px)' }}>
        <Container size="3" py="8">
          <Card style={{ height: '400px' }}>
            <Box style={{ background: 'var(--gray-3)', height: '100%', borderRadius: 'var(--radius-2)' }} />
          </Card>
        </Container>
      </Box>
    );
  }

  if (!data?.post) {
    return (
      <Box style={{ minHeight: 'calc(100vh - 60px)' }}>
        <Container size="3" py="8">
          <Card>
            <Flex direction="column" align="center" gap="4" py="9">
              <Text size="5">Post not found</Text>
              <Button onClick={() => navigate({ to: '/posts' })}>
                <ArrowLeft size={16} />
                Back to Posts
              </Button>
            </Flex>
          </Card>
        </Container>
      </Box>
    );
  }

  const { post } = data;

  return (
    <Box style={{ minHeight: 'calc(100vh - 60px)' }}>
      <Container size="3" py="8">
        <Flex direction="column" gap="6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/posts' })}
            style={{ width: 'fit-content' }}
            size="2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>

          {/* Post Card */}
          <Card size="4">
            <Flex direction="column" gap="4">
              {/* Cover Image */}
              {post.coverImage && (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  placeholder="gradient"
                  placeholderText={post.title}
                  aspectRatio={16 / 9}
                  style={{
                    width: '100%',
                    maxHeight: '500px',
                    borderRadius: 'var(--radius-3)',
                  }}
                />
              )}

              {/* Header */}
              <Flex direction="column" gap="4">
                <Heading size="8" style={{ lineHeight: '1.2' }}>
                  {post.title}
                </Heading>

                {/* Author and Stats */}
                <Flex justify="between" align="center" wrap="wrap" gap="3">
                  <Flex gap="3" align="center">
                    <Avatar
                      src={post.author?.image}
                      alt={post.author?.name || 'Author'}
                      name={post.author?.name}
                      size={40}
                    />
                    <Flex direction="column" gap="1">
                      <Text size="3" weight="medium">
                        {post.author?.name}
                      </Text>
                      <Text size="2" color="gray">
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Text>
                    </Flex>
                  </Flex>

                  <Flex gap="4" align="center">
                    <Flex align="center" gap="2">
                      <Eye size={18} style={{ color: 'var(--gray-9)' }} />
                      <Text size="2" color="gray">
                        {post.views} views
                      </Text>
                    </Flex>
                    <Flex align="center" gap="2">
                      <Heart size={18} style={{ color: 'var(--gray-9)' }} />
                      <Text size="2" color="gray">
                        {post.likesCount} likes
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>

              <Separator size="4" />

              {/* Content */}
              <Box className="prose prose-lg max-w-none">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </Box>

              <Separator size="4" />

              {/* Like Button */}
              <Flex justify="center">
                {session ? (
                  <Button
                    size="3"
                    variant="soft"
                    onClick={() => likeMutation.mutate()}
                    disabled={likeMutation.isPending}
                  >
                    <Heart size={20} />
                    {post.likesCount > 0 ? `${post.likesCount} Likes` : 'Like this post'}
                  </Button>
                ) : (
                  <Text size="2" color="gray">
                    Sign in to like this post
                  </Text>
                )}
              </Flex>
            </Flex>
          </Card>
        </Flex>
      </Container>
    </Box>
  );
}
