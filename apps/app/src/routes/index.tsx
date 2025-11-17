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
import { cn } from '../lib/utils';

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
      <Section spacing="xl" className="relative pt-64 md:pt-72 pb-24 md:pb-32" style={{ minHeight: '100vh' }}>
        {/* Floating Lines Background */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            minHeight: '100vh',
            background: 'var(--color-bg-base)'
          }}
        >
          <div className="relative w-full h-full">
            {/* Layer 1: Deep background waves - slow, ethereal */}
            <FloatingLines
              linesGradient={['#0a0a0f', '#12101a', '#0f0a15', '#1a0f1f']}
              enabledWaves={['bottom']}
              lineCount={[24]}
              lineDistance={[1.2]}
              bottomWavePosition={{ x: 1.5, y: -0.9, rotate: 0.8 }}
              animationSpeed={0.2}
              interactive={true}
              bendRadius={8.0}
              bendStrength={-0.6}
              mouseDamping={0.03}
              parallax={true}
              parallaxStrength={0.4}
              mixBlendMode="screen"
            />

            {/* Layer 2: Mid-ground diagonal sweep - medium energy */}
            <FloatingLines
              linesGradient={['#1a1520', '#221830', '#2a1a38', '#1f1528']}
              enabledWaves={['middle', 'bottom']}
              lineCount={[18, 14]}
              lineDistance={[1.8, 2.2]}
              middleWavePosition={{ x: 12, y: -0.2, rotate: -0.7 }}
              bottomWavePosition={{ x: 5, y: -0.6, rotate: 1.2 }}
              animationSpeed={0.35}
              interactive={true}
              bendRadius={5.5}
              bendStrength={-0.5}
              mouseDamping={0.05}
              parallax={true}
              parallaxStrength={0.25}
              mixBlendMode="lighten"
            />

            {/* Layer 3: Foreground dynamic lines - high energy, interactive */}
            <FloatingLines
              linesGradient={['#2a2035', '#342842', '#3e2f4a', '#2f2438', '#3a2945']}
              enabledWaves={['top', 'middle', 'bottom']}
              lineCount={[16, 20, 12]}
              lineDistance={[2.8, 1.6, 3.2]}
              topWavePosition={{ x: 20, y: 0.9, rotate: -0.9 }}
              middleWavePosition={{ x: 10, y: 0.15, rotate: 0.5 }}
              bottomWavePosition={{ x: 2.5, y: -0.4, rotate: -1.1 }}
              animationSpeed={0.55}
              interactive={true}
              bendRadius={3.5}
              bendStrength={-0.7}
              mouseDamping={0.08}
              parallax={true}
              parallaxStrength={0.12}
              mixBlendMode="screen"
            />

            {/* Layer 4: Accent sparkle layer - subtle highlights */}
            <FloatingLines
              linesGradient={['#4a3555', '#5a4065', '#3d2e48']}
              enabledWaves={['top', 'middle']}
              lineCount={[8, 10]}
              lineDistance={[4.5, 3.8]}
              topWavePosition={{ x: 25, y: 1.2, rotate: 0.6 }}
              middleWavePosition={{ x: 15, y: 0.4, rotate: -0.4 }}
              animationSpeed={0.7}
              interactive={true}
              bendRadius={2.5}
              bendStrength={-0.8}
              mouseDamping={0.12}
              parallax={true}
              parallaxStrength={0.08}
              mixBlendMode="lighten"
            />
            {/* Gradient fade to background color at bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 pointer-events-none"
              style={{
                height: '200px',
                background: 'linear-gradient(to bottom, transparent 0%, #111110 82%)'
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
              Welcome to Robin
            </Heading>

            {/* Hero Subtitle */}
            <Text
              size="lg"
              className="hero-subtitle mb-10 max-w-2xl mx-auto leading-relaxed"
              style={{
                fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
                lineHeight: '1.7',
                color: '#a0a0a0'
              }}
            >
              A modern platform for sharing ideas, stories, and insights.
              Join our community of writers and readers.
            </Text>

            {/* CTA Button - Centered */}
            <div className="flex justify-center mt-12">
              <a href="/posts" className="no-underline">
                <button className="hero-cta-btn">
                  <Sparkles size={20} strokeWidth={2.5} />
                  <span>Explore Stories</span>
                </button>
              </a>
            </div>
          </div>
        </Container>
      </Section>

      {/* Posts Section */}
      <Section spacing="lg">
        <Container size="standard">
          <Flex direction="col" gap="8">
            {/* Filter Tabs */}
            <Flex gap="4" className="mb-2">
              <button
                onClick={() => setView('all')}
                className={cn(
                  'group relative px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300',
                  'border-2 backdrop-blur-sm',
                  view === 'all'
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-gray-200'
                )}
              >
                <span className="flex items-center gap-2">
                  <Sparkles size={20} className={cn('transition-all duration-300', view === 'all' ? 'animate-pulse' : '')} />
                  Latest
                </span>
              </button>
              <button
                onClick={() => setView('trending')}
                className={cn(
                  'group relative px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300',
                  'border-2 backdrop-blur-sm',
                  view === 'trending'
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-gray-200'
                )}
              >
                <span className="flex items-center gap-2">
                  <TrendingUp size={20} className={cn('transition-all duration-300', view === 'trending' ? 'animate-pulse' : '')} />
                  Trending
                </span>
              </button>
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
