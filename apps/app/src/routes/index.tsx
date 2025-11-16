import { createFileRoute } from '@tanstack/react-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Button } from '@radix-ui/themes';
import { TrendingUp, Sparkles } from 'lucide-react';
import { api } from '../lib/api-client';
import type { PostsListResponse, PostListItem } from '@robin/types';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Flex } from '../components/layout/Flex';
import { Heading } from '../components/typography/Heading';
import { Text } from '../components/typography/Text';
import { PostCard } from '../components/posts/PostCard';
import FloatingLines from '../components/backgrounds/FloatingLines';

export const Route = createFileRoute('/')({
  component: Index,
  head: () => ({
    title: 'Robin - Discover Stories and Ideas',
    meta: [
      {
        name: 'description',
        content: 'Explore trending stories, articles, and ideas from our community. Join Robin to share your thoughts and discover engaging content.',
      },
      {
        property: 'og:title',
        content: 'Robin - Discover Stories and Ideas',
      },
      {
        property: 'og:description',
        content: 'Explore trending stories, articles, and ideas from our community. Join Robin to share your thoughts and discover engaging content.',
      },
      {
        name: 'twitter:title',
        content: 'Robin - Discover Stories and Ideas',
      },
      {
        name: 'twitter:description',
        content: 'Explore trending stories, articles, and ideas from our community. Join Robin to share your thoughts and discover engaging content.',
      },
    ],
  }),
});

function Index() {
  const [view, setView] = useState<'all' | 'trending'>('all');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['posts', view],
    queryFn: async ({ pageParam = 1 }) => {
      if (view === 'trending') {
        return api.get('/posts/trending?limit=20');
      }
      return api.get<PostsListResponse>(`/posts?page=${pageParam}&limit=20`);
    },
    getNextPageParam: (lastPage: PostsListResponse | { posts: PostListItem[] }) => {
      if ('pagination' in lastPage) {
        const { page, totalPages } = lastPage.pagination;
        return page < totalPages ? page + 1 : undefined;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section spacing="xl" className="relative pt-64 md:pt-72 pb-24 md:pb-32">
        {/* Floating Lines Background */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            minHeight: '100%',
            background: 'var(--color-bg-base)'
          }}
        >
          <div className="relative w-full h-full">
            <FloatingLines
              linesGradient={['#1a1a1a', '#151515', '#1f1f1f']}
              enabledWaves={['top', 'middle', 'bottom']}
              lineCount={[12, 16, 10]}
              lineDistance={[2.5, 2, 2.8]}
              topWavePosition={{ x: 15, y: 0.8, rotate: -0.5 }}
              middleWavePosition={{ x: 8, y: 0.1, rotate: 0.3 }}
              bottomWavePosition={{ x: 3, y: -0.5, rotate: 0.6 }}
              animationSpeed={0.4}
              interactive={true}
              bendRadius={4.0}
              bendStrength={-0.4}
              parallax={true}
              parallaxStrength={0.15}
              mixBlendMode="lighten"
            />
            {/* Gradient fade to background color at bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 pointer-events-none"
              style={{
                height: '100px',
                background: 'linear-gradient(to bottom, transparent 0%, var(--color-bg-base) 100%)'
              }}
            />
            {/* Gradient fade at top to blend with navbar */}
            <div
              className="absolute top-0 left-0 right-0 pointer-events-none"
              style={{
                height: '200px',
                background: 'linear-gradient(to top, transparent 50%, var(--color-bg-base) 100%)'
              }}
            />
          </div>
        </div>

        <Container size="standard">
          <div className="text-center max-w-4xl mx-auto relative">

            {/* Hero Title */}
            <Heading
              level={1}
              variant="display"
              className="hero-title mb-6 tracking-tight"
              style={{
                fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
                lineHeight: '1.1',
                fontWeight: '700',
                letterSpacing: '-0.025em',
                color: '#e8e8e8'
              }}
            >
              Welcome to Robn
            </Heading>

            {/* Hero Subtitle */}
            <Text
              size="lg"
              className="hero-subtitle mb-0 max-w-2xl mx-auto leading-relaxed"
              style={{
                fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
                lineHeight: '1.7',
                color: '#a0a0a0'
              }}
            >
              A modern platform for sharing ideas, stories, and insights.
              Join our community of writers and readers.
            </Text>
          </div>
        </Container>
      </Section>

      {/* Posts Section */}
      <Section spacing="lg">
        <Container size="standard">
          <Flex direction="col" gap="8">
            {/* Filter Tabs */}
            <Flex gap="3">
              <Button
                variant={view === 'all' ? 'solid' : 'soft'}
                onClick={() => setView('all')}
                size="2"
              >
                Latest
              </Button>
              <Button
                variant={view === 'trending' ? 'solid' : 'soft'}
                onClick={() => setView('trending')}
                size="2"
              >
                <TrendingUp size={16} />
                Trending
              </Button>
            </Flex>

            {/* Posts Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-96 rounded-2xl shimmer overflow-hidden stagger-item"
                  />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="glass-surface p-12 text-center rounded-2xl">
                <Text size="lg" color="tertiary">
                  No posts published yet
                </Text>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {posts.map((post: PostListItem, index: number) => (
                    <div key={post.id} className={index < 6 ? 'stagger-item' : ''}>
                      <PostCard post={post} />
                    </div>
                  ))}
                </div>

                {hasNextPage && (
                  <Flex justify="center" className="pt-4">
                    <Button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      variant="soft"
                      size="3"
                    >
                      {isFetchingNextPage ? 'Loading...' : 'Load More'}
                    </Button>
                  </Flex>
                )}
              </>
            )}
          </Flex>
        </Container>
      </Section>
    </div>
  );
}
