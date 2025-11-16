import { createFileRoute, redirect, Link, useNavigate, useSearch } from '@tanstack/react-router';
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
import { PlusCircle, Edit, Trash2, Eye, FileText, Clock, Heart, Mail, CheckCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
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
  validateSearch: (search: Record<string, unknown>) => ({
    verified: search.verified === 'true' || search.verified === true,
  }),
  component: DashboardPage,
});

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
}

function StatCard({ title, value, icon, gradient }: StatCardProps) {
  return (
    <div className="glass-surface p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      {/* Gradient overlay */}
      <div className={`absolute inset-0 ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>

      <Flex direction="column" gap="3" className="relative z-10">
        <div className={`p-3 rounded-xl ${gradient} bg-opacity-20 w-fit`}>
          {icon}
        </div>

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

function formatDate(date: string | null | undefined): string {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
}

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const search = useSearch({ from: '/dashboard' });
  const { data: session, isPending: isLoading, error } = useSession();
  const [deleteDialog, setDeleteDialog] = useState<{ id: string; title: string } | null>(null);
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // Check for verified query param
  useEffect(() => {
    if (search.verified) {
      setShowSuccessBanner(true);
      toast.success('Email verified successfully!');
      // Remove the query param from URL
      navigate({ to: '/dashboard', search: { verified: false }, replace: true });
    }
  }, [search.verified, navigate]);

  // Check if email is verified
  useEffect(() => {
    if (session?.user?.emailVerified === false) {
      setShowVerificationBanner(true);
    } else {
      setShowVerificationBanner(false);
    }
  }, [session]);

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['admin-posts', session?.user?.id],
    queryFn: () => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }
      return api.get<PostsListResponse>(`/api/posts?status=all&limit=100&userId=${session.user.id}`);
    },
    enabled: !!session?.user?.id,
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
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 pt-20 md:pt-24">
        <Flex align="center" justify="center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <div className="shimmer w-32 h-8 rounded"></div>
        </Flex>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 pt-20 md:pt-24">
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
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 pt-40 md:pt-44">
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
            <Button size="3" className="bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 transition-all shadow-accent hover:shadow-accent-hover text-black font-semibold">
              <PlusCircle size={18} />
              New Post
            </Button>
          </Link>
        </Flex>

        {/* Email Verification Success Banner */}
        {showSuccessBanner && (
          <div className="glass-surface p-4 rounded-xl border border-green-500/30 bg-green-500/10 animate-fade-in">
            <Flex align="center" gap="3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="flex-1">
                <Text size="3" weight="bold" className="text-green-400 block mb-1">
                  Email Verified!
                </Text>
                <Text size="2" className="text-gray-300">
                  Your email has been successfully verified. You now have full access to all features.
                </Text>
              </div>
              <button
                onClick={() => setShowSuccessBanner(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </Flex>
          </div>
        )}

        {/* Email Verification Warning Banner */}
        {showVerificationBanner && (
          <div className="glass-surface p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 animate-fade-in">
            <Flex align="center" gap="3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Mail className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <Text size="3" weight="bold" className="text-yellow-400 block mb-1">
                  Please verify your email
                </Text>
                <Text size="2" className="text-gray-300">
                  We've sent a verification email to <strong>{session?.user?.email}</strong>.
                  Please check your inbox and click the verification link to confirm your account.
                </Text>
              </div>
              <button
                onClick={() => setShowVerificationBanner(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </Flex>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          <StatCard
            title="Published Posts"
            value={publishedPosts.length}
            icon={<FileText className="h-6 w-6 text-amber-400" />}
            gradient="bg-gradient-to-br from-amber-500/20 to-amber-600/20"
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
          />
          <StatCard
            title="Total Likes"
            value={totalLikes}
            icon={<Heart className="h-6 w-6 text-pink-400" />}
            gradient="bg-gradient-to-br from-pink-500 to-pink-700"
          />
        </div>

        {/* Activity Section */}
        <div className="glass-surface p-6 rounded-2xl">
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
                            {formatDate(post.publishedAt || post.createdAt)}
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

        {/* Posts Table */}
        <div className="glass-surface rounded-2xl overflow-hidden">
          <Flex direction="column">
            <Flex justify="between" align="center" className="p-6 border-b border-white/10">
              <Heading size="5">All Posts</Heading>
              <Link to="/admin/posts" style={{ textDecoration: 'none' }}>
                <Button variant="ghost" size="2" className="text-amber-400 hover:text-amber-300">
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
              <Flex direction="column" align="center" gap="6" py="20">
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
                  <Button size="3" className="bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 mt-2 text-black font-semibold shadow-accent hover:shadow-accent-hover">
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
                            {formatDate(post.publishedAt || post.createdAt)}
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
