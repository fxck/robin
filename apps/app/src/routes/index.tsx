import { createFileRoute, Link } from '@tanstack/react-router';
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
import MagnetLines from '../components/backgrounds/MagnetLines';
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
            {/* Magnetic vertical lines that bend toward cursor */}
            <MagnetLines
              lineCount={60}
              magnetStrength={120}
              magnetRadius={450}
              lineColor="#2a2a2a"
              lineWidth={1.5}
              opacity={0.5}
              animationSpeed={0.4}
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
              <Link to="/posts" className="no-underline">
                <button className="hero-cta-btn">
                  <Sparkles size={20} strokeWidth={2.5} />
                  <span>Explore Stories</span>
                </button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* Posts Section */}
      <Section spacing="lg">
        <Container size="standard">
          <Flex direction="col" gap="8">
            {/* Filter Tabs - Centered */}
            <div className="flex justify-center items-center w-full mb-12">
              <div className="inline-flex gap-2 p-2 bg-white/5 rounded-xl border border-white/10">
                <button
                  onClick={() => setView('all')}
                  className={cn(
                    'px-8 py-3 rounded-lg text-base font-medium transition-all duration-200',
                    view === 'all'
                      ? 'bg-white text-black'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  Latest
                </button>
                <button
                  onClick={() => setView('trending')}
                  className={cn(
                    'px-8 py-3 rounded-lg text-base font-medium transition-all duration-200 flex items-center gap-2',
                    view === 'trending'
                      ? 'bg-white text-black'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <TrendingUp size={18} />
                  Trending
                </button>
              </div>
            </div>

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
