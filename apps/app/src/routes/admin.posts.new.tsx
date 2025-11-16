import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../lib/api-client';
import { authClient } from '../lib/auth';
import { ChromelessPostEditor } from '../components/chromeless-post-editor';
import { useAutosave } from '../hooks/use-autosave';
import { DraftManager, type DraftData } from '../lib/draft-manager';
import type { CreatePostInput, UpdatePostInput, PostResponse } from '@robin/types';

export const Route = createFileRoute('/admin/posts/new')({
  component: NewPostPage,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: '/auth' });
    }
  },
});

function NewPostPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // Track created post ID - this is the key to preventing duplicates!
  const [createdPostId, setCreatedPostId] = useState<string | null>(null);
  const [version, setVersion] = useState(1);

  // Use ref for immediate access to createdPostId (prevents race condition)
  const createdPostIdRef = useRef<string | null>(null);

  // Generate stable storage key for this editing session
  const storageKeyRef = useRef(DraftManager.generateTempKey());
  const hasLoadedDraftRef = useRef(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    if (hasLoadedDraftRef.current) return;
    hasLoadedDraftRef.current = true;

    const draft = DraftManager.load(storageKeyRef.current);
    if (draft) {
      const shouldRestore = window.confirm(
        'Found unsaved changes from a previous session. Do you want to restore them?'
      );

      if (shouldRestore) {
        setTitle(draft.title);
        setContent(draft.content);
        setCoverImage(draft.coverImage || '');
        setStatus(draft.status);
        if (draft.postId) {
          setCreatedPostId(draft.postId);
          createdPostIdRef.current = draft.postId;
          setVersion(draft.version);
        }
        toast.success('Draft restored from local storage');
      } else {
        DraftManager.remove(storageKeyRef.current);
      }
    }
  }, []);

  // Autosave logic with proper create/update flow
  const autosave = useAutosave<CreatePostInput | UpdatePostInput, PostResponse>(
    async (data) => {
      // Use ref for immediate check (prevents race condition during navigation)
      // If we already created a post, UPDATE it (PATCH)
      if (createdPostIdRef.current) {
        return api.patch<PostResponse>(`/posts/${createdPostIdRef.current}`, {
          ...data,
          version, // Include version for optimistic locking
        } as UpdatePostInput);
      }

      // Otherwise, CREATE new post (POST) - only happens ONCE
      return api.post<PostResponse>('/posts', data as CreatePostInput);
    },
    {
      storageKey: storageKeyRef.current,
      debounceMs: 3000,
      maxRetries: 3,
      onSaveSuccess: (response) => {
        const post = response.post;

        // First time creating? Store the ID and navigate to edit page
        if (!createdPostIdRef.current && post.id) {
          // Update ref immediately (prevents race condition)
          createdPostIdRef.current = post.id;
          setCreatedPostId(post.id);
          setVersion(post.version);

          // Update storage key to use real post ID (before navigation)
          const newKey = `post_${post.id}`;
          DraftManager.remove(storageKeyRef.current);
          storageKeyRef.current = newKey;

          // Navigate to edit page with the new post ID
          // Use replace to avoid back button issues
          navigate({
            to: `/admin/posts/${post.id}/edit`,
            replace: true,
          });

          toast.success('Draft created! Now editing...');
        } else {
          // Subsequent saves - update version from server
          setVersion(post.version);
        }

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      },
      onSaveError: (error) => {
        console.error('Autosave failed:', error);
        // Error handling is in the hook (retries, toasts, etc.)
      },
    }
  );

  // Trigger autosave when content changes
  useEffect(() => {
    // Don't autosave if both title and content are empty
    if (!title.trim() && !content.trim()) {
      return;
    }

    const draftData: DraftData = {
      title,
      content,
      coverImage: coverImage || undefined,
      status: 'draft' as const, // Always draft for autosave
      version,
      postId: createdPostId || undefined,
      lastModified: Date.now(),
    };

    autosave.scheduleAutosave(
      {
        title: title.trim() || 'Untitled',
        content,
        coverImage: coverImage || undefined,
        status: 'draft' as const,
      },
      draftData
    );
     
    // Intentionally exclude: autosave (stable ref), version (don't autosave on version sync), initialized
  }, [title, content, coverImage]);

  // Create/Update mutation for manual saves (Publish / Save Draft)
  const saveMutation = useMutation({
    mutationFn: async (data: (CreatePostInput | UpdatePostInput) & { publish?: boolean }) => {
      const saveData = {
        title: data.title,
        content: data.content,
        coverImage: data.coverImage,
        status: data.publish ? 'published' : 'draft',
      } as CreatePostInput;

      // Use ref for immediate check
      if (createdPostIdRef.current) {
        return api.patch<PostResponse>(`/posts/${createdPostIdRef.current}`, {
          ...saveData,
          version,
        } as UpdatePostInput);
      }

      return api.post<PostResponse>('/posts', saveData);
    },
    onSuccess: (response, variables) => {
      autosave.removeDraft(); // Clear localStorage
      autosave.cancelSave(); // Cancel pending autosave

      const isPublish = 'publish' in variables && variables.publish;
      toast.success(isPublish ? 'Post published successfully!' : 'Draft saved!');

      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate({ to: '/admin/posts' });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save post');
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

    saveMutation.mutate({
      title,
      content,
      coverImage: coverImage || undefined,
      publish: true,
    });
  }, [title, content, coverImage, saveMutation]);

  const handleSaveDraft = useCallback(() => {
    if (!title.trim() && !content.trim()) {
      toast.error('Post is empty');
      return;
    }

    saveMutation.mutate({
      title: title.trim() || 'Untitled',
      content,
      coverImage: coverImage || undefined,
      publish: false,
    });
  }, [title, content, coverImage, saveMutation]);

  const handleExit = useCallback(() => {
    if (autosave.hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        autosave.removeDraft();
        navigate({ to: '/admin/posts' });
      }
    } else {
      autosave.removeDraft();
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
      isPublishing={saveMutation.isPending}
      isSaving={autosave.isSaving}
      lastSaved={autosave.lastSaved}
      isNewPost={true}
    />
  );
}
