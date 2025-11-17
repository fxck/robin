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
    refetchOnMount: 'always', // Always get fresh data on mount
    staleTime: Infinity, // Don't auto-refetch during editing - we update cache manually
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // State - controlled by local edits
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [version, setVersion] = useState(1);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<any>(null);

  // Track initialization to prevent overwriting user edits
  const [initialized, setInitialized] = useState(false);
  const storageKey = `post_${id}`;
  const hasCheckedDraftRef = useRef(false);

  // Use ref for version to avoid stale closure issues
  const versionRef = useRef(version);
  useEffect(() => {
    versionRef.current = version;
  }, [version]);

  // Initialize form from server data OR localStorage draft (non-blocking)
  useEffect(() => {
    if (!data?.post || initialized) return;

    // Check for newer draft in localStorage
    if (!hasCheckedDraftRef.current) {
      hasCheckedDraftRef.current = true;

      const localDraft = DraftManager.load(storageKey);
      const serverTimestamp = new Date(data.post.updatedAt).getTime();

      if (localDraft && DraftManager.hasNewerDraft(storageKey, serverTimestamp)) {
        // Non-blocking: Show banner instead of modal
        setPendingDraft(localDraft);
        setShowDraftBanner(true);
        // Still initialize with server data so user can continue
        setTitle(data.post.title);
        setContent(data.post.content);
        setCoverImage(data.post.coverImage || '');
        setStatus(data.post.status);
        setVersion(data.post.version);
        setInitialized(true);
        return;
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

  // Handler for restoring draft from banner
  const handleRestoreDraft = useCallback(() => {
    if (pendingDraft && data?.post) {
      setTitle(pendingDraft.title);
      setContent(pendingDraft.content);
      setCoverImage(pendingDraft.coverImage || '');
      setStatus(pendingDraft.status);
      // CRITICAL: Always use server version, not draft version
      // Draft version might be stale if post was updated elsewhere
      setVersion(data.post.version);
      console.log('[Edit] Restored draft with server version:', data.post.version, '(draft had version:', pendingDraft.version, ')');
      setShowDraftBanner(false);
      setPendingDraft(null);
    }
  }, [pendingDraft, data]);

  // Handler for dismissing draft banner
  const handleDismissDraft = useCallback(() => {
    DraftManager.remove(storageKey);
    setShowDraftBanner(false);
    setPendingDraft(null);
  }, [storageKey]);

  // Version is now updated directly in autosave onSaveSuccess callback
  // No need for this effect - it was causing extra renders

  // Autosave with proper version tracking
  const autosave = useAutosave<UpdatePostInput, PostResponse>(
    async (updateData) => {
      console.log('[Edit Autosave] Sending PATCH with version:', versionRef.current);
      return api.patch<PostResponse>(`/posts/${id}`, {
        ...updateData,
        version: versionRef.current, // Use ref to get latest version
      });
    },
    {
      storageKey,
      debounceMs: 3000,
      maxRetries: 3,
      onSaveSuccess: (response) => {
        const post = response.post;

        console.log('[Edit Autosave] Save success, updating version from', versionRef.current, 'to', post.version);

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
        console.error('[Edit Autosave] Save error:', error);
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

    console.log('[Edit Autosave] Title:', title);
    console.log('[Edit Autosave] Content:', content);
    console.log('[Edit Autosave] Content length:', content?.length || 0);

    const draftData = {
      title,
      content,
      coverImage: coverImage || undefined,
      status,
      version: versionRef.current, // Use ref to get latest version
      postId: id,
      lastModified: Date.now(),
    };

    autosave.scheduleAutosave(
      {
        title,
        content,
        coverImage: coverImage || undefined,
        status,
        version: versionRef.current, // Use ref for consistency
      },
      draftData
    );
     
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

    // Cancel pending autosave to prevent double save
    autosave.cancelSave();

    updatePostMutation.mutate({
      title,
      content,
      coverImage: coverImage || undefined,
      status,
      version,
      finalStatus: 'published',
    });
  }, [title, content, coverImage, status, version, updatePostMutation, autosave]);

  const handleSaveDraft = useCallback(() => {
    if (!title.trim() && !content.trim()) {
      toast.error('Post is empty');
      return;
    }

    // Cancel pending autosave to prevent double save
    autosave.cancelSave();

    updatePostMutation.mutate({
      title: title.trim() || 'Untitled',
      content,
      coverImage: coverImage || undefined,
      status,
      version,
      finalStatus: 'draft',
    });
  }, [title, content, coverImage, status, version, updatePostMutation, autosave]);

  const handleExit = useCallback(() => {
    if (autosave.hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate({ to: '/admin/posts' });
      }
    } else {
      navigate({ to: '/admin/posts' });
    }
  }, [autosave.hasUnsavedChanges, navigate]);

  // Warn before leaving ONLY if no local backup exists
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only warn if changes aren't backed up to localStorage
      if (autosave.hasUnsavedChanges && !autosave.hasLocalBackup) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [autosave.hasUnsavedChanges, autosave.hasLocalBackup]);

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
    <>
      {/* Non-blocking draft restore banner */}
      {showDraftBanner && pendingDraft && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 backdrop-blur-xl shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-400 mb-1">
                  Newer local changes found
                </h3>
                <p className="text-xs text-gray-400">
                  You have unsaved changes that are newer than the server version
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRestoreDraft}
                  className="px-3 py-1.5 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors"
                >
                  Restore
                </button>
                <button
                  onClick={handleDismissDraft}
                  className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        isPending={autosave.isPending}
        lastSaved={autosave.lastSaved}
        isNewPost={false}
      />
    </>
  );
}
