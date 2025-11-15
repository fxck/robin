import { createFileRoute, redirect, Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Text,
  Grid,
  Table,
  Badge,
  AlertDialog,
} from '@radix-ui/themes';
import { PlusCircle, Edit, Trash2, Eye, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useSession, authClient } from '../lib/auth';
import { api } from '../lib/api-client';
import type { PostsListResponse } from '@robin/types';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: '/auth' });
    }
  },
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session, isPending: isLoading, error } = useSession();
  const [deleteDialog, setDeleteDialog] = useState<{ id: string; title: string } | null>(null);

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => api.get<PostsListResponse>('/api/posts?status=all&limit=100'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/posts/${id}`),
    onSuccess: () => {
      toast.success('Post deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      setDeleteDialog(null);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to delete post');
    },
  });

  const handleDeleteConfirm = () => {
    if (deleteDialog) {
      deleteMutation.mutate(deleteDialog.id);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Flex align="center" justify="center" style={{ minHeight: 'calc(100vh - 60px)' }}>
          <Text>Loading...</Text>
        </Flex>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Flex
          align="center"
          justify="center"
          direction="column"
          gap="4"
          style={{ minHeight: 'calc(100vh - 60px)' }}
        >
          <Text color="red" size="3">
            Failed to load session
          </Text>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Flex>
      </Container>
    );
  }

  const posts = postsData?.posts || [];
  const publishedPosts = posts.filter((p) => p.status === 'published');
  const draftPosts = posts.filter((p) => p.status === 'draft');
  const totalViews = posts.reduce((acc, p) => acc + p.views, 0);
  const totalLikes = posts.reduce((acc, p) => acc + p.likesCount, 0);

  return (
    <Box style={{ minHeight: 'calc(100vh - 60px)' }}>
      <Container size="4" py="8">
        <Flex direction="column" gap="6">
          {/* Header */}
          <Flex justify="between" align="center">
            <Flex direction="column" gap="1">
              <Heading size="7">Content Management</Heading>
              <Text size="2" color="gray">
                {session?.user?.email}
              </Text>
            </Flex>
            <Link to="/admin/posts/new" style={{ textDecoration: 'none' }}>
              <Button size="3">
                <PlusCircle size={18} />
                New Post
              </Button>
            </Link>
          </Flex>

          {/* Stats */}
          <Grid columns={{ initial: '2', sm: '4' }} gap="4">
            <Card>
              <Flex direction="column" gap="2" p="3">
                <Text size="2" color="gray">
                  Published
                </Text>
                <Heading size="6">{publishedPosts.length}</Heading>
              </Flex>
            </Card>
            <Card>
              <Flex direction="column" gap="2" p="3">
                <Text size="2" color="gray">
                  Drafts
                </Text>
                <Heading size="6">{draftPosts.length}</Heading>
              </Flex>
            </Card>
            <Card>
              <Flex direction="column" gap="2" p="3">
                <Text size="2" color="gray">
                  Views
                </Text>
                <Heading size="6">{totalViews}</Heading>
              </Flex>
            </Card>
            <Card>
              <Flex direction="column" gap="2" p="3">
                <Text size="2" color="gray">
                  Likes
                </Text>
                <Heading size="6">{totalLikes}</Heading>
              </Flex>
            </Card>
          </Grid>

          {/* Posts Table */}
          <Card>
            <Flex direction="column" gap="3">
              <Flex justify="between" align="center" p="4" pb="0">
                <Heading size="5">Recent Posts</Heading>
                <Link to="/admin/posts" style={{ textDecoration: 'none' }}>
                  <Button variant="ghost" size="2">
                    View All
                  </Button>
                </Link>
              </Flex>

              {postsLoading ? (
                <Box py="9">
                  <Text align="center" color="gray">
                    Loading...
                  </Text>
                </Box>
              ) : posts.length === 0 ? (
                <Flex direction="column" align="center" gap="4" py="9">
                  <Text size="5" color="gray">
                    No posts yet
                  </Text>
                  <Link to="/admin/posts/new" style={{ textDecoration: 'none' }}>
                    <Button size="3">
                      <PlusCircle size={18} />
                      Create your first post
                    </Button>
                  </Link>
                </Flex>
              ) : (
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Views</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Likes</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {posts.slice(0, 5).map((post) => (
                      <Table.Row key={post.id}>
                        <Table.Cell>
                          <Flex direction="column" gap="1">
                            <Text weight="medium">{post.title}</Text>
                            {post.excerpt && (
                              <Text size="1" color="gray">
                                {post.excerpt.substring(0, 60)}...
                              </Text>
                            )}
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color={post.status === 'published' ? 'green' : 'gray'}>
                            {post.status}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex gap="1" align="center">
                            <Eye size={14} style={{ color: 'var(--gray-9)' }} />
                            <Text size="2">{post.views}</Text>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex gap="1" align="center">
                            <TrendingUp size={14} style={{ color: 'var(--gray-9)' }} />
                            <Text size="2">{post.likesCount}</Text>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex gap="2">
                            <Button
                              size="1"
                              variant="soft"
                              onClick={() => navigate({ to: '/posts/$id', params: { id: post.id } })}
                            >
                              <Eye size={14} />
                            </Button>
                            <Button
                              size="1"
                              variant="soft"
                              color="blue"
                              onClick={() =>
                                navigate({ to: '/admin/posts/$id/edit', params: { id: post.id } })
                              }
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              size="1"
                              variant="soft"
                              color="red"
                              onClick={() => setDeleteDialog({ id: post.id, title: post.title })}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              )}
            </Flex>
          </Card>
        </Flex>
      </Container>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialog.Content maxWidth="450px">
          <AlertDialog.Title>Delete Post</AlertDialog.Title>
          <AlertDialog.Description size="2">
            Are you sure you want to delete "{deleteDialog?.title}"? This action cannot be undone.
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button variant="solid" color="red" onClick={handleDeleteConfirm}>
                Delete Post
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
}
