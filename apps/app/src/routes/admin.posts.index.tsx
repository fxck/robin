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
import { PlusCircle, Edit, Trash2, Eye, Search, Filter, X, Heart, FileText, CheckCircle, Clock } from 'lucide-react';
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
        <Flex direction="column" gap="20">
          {/* Header */}
          <Flex justify="between" align="start" className="mb-4">
            <div className="space-y-4">
              <h1 className="text-admin-page-title text-white">
                Posts
              </h1>
              <div className="text-admin-page-subtitle" style={{ color: 'var(--color-text-tertiary)' }}>
                Manage your blog posts and drafts
              </div>
            </div>
            <Link to="/admin/posts/new" style={{ textDecoration: 'none' }}>
              <Button size="3" className="bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold shadow-accent hover:shadow-accent-hover">
                <PlusCircle size={18} />
                New Post
              </Button>
            </Link>
          </Flex>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {/* TOTAL POSTS */}
            <div className="glass-surface rounded-2xl p-12 transition-all duration-200 hover:bg-white/[0.07]">
              <Flex direction="column" gap="6">
                <div className="w-fit rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-600/30 p-5">
                  <FileText className="h-8 w-8 text-purple-400" />
                </div>
                <div className="space-y-3">
                  <div className="text-admin-stat-label uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Total Posts
                  </div>
                  <div className="text-admin-stat-value text-white">
                    {allPosts.length}
                  </div>
                </div>
              </Flex>
            </div>

            {/* PUBLISHED */}
            <div className="glass-surface rounded-2xl p-12 transition-all duration-200 hover:bg-white/[0.07]">
              <Flex direction="column" gap="6">
                <div className="w-fit rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-600/30 p-5">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <div className="space-y-3">
                  <div className="text-admin-stat-label uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Published
                  </div>
                  <div className="text-admin-stat-value text-white">
                    {allPosts.filter(p => p.status === 'published').length}
                  </div>
                </div>
              </Flex>
            </div>

            {/* DRAFTS */}
            <div className="glass-surface rounded-2xl p-12 transition-all duration-200 hover:bg-white/[0.07]">
              <Flex direction="column" gap="6">
                <div className="w-fit rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/30 p-5">
                  <Clock className="h-8 w-8 text-blue-400" />
                </div>
                <div className="space-y-3">
                  <div className="text-admin-stat-label uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Drafts
                  </div>
                  <div className="text-admin-stat-value text-white">
                    {allPosts.filter(p => p.status === 'draft').length}
                  </div>
                </div>
              </Flex>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="glass-surface rounded-2xl">
            <Flex direction="column" gap="6" className="p-10">
              <Flex gap="2.5" wrap="wrap" align="center">
                {/* Search */}
                <Box style={{ flex: '1', minWidth: '280px' }}>
                  <TextField.Root
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="2"
                    style={{ height: '36px' }}
                  >
                    <TextField.Slot>
                      <Search size={15} style={{ color: 'var(--color-text-tertiary)' }} />
                    </TextField.Slot>
                    {searchQuery && (
                      <TextField.Slot>
                        <button
                          onClick={() => setSearchQuery('')}
                          className="hover:bg-white/10 rounded p-0.5 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </TextField.Slot>
                    )}
                  </TextField.Root>
                </Box>

                {/* Status Filter */}
                <Select.Root value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                  <Select.Trigger style={{ minWidth: '140px', height: '36px' }}>
                    <Flex align="center" gap="2">
                      <Filter size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                      <Text size="2">Status</Text>
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
                  <Select.Trigger style={{ minWidth: '140px', height: '36px' }}>
                    <Flex align="center" gap="2">
                      <Filter size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                      <Text size="2">Date</Text>
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
                  <Button variant="soft" size="2" onClick={clearFilters} className="transition-all duration-200">
                    <X size={14} />
                    Clear Filters
                  </Button>
                )}
              </Flex>

              {/* Bulk Actions */}
              {selectedPosts.size > 0 && (
                <Flex
                  gap="3"
                  align="center"
                  className="p-3 rounded-lg transition-all duration-200"
                  style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                  }}
                >
                  <Text size="2" weight="medium" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedPosts.size} selected
                  </Text>
                  <Button size="2" variant="soft" color="red" onClick={() => setBulkDeleteDialog(true)}>
                    <Trash2 size={14} />
                    Delete Selected
                  </Button>
                  <Button size="2" variant="ghost" onClick={() => setSelectedPosts(new Set())}>
                    Clear Selection
                  </Button>
                </Flex>
              )}

              {/* Results info */}
              {hasActiveFilters && (
                <Text size="1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Showing {filteredPosts.length} of {allPosts.length} posts
                </Text>
              )}
            </Flex>
          </div>

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
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell className="admin-table-header-cell" style={{ width: '50px' }}>
                      <Checkbox
                        checked={selectedPosts.size === filteredPosts.length && filteredPosts.length > 0}
                        onCheckedChange={() => toggleSelectAll(filteredPosts)}
                      />
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="admin-table-header-cell" style={{ width: '42%' }}>
                      <div className="text-admin-table-header" style={{ color: 'var(--color-text-tertiary)' }}>Title</div>
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="admin-table-header-cell" style={{ width: '12%' }}>
                      <div className="text-admin-table-header" style={{ color: 'var(--color-text-tertiary)' }}>Status</div>
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="admin-table-header-cell" style={{ width: '10%' }}>
                      <div className="text-admin-table-header" style={{ color: 'var(--color-text-tertiary)' }}>Views</div>
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="admin-table-header-cell" style={{ width: '10%' }}>
                      <div className="text-admin-table-header" style={{ color: 'var(--color-text-tertiary)' }}>Likes</div>
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="admin-table-header-cell" style={{ width: '13%' }}>
                      <div className="text-admin-table-header" style={{ color: 'var(--color-text-tertiary)' }}>Date</div>
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="admin-table-header-cell" style={{ width: '13%' }}>
                      <div className="text-admin-table-header" style={{ color: 'var(--color-text-tertiary)' }}>Actions</div>
                    </Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredPosts.map((post) => (
                    <Table.Row key={post.id} className="admin-table-row hover:bg-white/[0.08] transition-colors duration-150">
                      <Table.Cell className="admin-table-cell">
                        <Checkbox
                          checked={selectedPosts.has(post.id)}
                          onCheckedChange={() => togglePostSelection(post.id)}
                        />
                      </Table.Cell>
                      <Table.Cell className="admin-table-cell">
                        <Flex direction="column" gap="3">
                          <div className="text-admin-table-cell-title text-white">
                            {post.title}
                          </div>
                          {post.excerpt && (
                            <div className="text-admin-meta line-clamp-2" style={{ color: 'var(--color-text-tertiary)' }}>
                              {post.excerpt}
                            </div>
                          )}
                        </Flex>
                      </Table.Cell>
                      <Table.Cell className="admin-table-cell">
                        <Badge color={post.status === 'published' ? 'green' : 'gray'} size="2">
                          {post.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className="admin-table-cell">
                        <Flex gap="2" align="center">
                          <Eye size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                          <div className="text-admin-table-cell font-medium text-white">{post.views}</div>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell className="admin-table-cell">
                        <Flex gap="2" align="center">
                          <Heart size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                          <div className="text-admin-table-cell font-medium text-white">{post.likesCount}</div>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell className="admin-table-cell">
                        <div className="text-admin-meta" style={{ color: 'var(--color-text-tertiary)' }}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="admin-table-cell">
                        <Flex gap="2">
                          <Button
                            size="2"
                            variant="soft"
                            onClick={() => navigate({ to: `/posts/${post.id}` })}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            size="2"
                            variant="soft"
                            color="blue"
                            onClick={() => navigate({ to: `/admin/posts/${post.id}/edit` })}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            size="2"
                            variant="soft"
                            color="red"
                            onClick={() => setDeleteDialog({ id: post.id, title: post.title })}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 size={16} />
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
