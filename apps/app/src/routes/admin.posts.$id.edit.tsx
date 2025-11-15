import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Container, Heading, Flex, Button, Card, TextField, Box, Select, Text } from '@radix-ui/themes';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api-client';
import { authClient } from '../lib/auth';
import { AdvancedEditor, FileUpload } from '../components';
import type { UpdatePostInput, PostResponse } from '@robin/types';

export const Route = createFileRoute('/admin/posts/$id/edit')({
  component: EditPostPage,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: '/auth' });
    }
  },
});

function EditPostPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch existing post
  const { data, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => api.get<PostResponse>(`/api/posts/${id}`),
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [version, setVersion] = useState(1);
  const [initialized, setInitialized] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Set form values when data loads (only once)
  useEffect(() => {
    if (data?.post && !initialized) {
      setTitle(data.post.title);
      setContent(data.post.content);
      setCoverImage(data.post.coverImage || '');
      setStatus(data.post.status);
      setVersion(data.post.version);
      setInitialized(true);
    }
  }, [data, initialized]);

  const updatePostMutation = useMutation({
    mutationFn: async (updateData: UpdatePostInput) => {
      return api.patch<PostResponse>(`/api/posts/${id}`, updateData);
    },
    onSuccess: () => {
      toast.success('Post updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      navigate({ to: '/admin/posts' });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update post');
    },
  });

  // Auto-save mutation (silent, doesn't navigate)
  const autoSaveMutation = useMutation({
    mutationFn: async (updateData: UpdatePostInput) => {
      return api.patch<PostResponse>(`/api/posts/${id}`, updateData);
    },
    onSuccess: () => {
      setLastSaved(new Date());
      setIsSaving(false);
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
    onError: (error: Error) => {
      setIsSaving(false);
      console.error('Auto-save failed:', error);
    },
  });

  // Auto-save debounced function
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      if (title.trim() && content.trim() && initialized) {
        setIsSaving(true);
        autoSaveMutation.mutate({
          title,
          content,
          coverImage: coverImage || undefined,
          status,
          version,
        });
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, [title, content, coverImage, status, version, initialized]);

  // Trigger auto-save when content changes
  useEffect(() => {
    if (initialized) {
      scheduleAutoSave();
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, content, coverImage, status, scheduleAutoSave, initialized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }

    updatePostMutation.mutate({
      title,
      content,
      coverImage: coverImage || undefined,
      status,
      version,
    });
  };

  if (isLoading) {
    return (
      <Box style={{ minHeight: '100vh', background: 'var(--gray-2)', paddingTop: '100px' }}>
        <Container size="3" py="6">
          <Card>
            <Flex align="center" justify="center" py="9">
              <Text>Loading...</Text>
            </Flex>
          </Card>
        </Container>
      </Box>
    );
  }

  if (!data?.post) {
    return (
      <Box style={{ minHeight: '100vh', background: 'var(--gray-2)', paddingTop: '100px' }}>
        <Container size="3" py="6">
          <Card>
            <Flex direction="column" align="center" gap="4" py="9">
              <Text size="5">Post not found</Text>
              <Button onClick={() => navigate({ to: '/admin/posts' })}>
                <ArrowLeft size={16} />
                Back to Posts
              </Button>
            </Flex>
          </Card>
        </Container>
      </Box>
    );
  }

  // Wait for initialization to complete before rendering form
  if (!initialized) {
    return (
      <Box style={{ minHeight: '100vh', background: 'var(--gray-2)', paddingTop: '100px' }}>
        <Container size="3" py="6">
          <Card>
            <Flex align="center" justify="center" py="9">
              <Text>Loading...</Text>
            </Flex>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box style={{ minHeight: '100vh', background: 'var(--gray-2)', paddingTop: '100px' }}>
      <Container size="4" py="6">
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="6">
            {/* Header */}
            <Flex justify="between" align="center">
              <Heading size="8">Edit Post</Heading>
              <Flex gap="2">
                <Button type="button" variant="soft" onClick={() => navigate({ to: '/admin/posts' })}>
                  <ArrowLeft size={16} />
                  Back
                </Button>
                <Button type="submit" disabled={updatePostMutation.isPending}>
                  <Save size={16} />
                  {updatePostMutation.isPending ? 'Publishing...' : 'Publish'}
                </Button>
              </Flex>
            </Flex>

            {/* Metadata Card */}
            <Card>
              <Flex direction="column" gap="4" p="4">
                <Flex gap="4" wrap="wrap">
                  {/* Cover Image */}
                  <Box style={{ flex: '1', minWidth: '200px' }}>
                    <Text size="2" weight="bold" mb="2" as="label">
                      Cover Image
                    </Text>
                    <FileUpload value={coverImage} onChange={setCoverImage} />
                  </Box>

                  {/* Status */}
                  <Box style={{ minWidth: '150px' }}>
                    <Text size="2" weight="bold" mb="2" as="label">
                      Status
                    </Text>
                    <Select.Root value={status} onValueChange={(v) => setStatus(v as 'draft' | 'published')}>
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value="draft">Draft</Select.Item>
                        <Select.Item value="published">Published</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>
                </Flex>

                {/* Title */}
                <Box>
                  <Text size="2" weight="bold" mb="2" as="label">
                    Title
                  </Text>
                  <TextField.Root
                    size="3"
                    placeholder="Enter post title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={{ fontSize: '1.5rem', fontWeight: '600' }}
                  />
                </Box>
              </Flex>
            </Card>

            {/* Editor */}
            <AdvancedEditor
              value={content}
              onChange={setContent}
              placeholder="Write your post content here... Press '/' for commands"
            />
          </Flex>
        </form>
      </Container>
    </Box>
  );
}
