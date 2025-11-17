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
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<DraftData | null>(null);

  // Track created post ID - this is the key to preventing duplicates!
  const [createdPostId, setCreatedPostId] = useState<string | null>(null);
  const [version, setVersion] = useState(1);

  // Use ref for immediate access to createdPostId (prevents race condition)
  const createdPostIdRef = useRef<string | null>(null);

  // Generate stable storage key for this editing session
  const storageKeyRef = useRef(DraftManager.generateTempKey());
  const hasLoadedDraftRef = useRef(false);

  // Load draft from localStorage on mount (non-blocking)
  useEffect(() => {
    if (hasLoadedDraftRef.current) return;
    hasLoadedDraftRef.current = true;

    const draft = DraftManager.load(storageKeyRef.current);
    if (draft) {
      // Non-blocking: Show banner instead of modal
      setPendingDraft(draft);
      setShowDraftBanner(true);
    }
  }, []);

  // Handler for restoring draft from banner
  const handleRestoreDraft = useCallback(() => {
    if (pendingDraft) {
      setTitle(pendingDraft.title);
      setContent(pendingDraft.content);
      setCoverImage(pendingDraft.coverImage || '');
      setStatus(pendingDraft.status);
      if (pendingDraft.postId) {
        setCreatedPostId(pendingDraft.postId);
        createdPostIdRef.current = pendingDraft.postId;
        setVersion(pendingDraft.version);
      }
      setShowDraftBanner(false);
      setPendingDraft(null);
    }
  }, [pendingDraft]);

  // Handler for dismissing draft banner
  const handleDismissDraft = useCallback(() => {
    if (pendingDraft) {
      DraftManager.remove(storageKeyRef.current);
      setShowDraftBanner(false);
      setPendingDraft(null);
    }
  }, [pendingDraft]);

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

        // First time creating? Store the ID but STAY on current page
        if (!createdPostIdRef.current && post.id) {
          // Update ref immediately (prevents race condition)
          createdPostIdRef.current = post.id;
          setCreatedPostId(post.id);
          setVersion(post.version);

          // Update storage key to use real post ID
          const newKey = `post_${post.id}`;
          // Save current state to new key before removing old key
          DraftManager.save(newKey, {
            title,
            content,
            coverImage: coverImage || undefined,
            status: 'draft',
            version: post.version,
            postId: post.id,
            lastModified: Date.now(),
          });
          DraftManager.remove(storageKeyRef.current);
          storageKeyRef.current = newKey;

          // NO navigation - keep user in flow
          // NO toast spam - autosave should be silent
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

    // Cancel pending autosave to prevent double save
    autosave.cancelSave();

    saveMutation.mutate({
      title,
      content,
      coverImage: coverImage || undefined,
      publish: true,
    });
  }, [title, content, coverImage, saveMutation, autosave]);

  const handleSaveDraft = useCallback(() => {
    if (!title.trim() && !content.trim()) {
      toast.error('Post is empty');
      return;
    }

    // Cancel pending autosave to prevent double save
    autosave.cancelSave();

    saveMutation.mutate({
      title: title.trim() || 'Untitled',
      content,
      coverImage: coverImage || undefined,
      publish: false,
    });
  }, [title, content, coverImage, saveMutation, autosave]);

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

  return (
    <>
      {/* Non-blocking draft restore banner */}
      {showDraftBanner && pendingDraft && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 backdrop-blur-xl shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-400 mb-1">
                  Unsaved draft found
                </h3>
                <p className="text-xs text-gray-400">
                  Continue where you left off or start fresh
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
        isPending={autosave.isPending}
        lastSaved={autosave.lastSaved}
        isNewPost={true}
      />
    </>
  );
}
