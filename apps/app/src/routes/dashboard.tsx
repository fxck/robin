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

function StatCard({ title, value, icon }: Omit<StatCardProps, 'gradient'>) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="opacity-60">{icon}</div>
        <div className="text-admin-stat-label" style={{ color: 'var(--color-text-tertiary)' }}>
          {title}
        </div>
      </div>
      <div className="text-admin-stat-value text-white">
        {value.toLocaleString()}
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
    <div className="min-h-screen" style={{ background: 'var(--color-bg-base)' }}>
      <div className="max-w-[1800px] mx-auto px-8 py-16 pt-32 md:pt-40">
        {/* Header */}
        <div className="mb-20">
          <Flex justify="between" align="start" className="flex-col md:flex-row gap-8">
            <div className="space-y-4">
              <h1 className="text-admin-page-title text-white">
                Dashboard
              </h1>
              <div className="text-admin-page-subtitle" style={{ color: 'var(--color-text-tertiary)' }}>
                Welcome back, {session?.user?.name || session?.user?.email}
              </div>
            </div>
            <Link to="/admin/posts/new" style={{ textDecoration: 'none' }}>
              <Button size="3" className="bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold shadow-accent hover:shadow-accent-hover">
                <PlusCircle size={18} />
                New Post
              </Button>
            </Link>
          </Flex>
        </div>

        {/* Banners */}
        {(showSuccessBanner || showVerificationBanner) && (
          <div className="mb-16">
            {showSuccessBanner && (
              <div className="glass-surface p-5 rounded-xl border border-green-500/30 bg-green-500/10 mb-4">
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

            {showVerificationBanner && (
              <div className="glass-surface p-5 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
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
          </div>
        )}

        {/* MAIN LAYOUT: Table + Sidebar Stats */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-12">
          {/* LEFT: Posts Table (PRIMARY) */}
          <div>
            <div className="glass-surface rounded-2xl overflow-hidden">
              <Flex direction="column">
                <Flex justify="between" align="center" className="px-12 py-8 border-b border-white/10">
                  <div className="text-admin-section-title text-white">
                    Your Posts
                  </div>
                  <Link to="/admin/posts" style={{ textDecoration: 'none' }}>
                    <Button variant="ghost" size="2" className="text-amber-400 hover:text-amber-300 transition-colors">
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
              <Flex direction="column" align="center" gap="6" className="py-32">
                <div className="p-4 bg-white/5 rounded-full">
                  <FileText size={32} className="text-gray-500" />
                </div>
                <div className="text-center">
                  <Text size="5" weight="bold" className="block mb-2 text-white">
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
                <Table.Root variant="surface">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell className="admin-table-header-cell" style={{ width: '45%' }}>
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
                      <Table.ColumnHeaderCell className="admin-table-header-cell" style={{ width: '10%' }}>
                        <div className="text-admin-table-header" style={{ color: 'var(--color-text-tertiary)' }}>Actions</div>
                      </Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {posts.slice(0, 10).map((post) => (
                      <Table.Row key={post.id} className="admin-table-row hover:bg-white/[0.08] transition-colors duration-150">
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
                            {formatDate(post.publishedAt || post.createdAt)}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="admin-table-cell">
                          <Flex gap="2">
                            <Button
                              size="2"
                              variant="soft"
                              onClick={() => navigate({ to: '/posts/$id', params: { id: post.id } })}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              size="2"
                              variant="soft"
                              color="blue"
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
        </div>

        {/* RIGHT: Stats Sidebar (SECONDARY) */}
        <div className="space-y-8">
          <div className="glass-surface rounded-2xl p-10">
            <div className="space-y-8">
              <div className="text-admin-section-title text-white mb-8">
                Overview
              </div>

              <StatCard
                title="Published Posts"
                value={publishedPosts.length}
                icon={<FileText className="h-5 w-5 text-amber-400" />}
              />

              <div className="border-t border-white/10 pt-8">
                <StatCard
                  title="Draft Posts"
                  value={draftPosts.length}
                  icon={<Clock className="h-5 w-5 text-blue-400" />}
                />
              </div>

              <div className="border-t border-white/10 pt-8">
                <StatCard
                  title="Total Views"
                  value={totalViews}
                  icon={<Eye className="h-5 w-5 text-green-400" />}
                />
              </div>

              <div className="border-t border-white/10 pt-8">
                <StatCard
                  title="Total Likes"
                  value={totalLikes}
                  icon={<Heart className="h-5 w-5 text-pink-400" />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
