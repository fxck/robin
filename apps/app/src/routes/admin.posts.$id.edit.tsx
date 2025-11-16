import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Container, Flex, Card, Text } from '@radix-ui/themes';
import { toast } from 'sonner';
import { api } from '../lib/api-client';
import { authClient } from '../lib/auth';
import { ChromelessPostEditor } from '../components/chromeless-post-editor';
import { useAutosave } from '../hooks/use-autosave';
import { DraftManager } from '../lib/draft-manager';
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
  const { data, isLoading, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () => api.get<PostResponse>(`/posts/${id}`),
    refetchOnMount: 'always', // Always get fresh data
    staleTime: 0, // Consider data immediately stale
  });

  // State - controlled by local edits
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [version, setVersion] = useState(1);

  // Track initialization to prevent overwriting user edits
  const [initialized, setInitialized] = useState(false);
  const storageKey = `post_${id}`;
  const hasCheckedDraftRef = useRef(false);

  // Initialize form from server data OR localStorage draft
  useEffect(() => {
    if (!data?.post || initialized) return;

    // Check for newer draft in localStorage
    if (!hasCheckedDraftRef.current) {
      hasCheckedDraftRef.current = true;

      const localDraft = DraftManager.load(storageKey);
      const serverTimestamp = new Date(data.post.updatedAt).getTime();

      if (localDraft && DraftManager.hasNewerDraft(storageKey, serverTimestamp)) {
        const shouldRestore = window.confirm(
          'Found local changes that are newer than the server version. Do you want to restore them?'
        );

        if (shouldRestore) {
          setTitle(localDraft.title);
          setContent(localDraft.content);
          setCoverImage(localDraft.coverImage || '');
          setStatus(localDraft.status);
          setVersion(localDraft.version);
          setInitialized(true);
          toast.success('Local draft restored');
          return;
        } else {
          DraftManager.remove(storageKey);
        }
      }
    }

    // Initialize from server data
    setTitle(data.post.title);
    setContent(data.post.content);
    setCoverImage(data.post.coverImage || '');
    setStatus(data.post.status);
    setVersion(data.post.version);
    setInitialized(true);
  }, [data, initialized, storageKey]);

  // CRITICAL: Sync version from server after each save
  // This prevents 409 conflicts on subsequent autosaves
  useEffect(() => {
    if (data?.post && initialized) {
      // Only update version if it's newer (server incremented it)
      if (data.post.version > version) {
        console.log(`Syncing version: ${version} → ${data.post.version}`);
        setVersion(data.post.version);
      }
    }
  }, [data?.post?.version, initialized]);

  // Autosave with proper version tracking
  const autosave = useAutosave<UpdatePostInput, PostResponse>(
    async (updateData) => {
      return api.patch<PostResponse>(`/posts/${id}`, {
        ...updateData,
        version, // Use current version for optimistic locking
      });
    },
    {
      storageKey,
      debounceMs: 3000,
      maxRetries: 3,
      onSaveSuccess: (response) => {
        const post = response.post;

        // Update version from server response immediately
        // This is crucial to prevent 409 on next save
        setVersion(post.version);

        // Smart cache update - don't refetch, just update the cache
        queryClient.setQueryData(['post', id], response);

        // Invalidate lists (but not the current post)
        queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
        queryClient.invalidateQueries({ queryKey: ['posts'], exact: false });
      },
      onSaveError: (error) => {
        if (error.message?.includes('409')) {
          // Version conflict - refetch to get latest version
          queryClient.invalidateQueries({ queryKey: ['post', id] });
          toast.error('Content was updated elsewhere. Please review the changes.');
        }
      },
    }
  );

  // Trigger autosave when content changes
  useEffect(() => {
    if (!initialized) return;
    if (!title.trim() && !content.trim()) return;

    const draftData = {
      title,
      content,
      coverImage: coverImage || undefined,
      status,
      version,
      postId: id,
      lastModified: Date.now(),
    };

    autosave.scheduleAutosave(
      {
        title,
        content,
        coverImage: coverImage || undefined,
        status,
        version,
      },
      draftData
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Intentionally exclude: autosave (stable ref), version (included in data, not trigger)
  }, [title, content, coverImage, status, initialized]);

  // Manual update mutation (Publish / Save Draft)
  const updatePostMutation = useMutation({
    mutationFn: async (updateData: UpdatePostInput & { finalStatus?: 'draft' | 'published' }) => {
      return api.patch<PostResponse>(`/posts/${id}`, {
        title: updateData.title,
        content: updateData.content,
        coverImage: updateData.coverImage,
        status: updateData.finalStatus || updateData.status,
        version: updateData.version,
      });
    },
    onSuccess: (response, variables) => {
      autosave.removeDraft(); // Clear localStorage
      autosave.cancelSave(); // Cancel pending autosave

      const isPublish = variables.finalStatus === 'published';
      toast.success(isPublish ? 'Post published successfully!' : 'Post updated successfully!');

      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      navigate({ to: '/admin/posts' });
    },
    onError: (error: Error) => {
      if (error.message?.includes('409')) {
        toast.error('Post was modified elsewhere. Please refresh and try again.');
        queryClient.invalidateQueries({ queryKey: ['post', id] });
      } else {
        toast.error(error.message || 'Failed to update post');
      }
    },
  });

  const handlePublish = useCallback(() => {
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
      finalStatus: 'published',
    });
  }, [title, content, coverImage, status, version, updatePostMutation]);

  const handleSaveDraft = useCallback(() => {
    if (!title.trim() && !content.trim()) {
      toast.error('Post is empty');
      return;
    }

    updatePostMutation.mutate({
      title: title.trim() || 'Untitled',
      content,
      coverImage: coverImage || undefined,
      status,
      version,
      finalStatus: 'draft',
    });
  }, [title, content, coverImage, status, version, updatePostMutation]);

  const handleExit = useCallback(() => {
    if (autosave.hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate({ to: '/admin/posts' });
      }
    } else {
      navigate({ to: '/admin/posts' });
    }
  }, [autosave.hasUnsavedChanges, navigate]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (autosave.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [autosave.hasUnsavedChanges]);

  // Loading state
  if (isLoading || !initialized) {
    return (
      <Box style={{ minHeight: '100vh', background: 'var(--gray-2)', paddingTop: '100px' }}>
        <Container size="3" py="6">
          <Card>
            <Flex align="center" justify="center" py="9">
              <Text>Loading post...</Text>
            </Flex>
          </Card>
        </Container>
      </Box>
    );
  }

  // Error state
  if (error || !data?.post) {
    return (
      <Box style={{ minHeight: '100vh', background: 'var(--gray-2)', paddingTop: '100px' }}>
        <Container size="3" py="6">
          <Card>
            <Flex direction="column" align="center" gap="4" py="9">
              <Text size="5" color="red">
                {error ? 'Failed to load post' : 'Post not found'}
              </Text>
              <Text size="2" color="gray">
                {error instanceof Error ? error.message : 'The post may have been deleted.'}
              </Text>
            </Flex>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <ChromelessPostEditor
      key={id} // Force remount when editing different post
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
      isSaving={autosave.isSaving}
      lastSaved={autosave.lastSaved}
      isNewPost={false}
    />
  );
}
