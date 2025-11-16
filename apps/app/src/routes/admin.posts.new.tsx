import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../lib/api-client';
import { authClient } from '../lib/auth';
import { ChromelessPostEditor } from '../components/chromeless-post-editor';
import type { CreatePostInput, PostResponse } from '@robin/types';

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

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasUnsavedChanges = useRef(false);

  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostInput) => {
      return api.post<PostResponse>('/api/posts', data);
    },
    onSuccess: (data) => {
      hasUnsavedChanges.current = false;
      toast.success('Post created successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate({ to: `/admin/posts` });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create post');
    },
  });

  // Auto-save mutation (silent)
  const autoSaveMutation = useMutation({
    mutationFn: async (data: CreatePostInput) => {
      return api.post<PostResponse>('/api/posts', data);
    },
    onSuccess: () => {
      setLastSaved(new Date());
      setIsSaving(false);
      hasUnsavedChanges.current = false;
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
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
      if (title.trim() || content.trim()) {
        setIsSaving(true);
        autoSaveMutation.mutate({
          title: title.trim() || 'Untitled',
          content,
          coverImage: coverImage || undefined,
          status: 'draft', // Always save as draft for auto-save
        });
      }
    }, 3000); // Auto-save after 3 seconds of inactivity
  }, [title, content, coverImage]);

  // Trigger auto-save when content changes
  useEffect(() => {
    scheduleAutoSave();

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, content, coverImage, scheduleAutoSave]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
        e.returnValue = '';
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

    createPostMutation.mutate({
      title,
      content,
      coverImage: coverImage || undefined,
      status: 'published',
    });
  }, [title, content, coverImage, createPostMutation]);

  const handleSaveDraft = useCallback(() => {
    if (!title.trim() && !content.trim()) {
      toast.error('Post is empty');
      return;
    }

    // Cancel auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    createPostMutation.mutate({
      title: title.trim() || 'Untitled',
      content,
      coverImage: coverImage || undefined,
      status: 'draft',
    });
  }, [title, content, coverImage, createPostMutation]);

  const handleExit = useCallback(() => {
    if (hasUnsavedChanges.current) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate({ to: '/admin/posts' });
      }
    } else {
      navigate({ to: '/admin/posts' });
    }
  }, [navigate]);

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
      isPublishing={createPostMutation.isPending}
      isSaving={isSaving}
      lastSaved={lastSaved}
      isNewPost={true}
    />
  );
}
