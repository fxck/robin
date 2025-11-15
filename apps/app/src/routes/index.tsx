import { createFileRoute, Link } from '@tanstack/react-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Container, Flex, Button, Card, Text, Box, Grid } from '@radix-ui/themes';
import { TrendingUp, Heart, Eye } from 'lucide-react';
import { api } from '../lib/api-client';
import { Image, Avatar } from '../components';
import type { PostsListResponse, PostListItem } from '@robin/types';

export const Route = createFileRoute('/')({
  component: Index,
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
        return api.get<{ posts: PostListItem[] }>('/api/posts/trending?limit=20');
      }
      return api.get<PostsListResponse>(`/api/posts?page=${pageParam}&limit=20`);
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
    <Box style={{ minHeight: 'calc(100vh - 60px)' }}>
      <Container size="4" py="8">
        <Flex direction="column" gap="6">
          <Flex gap="2">
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
              </Flex>
            </Card>
          ) : (
            <>
              <Grid columns={{ initial: '1', md: '2', lg: '3' }} gap="5">
                {posts.map((post: PostListItem) => (
                  <Link key={post.id} to="/posts/$id" params={{ id: post.id }} style={{ textDecoration: 'none' }}>
                    <Card className="post-card">
                      <Flex direction="column" gap="0">
                        <Image
                          src={post.coverImageThumb || post.coverImage}
                          alt={post.title}
                          placeholder="gradient"
                          placeholderText={post.title}
                          aspectRatio={16 / 9}
                          style={{
                            width: '100%',
                            height: '200px',
                            borderRadius: 'var(--radius-3) var(--radius-3) 0 0',
                          }}
                        />
                        <Flex direction="column" gap="3" p="4">
                          <Text size="5" weight="bold">{post.title}</Text>
                          {post.excerpt && (
                            <Text size="2" color="gray" style={{ lineHeight: '1.5' }}>
                              {post.excerpt.length > 120
                                ? `${post.excerpt.substring(0, 120)}...`
                                : post.excerpt}
                            </Text>
                          )}
                          <Flex justify="between" align="center" mt="2">
                            <Flex gap="2" align="center">
                              <Avatar
                                src={post.author?.image}
                                alt={post.author?.name || 'Author'}
                                name={post.author?.name}
                                size={28}
                              />
                              <Text size="2" color="gray">
                                {post.author?.name}
                              </Text>
                            </Flex>
                            <Flex gap="3" align="center">
                              <Flex gap="1" align="center">
                                <Heart size={14} style={{ color: 'var(--gray-9)' }} />
                                <Text size="1" color="gray">
                                  {post.likesCount}
                                </Text>
                              </Flex>
                              <Flex gap="1" align="center">
                                <Eye size={14} style={{ color: 'var(--gray-9)' }} />
                                <Text size="1" color="gray">
                                  {post.views}
                                </Text>
                              </Flex>
                            </Flex>
                          </Flex>
                        </Flex>
                      </Flex>
                    </Card>
                  </Link>
                ))}
              </Grid>

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
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid var(--gray-a5);
        }
        .post-card:hover {
          transform: translateY(-2px);
          border-color: var(--accent-a7);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }
      `}</style>
    </Box>
  );
}
