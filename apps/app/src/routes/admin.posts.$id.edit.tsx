import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Container, Flex, Card, Text } from '@radix-ui/themes';
import { toast } from 'sonner';
import { api } from '../lib/api-client';
import { authClient } from '../lib/auth';
import { ChromelessPostEditor } from '../components/chromeless-post-editor';
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
  const hasUnsavedChanges = useRef(false);

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
      hasUnsavedChanges.current = false;
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
      hasUnsavedChanges.current = false;
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

    hasUnsavedChanges.current = true;

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
    }, 3000); // Auto-save after 3 seconds of inactivity
  }, [title, content, coverImage, status, version, initialized, autoSaveMutation]);

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

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handlePublish = useCallback(() => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }

    // Cancel auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    updatePostMutation.mutate({
      title,
      content,
      coverImage: coverImage || undefined,
      status: 'published',
      version,
    });
  }, [title, content, coverImage, version, updatePostMutation]);

  const handleSaveDraft = useCallback(() => {
    if (!title.trim() && !content.trim()) {
      toast.error('Post is empty');
      return;
    }

    // Cancel auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    updatePostMutation.mutate({
      title: title.trim() || 'Untitled',
      content,
      coverImage: coverImage || undefined,
      status: 'draft',
      version,
    });
  }, [title, content, coverImage, version, updatePostMutation]);

  const handleExit = useCallback(() => {
    if (hasUnsavedChanges.current) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate({ to: '/admin/posts' });
      }
    } else {
      navigate({ to: '/admin/posts' });
    }
  }, [navigate]);

  if (isLoading || !initialized) {
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
            </Flex>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <ChromelessPostEditor
      title={title}
      content={content}
      coverImage={coverImage}
      status={status}
      onTitleChange={setTitle}
      onContentChange={setContent}
      onCoverImageChange={setCoverImage}
      onStatusChange={setStatus}
      onPublish={handlePublish}
      onSaveDraft={handleSaveDraft}
      onExit={handleExit}
      isPublishing={updatePostMutation.isPending}
      isSaving={isSaving}
      lastSaved={lastSaved}
      isNewPost={false}
    />
  );
}
