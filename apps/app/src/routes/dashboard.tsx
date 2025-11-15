import { createFileRoute, redirect, Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Table,
  Badge,
  AlertDialog,
} from '@radix-ui/themes';
import { PlusCircle, Edit, Trash2, Eye, TrendingUp, FileText, Clock, BarChart3, Heart } from 'lucide-react';
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

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
}

function StatCard({ title, value, icon, gradient, change }: StatCardProps) {
  return (
    <div className="glass-surface p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      {/* Gradient overlay */}
      <div className={`absolute inset-0 ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>

      <Flex direction="column" gap="3" className="relative z-10">
        <Flex justify="between" align="start">
          <div className={`p-3 rounded-xl ${gradient} bg-opacity-20`}>
            {icon}
          </div>
          {change && (
            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
              change.trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {change.trend === 'up' ? '+' : ''}{change.value}%
            </div>
          )}
        </Flex>

        <div>
          <Text size="2" className="text-gray-400 block mb-1">
            {title}
          </Text>
          <Heading size="7" className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
            {value.toLocaleString()}
          </Heading>
        </div>
      </Flex>
    </div>
  );
}

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
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16">
        <Flex align="center" justify="center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <div className="shimmer w-32 h-8 rounded"></div>
        </Flex>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16">
        <Flex
          align="center"
          justify="center"
          direction="column"
          gap="4"
          style={{ minHeight: 'calc(100vh - 200px)' }}
        >
          <Text color="red" size="3">
            Failed to load session
          </Text>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Flex>
      </div>
    );
  }

  const posts = postsData?.posts || [];
  const publishedPosts = posts.filter((p) => p.status === 'published');
  const draftPosts = posts.filter((p) => p.status === 'draft');
  const totalViews = posts.reduce((acc, p) => acc + p.views, 0);
  const totalLikes = posts.reduce((acc, p) => acc + p.likesCount, 0);

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-16">
      <Flex direction="column" gap="8">
        {/* Header */}
        <Flex justify="between" align="start" className="flex-col md:flex-row gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <Text size="3" className="text-gray-400">
              Welcome back, {session?.user?.name || session?.user?.email}
            </Text>
          </div>
          <Link to="/admin/posts/new" style={{ textDecoration: 'none' }}>
            <Button size="3" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all shadow-accent">
              <PlusCircle size={18} />
              New Post
            </Button>
          </Link>
        </Flex>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          <StatCard
            title="Published Posts"
            value={publishedPosts.length}
            icon={<FileText className="h-6 w-6 text-purple-400" />}
            gradient="bg-gradient-to-br from-purple-500 to-purple-700"
            change={{ value: 12, trend: 'up' }}
          />
          <StatCard
            title="Draft Posts"
            value={draftPosts.length}
            icon={<Clock className="h-6 w-6 text-blue-400" />}
            gradient="bg-gradient-to-br from-blue-500 to-blue-700"
          />
          <StatCard
            title="Total Views"
            value={totalViews}
            icon={<Eye className="h-6 w-6 text-green-400" />}
            gradient="bg-gradient-to-br from-green-500 to-green-700"
            change={{ value: 24, trend: 'up' }}
          />
          <StatCard
            title="Total Likes"
            value={totalLikes}
            icon={<Heart className="h-6 w-6 text-pink-400" />}
            gradient="bg-gradient-to-br from-pink-500 to-pink-700"
            change={{ value: 18, trend: 'up' }}
          />
        </div>

        {/* Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="glass-surface p-6 rounded-2xl">
            <Flex direction="column" gap="4">
              <Flex align="center" gap="2">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                <Heading size="5">Quick Stats</Heading>
              </Flex>

              <div className="space-y-4">
                <Flex justify="between" align="center" className="p-3 bg-white/5 rounded-lg">
                  <Text size="2" className="text-gray-400">Avg. Reading Time</Text>
                  <Text size="2" weight="bold">5.2 min</Text>
                </Flex>
                <Flex justify="between" align="center" className="p-3 bg-white/5 rounded-lg">
                  <Text size="2" className="text-gray-400">Engagement Rate</Text>
                  <Text size="2" weight="bold" className="text-green-400">8.4%</Text>
                </Flex>
                <Flex justify="between" align="center" className="p-3 bg-white/5 rounded-lg">
                  <Text size="2" className="text-gray-400">This Week</Text>
                  <Text size="2" weight="bold">{publishedPosts.slice(0, 3).length} posts</Text>
                </Flex>
              </div>
            </Flex>
          </div>

          {/* Recent Activity */}
          <div className="glass-surface p-6 rounded-2xl lg:col-span-2">
            <Flex direction="column" gap="4">
              <Heading size="5">Recent Activity</Heading>

              <div className="space-y-3">
                {posts.slice(0, 4).map((post) => (
                  <div key={post.id} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <Flex justify="between" align="start" gap="3">
                      <div className="flex-1">
                        <Text size="2" weight="bold" className="block mb-1">{post.title}</Text>
                        <Flex gap="3" align="center">
                          <Text size="1" className="text-gray-500">
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                          </Text>
                          <Badge color={post.status === 'published' ? 'green' : 'gray'} size="1">
                            {post.status}
                          </Badge>
                        </Flex>
                      </div>
                      <Flex gap="4" align="center" className="text-gray-400">
                        <Flex gap="1" align="center">
                          <Eye size={14} />
                          <Text size="1">{post.views}</Text>
                        </Flex>
                        <Flex gap="1" align="center">
                          <Heart size={14} />
                          <Text size="1">{post.likesCount}</Text>
                        </Flex>
                      </Flex>
                    </Flex>
                  </div>
                ))}
              </div>
            </Flex>
          </div>
        </div>

        {/* Posts Table */}
        <div className="glass-surface rounded-2xl overflow-hidden">
          <Flex direction="column">
            <Flex justify="between" align="center" className="p-6 border-b border-white/10">
              <Heading size="5">All Posts</Heading>
              <Link to="/admin/posts" style={{ textDecoration: 'none' }}>
                <Button variant="ghost" size="2" className="text-purple-400 hover:text-purple-300">
                  View All →
                </Button>
              </Link>
            </Flex>

            {postsLoading ? (
              <Box py="9">
                <div className="flex flex-col items-center gap-3">
                  <div className="shimmer w-64 h-6 rounded"></div>
                  <div className="shimmer w-48 h-4 rounded"></div>
                </div>
              </Box>
            ) : posts.length === 0 ? (
              <Flex direction="column" align="center" gap="4" py="12">
                <div className="p-4 bg-white/5 rounded-full">
                  <FileText size={32} className="text-gray-500" />
                </div>
                <div className="text-center">
                  <Text size="5" weight="bold" className="block mb-2">
                    No posts yet
                  </Text>
                  <Text size="2" color="gray">
                    Create your first post to get started
                  </Text>
                </div>
                <Link to="/admin/posts/new" style={{ textDecoration: 'none' }}>
                  <Button size="3" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 mt-2">
                    <PlusCircle size={18} />
                    Create your first post
                  </Button>
                </Link>
              </Flex>
            ) : (
              <div className="overflow-x-auto">
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Views</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Likes</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {posts.slice(0, 10).map((post) => (
                      <Table.Row key={post.id} className="hover:bg-white/5 transition-colors">
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
                            <Heart size={14} style={{ color: 'var(--gray-9)' }} />
                            <Text size="2">{post.likesCount}</Text>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="2" color="gray">
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                          </Text>
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
              </div>
            )}
          </Flex>
        </div>
      </Flex>

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
    </div>
  );
}
