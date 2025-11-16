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
  TextField,
  Select,
  Checkbox,
} from '@radix-ui/themes';
import { PlusCircle, Edit, Trash2, Eye, Search, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
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
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Bulk selection state
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery<PostsListResponse>({
    queryKey: ['admin-posts'],
    queryFn: () => api.get<PostsListResponse>('/posts?status=all&limit=100'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/posts/${id}`),
    onSuccess: () => {
      toast.success('Post deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      setDeleteDialog(null);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to delete post');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => api.delete(`/posts/${id}`)));
    },
    onSuccess: () => {
      toast.success(`${selectedPosts.size} posts deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      setSelectedPosts(new Set());
      setBulkDeleteDialog(false);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to delete posts');
    },
  });

  const handleDeleteConfirm = () => {
    if (deleteDialog) {
      deleteMutation.mutate(deleteDialog.id);
    }
  };

  const handleBulkDeleteConfirm = () => {
    bulkDeleteMutation.mutate(Array.from(selectedPosts));
  };

  const togglePostSelection = (postId: string) => {
    const newSelection = new Set(selectedPosts);
    if (newSelection.has(postId)) {
      newSelection.delete(postId);
    } else {
      newSelection.add(postId);
    }
    setSelectedPosts(newSelection);
  };

  const toggleSelectAll = (posts: any[]) => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(posts.map(p => p.id)));
    }
  };

  const allPosts = data?.posts || [];

  // Filter and search posts
  const filteredPosts = useMemo(() => {
    let filtered = [...allPosts];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(post => {
        const postDate = new Date(post.createdAt);

        if (dateFilter === 'today') {
          return postDate >= today;
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return postDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return postDate >= monthAgo;
        }
        return true;
      });
    }

    return filtered;
  }, [allPosts, searchQuery, statusFilter, dateFilter]);

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all' || dateFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFilter('all');
  };

  return (
    <Box style={{ minHeight: 'calc(100vh - 60px)', paddingTop: '100px' }}>
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
                <Heading size="7">{allPosts.length}</Heading>
              </Flex>
            </Card>
            <Card>
              <Flex direction="column" gap="2" p="3">
                <Text size="2" color="gray">
                  Published
                </Text>
                <Heading size="7">{allPosts.filter(p => p.status === 'published').length}</Heading>
              </Flex>
            </Card>
            <Card>
              <Flex direction="column" gap="2" p="3">
                <Text size="2" color="gray">
                  Drafts
                </Text>
                <Heading size="7">{allPosts.filter(p => p.status === 'draft').length}</Heading>
              </Flex>
            </Card>
          </Grid>

          {/* Search and Filters */}
          <Card>
            <Flex direction="column" gap="4" p="4">
              <Flex gap="3" wrap="wrap" align="center">
                {/* Search */}
                <Box style={{ flex: '1', minWidth: '250px' }}>
                  <TextField.Root
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="2"
                  >
                    <TextField.Slot>
                      <Search size={16} />
                    </TextField.Slot>
                    {searchQuery && (
                      <TextField.Slot>
                        <Button
                          size="1"
                          variant="ghost"
                          onClick={() => setSearchQuery('')}
                        >
                          <X size={14} />
                        </Button>
                      </TextField.Slot>
                    )}
                  </TextField.Root>
                </Box>

                {/* Status Filter */}
                <Select.Root value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                  <Select.Trigger style={{ minWidth: '130px' }}>
                    <Flex align="center" gap="2">
                      <Filter size={14} />
                      Status
                    </Flex>
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="all">All Status</Select.Item>
                    <Select.Item value="published">Published</Select.Item>
                    <Select.Item value="draft">Draft</Select.Item>
                  </Select.Content>
                </Select.Root>

                {/* Date Filter */}
                <Select.Root value={dateFilter} onValueChange={(v) => setDateFilter(v as any)}>
                  <Select.Trigger style={{ minWidth: '130px' }}>
                    <Flex align="center" gap="2">
                      <Filter size={14} />
                      Date
                    </Flex>
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="all">All Time</Select.Item>
                    <Select.Item value="today">Today</Select.Item>
                    <Select.Item value="week">Past Week</Select.Item>
                    <Select.Item value="month">Past Month</Select.Item>
                  </Select.Content>
                </Select.Root>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button variant="soft" onClick={clearFilters}>
                    <X size={14} />
                    Clear Filters
                  </Button>
                )}
              </Flex>

              {/* Bulk Actions */}
              {selectedPosts.size > 0 && (
                <Flex gap="2" align="center" style={{
                  padding: '12px',
                  background: 'var(--amber-3)',
                  borderRadius: 'var(--radius-3)',
                }}>
                  <Text size="2" weight="medium">
                    {selectedPosts.size} selected
                  </Text>
                  <Button
                    size="2"
                    variant="soft"
                    color="red"
                    onClick={() => setBulkDeleteDialog(true)}
                  >
                    <Trash2 size={14} />
                    Delete Selected
                  </Button>
                  <Button
                    size="2"
                    variant="ghost"
                    onClick={() => setSelectedPosts(new Set())}
                  >
                    Clear Selection
                  </Button>
                </Flex>
              )}

              {/* Results info */}
              {hasActiveFilters && (
                <Text size="2" color="gray">
                  Showing {filteredPosts.length} of {allPosts.length} posts
                </Text>
              )}
            </Flex>
          </Card>

          {/* Posts Table */}
          <Card>
            {isLoading ? (
              <Box py="9">
                <Text align="center" color="gray">Loading...</Text>
              </Box>
            ) : filteredPosts.length === 0 ? (
              <Flex direction="column" align="center" gap="4" py="9">
                <Text size="5" color="gray">
                  {hasActiveFilters ? 'No posts match your filters' : 'No posts yet'}
                </Text>
                {hasActiveFilters ? (
                  <Button variant="soft" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  <Link to="/admin/posts/new" style={{ textDecoration: 'none' }}>
                    <Button size="3">
                      <PlusCircle size={18} />
                      Create your first post
                    </Button>
                  </Link>
                )}
              </Flex>
            ) : (
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell style={{ width: '40px' }}>
                      <Checkbox
                        checked={selectedPosts.size === filteredPosts.length && filteredPosts.length > 0}
                        onCheckedChange={() => toggleSelectAll(filteredPosts)}
                      />
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Views</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Likes</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredPosts.map((post) => (
                    <Table.Row key={post.id}>
                      <Table.Cell>
                        <Checkbox
                          checked={selectedPosts.has(post.id)}
                          onCheckedChange={() => togglePostSelection(post.id)}
                        />
                      </Table.Cell>
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

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog.Root open={bulkDeleteDialog} onOpenChange={setBulkDeleteDialog}>
        <AlertDialog.Content maxWidth="450px">
          <AlertDialog.Title>Delete {selectedPosts.size} Posts</AlertDialog.Title>
          <AlertDialog.Description size="2">
            Are you sure you want to delete {selectedPosts.size} selected post{selectedPosts.size > 1 ? 's' : ''}? This action cannot be undone.
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button
                variant="solid"
                color="red"
                onClick={handleBulkDeleteConfirm}
                disabled={bulkDeleteMutation.isPending}
              >
                {bulkDeleteMutation.isPending ? 'Deleting...' : 'Delete Posts'}
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
}
