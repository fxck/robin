import { createFileRoute, Link } from '@tanstack/react-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Container, Heading, Flex, Button, Card, Text, Box, Grid } from '@radix-ui/themes';
import { TrendingUp, Home } from 'lucide-react';
import { api } from '../../lib/api-client';
import type { PostsListResponse } from '@robin/types';

export const Route = createFileRoute('/posts/')({
  component: PublicPostsPage,
});

function PublicPostsPage() {
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
        return api.get<{ posts: any[] }>('/api/posts/trending?limit=20');
      }
      return api.get<PostsListResponse>(`/api/posts?page=${pageParam}&limit=20`);
    },
    getNextPageParam: (lastPage: any) => {
      if ('pagination' in lastPage) {
        const { page, totalPages } = lastPage.pagination;
        return page < totalPages ? page + 1 : undefined;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Infinite scroll
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
    <Box style={{ minHeight: '100vh', background: 'var(--gray-2)' }}>
      <Container size="4" py="6">
        <Flex direction="column" gap="6">
          {/* Header */}
          <Flex justify="between" align="center">
            <Heading size="8">Blog</Heading>
            <Link to="/">
              <Button variant="soft" size="3">
                <Home size={16} />
                Home
              </Button>
            </Link>
          </Flex>

          {/* View Toggle */}
          <Flex gap="2">
            <Button
              variant={view === 'all' ? 'solid' : 'soft'}
              onClick={() => setView('all')}
            >
              Latest
            </Button>
            <Button
              variant={view === 'trending' ? 'solid' : 'soft'}
              onClick={() => setView('trending')}
            >
              <TrendingUp size={16} />
              Trending
            </Button>
          </Flex>

          {/* Posts Grid */}
          {isLoading ? (
            <Grid columns={{ initial: '1', md: '2', lg: '3' }} gap="4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} style={{ height: '300px' }}>
                  <Box style={{ background: 'var(--gray-3)', height: '100%', borderRadius: 'var(--radius-2)' }} />
                </Card>
              ))}
            </Grid>
          ) : posts.length === 0 ? (
            <Card>
              <Flex direction="column" align="center" gap="4" py="9">
                <Text size="5" color="gray">
                  No posts published yet
                </Text>
                <Text size="2" color="gray">
                  Check back soon for new content!
                </Text>
              </Flex>
            </Card>
          ) : (
            <>
              <Grid columns={{ initial: '1', md: '2', lg: '3' }} gap="4">
                {posts.map((post: any) => (
                  <Link key={post.id} to={`/posts/${post.id}`} style={{ textDecoration: 'none' }}>
                    <Card style={{ height: '100%', cursor: 'pointer' }} className="post-card">
                      {post.coverImage && (
                        <Box
                          style={{
                            width: '100%',
                            height: '200px',
                            backgroundImage: `url(${post.coverImageThumb || post.coverImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: 'var(--radius-2) var(--radius-2) 0 0',
                            marginBottom: 'var(--space-3)',
                          }}
                        />
                      )}
                      <Flex direction="column" gap="3" p="3">
                        <Flex justify="end" gap="3">
                          <Text size="1" color="gray">
                            ❤️ {post.likesCount}
                          </Text>
                          <Text size="1" color="gray">
                            👁️ {post.views}
                          </Text>
                        </Flex>
                        <Heading size="4">{post.title}</Heading>
                        {post.excerpt && (
                          <Text size="2" color="gray">
                            {post.excerpt}
                          </Text>
                        )}
                        <Flex gap="2" align="center">
                          {post.author?.image && (
                            <Box
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundImage: `url(${post.author.image})`,
                                backgroundSize: 'cover',
                              }}
                            />
                          )}
                          <Text size="2" color="gray">
                            {post.author?.name}
                          </Text>
                        </Flex>
                      </Flex>
                    </Card>
                  </Link>
                ))}
              </Grid>

              {/* Load More */}
              {hasNextPage && (
                <Flex justify="center" py="4">
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

      <style>{`
        .post-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .post-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </Box>
  );
}
