import { createFileRoute, Link, useNavigate, redirect } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Heading,
  Flex,
  Button,
  Card,
  Text,
  Badge,
  Box,
  Table,
  AlertDialog,
  Grid,
} from '@radix-ui/themes';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { api } from '../lib/api-client';
import { authClient } from '../lib/auth';
import type { PostsListResponse } from '@robin/types';

export const Route = createFileRoute('/admin/posts/')({
  component: AdminPostsPage,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: '/auth' });
    }
  },
});

function AdminPostsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = useState<{ id: string; title: string } | null>(null);

  const { data, isLoading } = useQuery({
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

  const posts = data?.posts || [];

  return (
    <Box style={{ minHeight: 'calc(100vh - 60px)' }}>
      <Container size="4" py="8">
        <Flex direction="column" gap="6">
          {/* Header */}
          <Flex justify="between" align="center">
            <Heading size="8">Posts</Heading>
            <Link to="/admin/posts/new" style={{ textDecoration: 'none' }}>
              <Button size="3">
                <PlusCircle size={18} />
                New Post
              </Button>
            </Link>
          </Flex>

          {/* Stats */}
          <Grid columns={{ initial: '1', sm: '3' }} gap="4">
            <Card>
              <Flex direction="column" gap="2" p="3">
                <Text size="2" color="gray">
                  Total Posts
                </Text>
                <Heading size="7">{posts.length}</Heading>
              </Flex>
            </Card>
            <Card>
              <Flex direction="column" gap="2" p="3">
                <Text size="2" color="gray">
                  Published
                </Text>
                <Heading size="7">{posts.filter((p) => p.status === 'published').length}</Heading>
              </Flex>
            </Card>
            <Card>
              <Flex direction="column" gap="2" p="3">
                <Text size="2" color="gray">
                  Drafts
                </Text>
                <Heading size="7">{posts.filter((p) => p.status === 'draft').length}</Heading>
              </Flex>
            </Card>
          </Grid>

          {/* Posts Table */}
          <Card>
            {isLoading ? (
              <Box py="9">
                <Text align="center" color="gray">Loading...</Text>
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
                    <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {posts.map((post) => (
                    <Table.Row key={post.id}>
                      <Table.Cell>
                        <Flex direction="column" gap="1">
                          <Text weight="medium">{post.title}</Text>
                          {post.excerpt && (
                            <Text size="1" color="gray">{post.excerpt.substring(0, 60)}...</Text>
                          )}
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={post.status === 'published' ? 'green' : 'gray'}>
                          {post.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2">{post.views}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2">{post.likesCount}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2">{new Date(post.createdAt).toLocaleDateString()}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap="2">
                          <Button
                            size="1"
                            variant="soft"
                            onClick={() => navigate({ to: `/posts/${post.id}` })}
                          >
                            <Eye size={14} />
                          </Button>
                          <Button
                            size="1"
                            variant="soft"
                            color="blue"
                            onClick={() => navigate({ to: `/admin/posts/${post.id}/edit` })}
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
