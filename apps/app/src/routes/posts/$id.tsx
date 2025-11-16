import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Avatar as RadixAvatar } from '@radix-ui/themes';
import { Heart, Eye, ArrowLeft, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { api } from '../../lib/api-client';
import { useSession } from '../../lib/auth';
import { Image, TableOfContents, RelatedPosts } from '../../components';
import type { PostResponse } from '@robin/types';
import { Container } from '../../components/layout/Container';
import { Flex } from '../../components/layout/Flex';
import { Heading } from '../../components/typography/Heading';
import { Text } from '../../components/typography/Text';
import { cn } from '../../lib/utils';

export const Route = createFileRoute('/posts/$id')({
  component: PostPage,
  loader: async ({ params }) => {
    const post = await api.get<PostResponse>(`/api/posts/${params.id}`);
    return post;
  },
  errorComponent: ({ error }) => {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Container size="narrow">
          <div className="glass-surface p-12 text-center rounded-2xl">
            <Text size="lg" className="mb-6">
              Failed to load post
            </Text>
            <Link to="/">
              <Button size="3">
                <ArrowLeft size={16} />
                Back to Home
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  },
  head: ({ loaderData }) => {
    if (!loaderData?.post) {
      return {
        title: 'Post Not Found - Robin',
        meta: [],
      };
    }

    const { post } = loaderData;
    const description = post.excerpt || post.content.substring(0, 160).replace(/[#*`]/g, '');
    const imageUrl = post.coverImage || '';
    const publishedDate = new Date(post.publishedAt || post.createdAt).toISOString();

    return {
      title: `${post.title} - Robin`,
      meta: [
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
  const data = Route.useLoaderData();

  const likeMutation = useMutation({
    mutationFn: () => api.post(`/api/posts/${id}/like`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post liked!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to like post');
    },
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data?.post.title,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (!data?.post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Container size="narrow">
          <div className="glass-surface p-12 text-center rounded-2xl">
            <Text size="lg" className="mb-6">
              Post not found
            </Text>
            <Button onClick={() => navigate({ to: '/' })} size="3">
              <ArrowLeft size={16} />
              Back to Home
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const { post } = data;
  const readTime = Math.max(1, Math.ceil(post.content.split(' ').length / 200));

  return (
    <div className="post-detail relative">
      {/* Table of Contents (Desktop only - fixed position) */}
      <TableOfContents content={post.content} />

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-end pb-12 md:pb-16">
        {/* Hero Background Image */}
        {post.coverImage && (
          <div className="absolute inset-0 z-0">
            <Image
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div
              className={cn(
                'absolute inset-0',
                'bg-gradient-to-t',
                'from-bg-base via-bg-base/90 to-transparent'
              )}
              style={{
                backgroundImage: 'linear-gradient(180deg, transparent 0%, rgba(10, 10, 10, 0.3) 40%, rgba(10, 10, 10, 0.9) 80%, var(--color-bg-base) 100%)',
              }}
            />
          </div>
        )}

        {/* Hero Content */}
        <Container size="reading" className="relative z-10">
          <div className="space-y-6">
            <Heading
              level={1}
              variant="display"
              className="text-shadow-lg"
              style={{ textShadow: '0 2px 20px rgba(0, 0, 0, 0.8)' }}
            >
              {post.title}
            </Heading>

            {/* Author Meta */}
            <Flex align="center" gap="4">
              <RadixAvatar
                size="3"
                src={post.author?.image}
                fallback={post.author?.name?.[0] || 'A'}
                radius="full"
              />
              <div>
                <Link
                  to="/"
                  className="no-underline"
                >
                  <Text size="base" weight="medium" color="primary" className="hover:text-accent-400 transition-colors">
                    {post.author?.name}
                  </Text>
                </Link>
                <Flex align="center" gap="2" className="text-text-secondary">
                  <Text size="sm" color="tertiary">
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text size="sm" color="tertiary">·</Text>
                  <Text size="sm" color="tertiary">
                    {readTime} min read
                  </Text>
                  <Text size="sm" color="tertiary">·</Text>
                  <Flex align="center" gap="1">
                    <Eye size={14} />
                    <Text size="sm" color="tertiary">
                      {post.views}
                    </Text>
                  </Flex>
                </Flex>
              </div>
            </Flex>
          </div>
        </Container>
      </section>

      {/* Article Content */}
      <Container size="reading" className="py-12">
        <article className="prose prose-lg dark:prose-invert max-w-full prose-headings:font-serif prose-headings:font-bold prose-p:text-text-primary prose-p:leading-relaxed prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline prose-code:text-purple-300 prose-pre:bg-bg-elevated prose-pre:border prose-pre:border-white/10">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
          >
            {post.content}
          </ReactMarkdown>
        </article>

        {/* Engagement Actions */}
        <div className="mt-12 pt-8 pb-8 border-t border-white/10">
          <Flex align="center" justify="between" gap="6">
            <Flex gap="4" align="center">
              {session ? (
                <Button
                  size="3"
                  variant="soft"
                  onClick={() => likeMutation.mutate()}
                  disabled={likeMutation.isPending}
                  className={cn(
                    'transition-all duration-200',
                    likeMutation.isPending && 'animate-pulse'
                  )}
                >
                  <Heart size={18} />
                  {post.likesCount || 0}
                </Button>
              ) : (
                <Button size="3" variant="soft" disabled>
                  <Heart size={18} />
                  {post.likesCount || 0}
                </Button>
              )}

              <Button
                size="3"
                variant="ghost"
                onClick={handleShare}
              >
                <Share2 size={18} />
                Share
              </Button>
            </Flex>

            <Link to="/" className="no-underline">
              <Button size="3" variant="ghost">
                <ArrowLeft size={16} />
                Back to Home
              </Button>
            </Link>
          </Flex>
        </div>

        {/* Related Posts */}
        <RelatedPosts postId={post.id} />
      </Container>
    </div>
  );
}
