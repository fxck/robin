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
    <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-[1px] transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/10">
      {/* Gradient border glow */}
      <div className={`absolute inset-0 ${gradient} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-30`}></div>

      {/* Card content */}
      <div className="relative h-full rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-black/40 to-black/80 p-8 backdrop-blur-sm">
        {/* Icon container */}
        <div className={`mb-6 inline-flex rounded-2xl ${gradient} p-4 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:shadow-xl`}>
          <div className="relative">
            {icon}
            <div className={`absolute inset-0 ${gradient} blur-md opacity-50`}></div>
          </div>
        </div>

        {/* Text content */}
        <div className="space-y-2">
          <Text size="2" className="block font-medium uppercase tracking-wider text-gray-500">
            {title}
          </Text>
          <Heading
            size="8"
            className="bg-gradient-to-br from-white via-gray-100 to-gray-400 bg-clip-text font-bold tracking-tight text-transparent transition-all duration-300 group-hover:from-amber-200 group-hover:via-white group-hover:to-amber-300"
          >
            {value.toLocaleString()}
          </Heading>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-white/5 to-transparent opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"></div>
      </div>
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
      return api.get<PostsListResponse>(`/posts?status=all&limit=100&userId=${session.user.id}`);
    },
    enabled: !!session?.user?.id,
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
    <div className="mx-auto max-w-[1400px] px-6 py-16 pt-40 md:px-12 md:pt-44 lg:px-16">
      <Flex direction="column" gap="10">
        {/* Header */}
        <Flex justify="between" align="start" className="flex-col gap-6 md:flex-row md:items-center">
          <div className="space-y-3">
            <h1 className="bg-gradient-to-br from-white via-gray-100 to-gray-500 bg-clip-text text-5xl font-black tracking-tight text-transparent md:text-6xl lg:text-7xl">
              Dashboard
            </h1>
            <Text size="4" className="text-gray-400">
              Welcome back,{' '}
              <span className="font-semibold text-gray-300">
                {session?.user?.name || session?.user?.email}
              </span>
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

        {/* Email Verification Success Banner */}
        {showSuccessBanner && (
          <div className="group relative overflow-hidden rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-6 shadow-lg shadow-green-500/10 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-green-500/20">
            <Flex align="center" gap="4">
              <div className="rounded-xl bg-green-500/20 p-3 shadow-lg ring-1 ring-green-400/30">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="flex-1 space-y-1">
                <Text size="3" weight="bold" className="block text-green-400">
                  Email Verified!
                </Text>
                <Text size="2" className="text-gray-300">
                  Your email has been successfully verified. You now have full access to all features.
                </Text>
              </div>
              <button
                onClick={() => setShowSuccessBanner(false)}
                className="rounded-lg p-2 transition-colors hover:bg-white/10"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </Flex>
          </div>
        )}

        {/* Email Verification Warning Banner */}
        {showVerificationBanner && (
          <div className="group relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-amber-500/5 p-6 shadow-lg shadow-yellow-500/10 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/20">
            <Flex align="center" gap="4">
              <div className="rounded-xl bg-yellow-500/20 p-3 shadow-lg ring-1 ring-yellow-400/30">
                <Mail className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="flex-1 space-y-1">
                <Text size="3" weight="bold" className="block text-yellow-400">
                  Please verify your email
                </Text>
                <Text size="2" className="text-gray-300">
                  We've sent a verification email to{' '}
                  <strong className="text-white">{session?.user?.email}</strong>. Please check your
                  inbox and click the verification link to confirm your account.
                </Text>
              </div>
              <button
                onClick={() => setShowVerificationBanner(false)}
                className="rounded-lg p-2 transition-colors hover:bg-white/10"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </Flex>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Published Posts"
            value={publishedPosts.length}
            icon={<FileText className="h-7 w-7 text-amber-400" />}
            gradient="bg-gradient-to-br from-amber-500 to-amber-600"
          />
          <StatCard
            title="Draft Posts"
            value={draftPosts.length}
            icon={<Clock className="h-7 w-7 text-blue-400" />}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            title="Total Views"
            value={totalViews}
            icon={<Eye className="h-7 w-7 text-green-400" />}
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          />
          <StatCard
            title="Total Likes"
            value={totalLikes}
            icon={<Heart className="h-7 w-7 text-pink-400" />}
            gradient="bg-gradient-to-br from-pink-500 to-rose-600"
          />
        </div>

        {/* Activity Section - Only show if there are posts */}
        {posts.length > 0 && (
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 backdrop-blur-sm transition-all duration-300 hover:border-white/20">
            <Flex direction="column" gap="6">
              <div className="flex items-center justify-between">
                <Heading size="6" className="font-bold text-white">
                  Recent Activity
                </Heading>
                <div className="h-px flex-1 ml-6 bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>

              <div className="space-y-4">
                {posts.slice(0, 4).map((post, index) => (
                  <div
                    key={post.id}
                    className="group/item relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-5 transition-all duration-300 hover:scale-[1.01] hover:border-amber-500/30 hover:bg-white/10 hover:shadow-lg hover:shadow-amber-500/10"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Flex justify="between" align="start" gap="4">
                      <div className="flex-1 space-y-2">
                        <Text size="3" weight="bold" className="block text-white">
                          {post.title}
                        </Text>
                        <Flex gap="3" align="center">
                          <Text size="2" className="text-gray-500">
                            {formatDate(post.publishedAt || post.createdAt)}
                          </Text>
                          <div className="h-1 w-1 rounded-full bg-gray-700"></div>
                          <Badge
                            color={post.status === 'published' ? 'green' : 'gray'}
                            size="1"
                            className="font-medium"
                          >
                            {post.status}
                          </Badge>
                        </Flex>
                      </div>
                      <Flex gap="6" align="center" className="text-gray-400">
                        <Flex gap="2" align="center" className="transition-colors group-hover/item:text-green-400">
                          <Eye size={16} />
                          <Text size="2" weight="medium">
                            {post.views}
                          </Text>
                        </Flex>
                        <Flex gap="2" align="center" className="transition-colors group-hover/item:text-pink-400">
                          <Heart size={16} />
                          <Text size="2" weight="medium">
                            {post.likesCount}
                          </Text>
                        </Flex>
                      </Flex>
                    </Flex>
                    {/* Hover gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 transition-opacity duration-300 group-hover/item:opacity-100"></div>
                  </div>
                ))}
              </div>
            </Flex>
          </div>
        )}

        {/* Posts Table */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
          <Flex direction="column">
            <Flex justify="between" align="center" className="border-b border-white/10 p-8">
              <div>
                <Heading size="6" className="font-bold text-white">
                  All Posts
                </Heading>
                <Text size="2" className="mt-1 text-gray-500">
                  Manage and organize your content
                </Text>
              </div>
              <Link to="/admin/posts" style={{ textDecoration: 'none' }}>
                <Button
                  variant="ghost"
                  size="3"
                  className="group font-semibold text-amber-400 transition-all hover:text-amber-300"
                >
                  View All
                  <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Button>
              </Link>
            </Flex>

            {postsLoading ? (
              <Box py="9">
                <div className="flex flex-col items-center gap-4">
                  <div className="shimmer h-8 w-64 rounded-lg"></div>
                  <div className="shimmer h-5 w-48 rounded-lg"></div>
                </div>
              </Box>
            ) : posts.length === 0 ? (
              <Flex direction="column" align="center" gap="8" className="py-40">
                <div className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-8 ring-1 ring-white/10">
                  <FileText size={48} className="text-gray-600" />
                </div>
                <div className="space-y-3 text-center">
                  <Text size="6" weight="bold" className="block text-white">
                    No posts yet
                  </Text>
                  <Text size="3" className="block text-gray-500">
                    Create your first post to get started
                  </Text>
                </div>
                <Link to="/admin/posts/new" style={{ textDecoration: 'none' }}>
                  <Button
                    size="4"
                    className="mt-2 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 px-8 py-4 font-bold text-black shadow-lg shadow-amber-500/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/50"
                  >
                    <PlusCircle size={20} />
                    Create your first post
                  </Button>
                </Link>
              </Flex>
            ) : (
              <div className="overflow-x-auto">
                <Table.Root>
                  <Table.Header>
                    <Table.Row className="border-b border-white/5">
                      <Table.ColumnHeaderCell className="py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Title
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Status
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Views
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Likes
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Date
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Actions
                      </Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {posts.slice(0, 10).map((post, index) => (
                      <Table.Row
                        key={post.id}
                        className="group border-b border-white/5 transition-colors hover:bg-white/5"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
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
                            {formatDate(post.publishedAt || post.createdAt)}
                          </Text>
                        </Table.Cell>
                        <Table.Cell className="py-5">
                          <Flex gap="2">
                            <Button
                              size="2"
                              variant="soft"
                              className="transition-all hover:scale-105"
                              onClick={() => navigate({ to: '/posts/$id', params: { id: post.id } })}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              size="2"
                              variant="soft"
                              color="blue"
                              className="transition-all hover:scale-105"
                              onClick={() =>
                                navigate({ to: '/admin/posts/$id/edit', params: { id: post.id } })
                              }
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              size="2"
                              variant="soft"
                              color="red"
                              className="transition-all hover:scale-105"
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
