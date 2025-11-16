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
        <Flex direction="column" gap="10">
          {/* Header */}
          <Flex justify="between" align="center" className="flex-col gap-6 md:flex-row md:items-center">
            <div className="space-y-3">
              <Heading size="9" className="bg-gradient-to-br from-white via-gray-100 to-gray-500 bg-clip-text font-black tracking-tight text-transparent">
                Posts
              </Heading>
              <Text size="3" className="text-gray-400">
                Manage and organize all your content
              </Text>
            </div>
            <Link to="/admin/posts/new" style={{ textDecoration: 'none' }}>
              <Button
                size="4"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 px-8 py-4 text-base font-bold text-black shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/50"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <PlusCircle size={20} className="transition-transform duration-300 group-hover:rotate-90" />
                  New Post
                </span>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-amber-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </Button>
            </Link>
          </Flex>

          {/* Stats */}
          <Grid columns={{ initial: '1', sm: '3' }} gap="6">
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/10">
              <Flex direction="column" gap="3">
                <Text size="2" className="font-medium uppercase tracking-wider text-gray-500">
                  Total Posts
                </Text>
                <Heading size="8" className="bg-gradient-to-br from-white to-gray-400 bg-clip-text font-bold text-transparent">
                  {allPosts.length}
                </Heading>
              </Flex>
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-500/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"></div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10">
              <Flex direction="column" gap="3">
                <Text size="2" className="font-medium uppercase tracking-wider text-gray-500">
                  Published
                </Text>
                <Heading size="8" className="bg-gradient-to-br from-white to-gray-400 bg-clip-text font-bold text-transparent">
                  {allPosts.filter(p => p.status === 'published').length}
                </Heading>
              </Flex>
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-green-500/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"></div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10">
              <Flex direction="column" gap="3">
                <Text size="2" className="font-medium uppercase tracking-wider text-gray-500">
                  Drafts
                </Text>
                <Heading size="8" className="bg-gradient-to-br from-white to-gray-400 bg-clip-text font-bold text-transparent">
                  {allPosts.filter(p => p.status === 'draft').length}
                </Heading>
              </Flex>
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"></div>
            </div>
          </Grid>

          {/* Search and Filters */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
            <Flex direction="column" gap="6">
              <Flex gap="4" wrap="wrap" align="center">
                {/* Search */}
                <Box style={{ flex: '1', minWidth: '300px' }}>
                  <div className="relative">
                    <TextField.Root
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      size="3"
                      className="rounded-xl border-white/20 bg-white/5 pl-12 transition-all focus-within:border-amber-500/50 focus-within:bg-white/10"
                    >
                      <TextField.Slot className="pl-4">
                        <Search size={18} className="text-gray-400" />
                      </TextField.Slot>
                      {searchQuery && (
                        <TextField.Slot>
                          <Button
                            size="2"
                            variant="ghost"
                            onClick={() => setSearchQuery('')}
                            className="rounded-lg hover:bg-white/10"
                          >
                            <X size={16} />
                          </Button>
                        </TextField.Slot>
                      )}
                    </TextField.Root>
                  </div>
                </Box>

                {/* Status Filter */}
                <Select.Root value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                  <Select.Trigger style={{ minWidth: '150px' }} className="rounded-xl border-white/20 bg-white/5 px-4 py-3 transition-all hover:border-white/30 hover:bg-white/10">
                    <Flex align="center" gap="2">
                      <Filter size={16} />
                      <span className="font-medium">Status</span>
                    </Flex>
                  </Select.Trigger>
                  <Select.Content className="rounded-xl border-white/20 bg-black/90 backdrop-blur-xl">
                    <Select.Item value="all">All Status</Select.Item>
                    <Select.Item value="published">Published</Select.Item>
                    <Select.Item value="draft">Draft</Select.Item>
                  </Select.Content>
                </Select.Root>

                {/* Date Filter */}
                <Select.Root value={dateFilter} onValueChange={(v) => setDateFilter(v as any)}>
                  <Select.Trigger style={{ minWidth: '150px' }} className="rounded-xl border-white/20 bg-white/5 px-4 py-3 transition-all hover:border-white/30 hover:bg-white/10">
                    <Flex align="center" gap="2">
                      <Filter size={16} />
                      <span className="font-medium">Date</span>
                    </Flex>
                  </Select.Trigger>
                  <Select.Content className="rounded-xl border-white/20 bg-black/90 backdrop-blur-xl">
                    <Select.Item value="all">All Time</Select.Item>
                    <Select.Item value="today">Today</Select.Item>
                    <Select.Item value="week">Past Week</Select.Item>
                    <Select.Item value="month">Past Month</Select.Item>
                  </Select.Content>
                </Select.Root>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button
                    variant="soft"
                    onClick={clearFilters}
                    size="3"
                    className="rounded-xl border border-white/20 bg-white/5 font-medium transition-all hover:border-white/30 hover:bg-white/10"
                  >
                    <X size={16} />
                    Clear Filters
                  </Button>
                )}
              </Flex>

              {/* Bulk Actions */}
              {selectedPosts.size > 0 && (
                <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-4">
                  <Flex gap="3" align="center">
                    <Text size="3" weight="bold" className="text-amber-400">
                      {selectedPosts.size} selected
                    </Text>
                    <Button
                      size="3"
                      variant="soft"
                      color="red"
                      onClick={() => setBulkDeleteDialog(true)}
                      className="rounded-lg font-semibold"
                    >
                      <Trash2 size={16} />
                      Delete Selected
                    </Button>
                    <Button
                      size="3"
                      variant="ghost"
                      onClick={() => setSelectedPosts(new Set())}
                      className="rounded-lg font-medium"
                    >
                      Clear Selection
                    </Button>
                  </Flex>
                </div>
              )}

              {/* Results info */}
              {hasActiveFilters && (
                <Flex align="center" gap="2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  <Text size="2" className="font-medium text-gray-400">
                    Showing {filteredPosts.length} of {allPosts.length} posts
                  </Text>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </Flex>
              )}
            </Flex>
          </div>

          {/* Posts Table */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
            {isLoading ? (
              <Box py="16">
                <Flex direction="column" align="center" gap="4">
                  <div className="shimmer h-8 w-64 rounded-lg"></div>
                  <div className="shimmer h-5 w-48 rounded-lg"></div>
                </Flex>
              </Box>
            ) : filteredPosts.length === 0 ? (
              <Flex direction="column" align="center" gap="8" py="24">
                <div className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-8 ring-1 ring-white/10">
                  <Search size={48} className="text-gray-600" />
                </div>
                <div className="space-y-3 text-center">
                  <Text size="6" weight="bold" className="block text-white">
                    {hasActiveFilters ? 'No posts match your filters' : 'No posts yet'}
                  </Text>
                  <Text size="3" className="block text-gray-500">
                    {hasActiveFilters ? 'Try adjusting your search criteria' : 'Create your first post to get started'}
                  </Text>
                </div>
                {hasActiveFilters ? (
                  <Button
                    variant="soft"
                    onClick={clearFilters}
                    size="3"
                    className="rounded-xl font-semibold"
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Link to="/admin/posts/new" style={{ textDecoration: 'none' }}>
                    <Button
                      size="4"
                      className="rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 px-8 py-4 font-bold text-black shadow-lg shadow-amber-500/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/50"
                    >
                      <PlusCircle size={20} />
                      Create your first post
                    </Button>
                  </Link>
                )}
              </Flex>
            ) : (
              <div className="overflow-x-auto">
                <Table.Root>
                  <Table.Header>
                    <Table.Row className="border-b border-white/10">
                      <Table.ColumnHeaderCell style={{ width: '50px' }} className="py-5">
                        <Checkbox
                          checked={selectedPosts.size === filteredPosts.length && filteredPosts.length > 0}
                          onCheckedChange={() => toggleSelectAll(filteredPosts)}
                          className="rounded-md"
                        />
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="py-5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Title
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="py-5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Status
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="py-5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Views
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="py-5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Likes
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="py-5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Created
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="py-5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Actions
                      </Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredPosts.map((post, index) => (
                      <Table.Row
                        key={post.id}
                        className="group border-b border-white/5 transition-all hover:bg-white/5"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <Table.Cell className="py-5">
                          <Checkbox
                            checked={selectedPosts.has(post.id)}
                            onCheckedChange={() => togglePostSelection(post.id)}
                            className="rounded-md"
                          />
                        </Table.Cell>
                        <Table.Cell className="py-5">
                          <Flex direction="column" gap="2">
                            <Text weight="bold" className="text-white">
                              {post.title}
                            </Text>
                            {post.excerpt && (
                              <Text size="2" className="text-gray-500">
                                {post.excerpt.substring(0, 60)}...
                              </Text>
                            )}
                          </Flex>
                        </Table.Cell>
                        <Table.Cell className="py-5">
                          <Badge
                            color={post.status === 'published' ? 'green' : 'gray'}
                            size="2"
                            className="font-medium"
                          >
                            {post.status}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className="py-5">
                          <Flex gap="2" align="center" className="text-gray-400">
                            <Eye size={16} />
                            <Text size="2" weight="medium">
                              {post.views}
                            </Text>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell className="py-5">
                          <Flex gap="2" align="center" className="text-gray-400">
                            <Heart size={16} />
                            <Text size="2" weight="medium">
                              {post.likesCount}
                            </Text>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell className="py-5">
                          <Text size="2" className="text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </Text>
                        </Table.Cell>
                        <Table.Cell className="py-5">
                          <Flex gap="2">
                            <Button
                              size="2"
                              variant="soft"
                              onClick={() => navigate({ to: `/posts/${post.id}` })}
                              className="transition-all hover:scale-105"
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              size="2"
                              variant="soft"
                              color="blue"
                              onClick={() => navigate({ to: `/admin/posts/${post.id}/edit` })}
                              className="transition-all hover:scale-105"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              size="2"
                              variant="soft"
                              color="red"
                              onClick={() => setDeleteDialog({ id: post.id, title: post.title })}
                              disabled={deleteMutation.isPending}
                              className="transition-all hover:scale-105"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </div>
            )}
          </div>
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
