/**
 * Autosave Hook - Centralized autosave logic with:
 * - Debouncing
 * - Conflict resolution
 * - Retry with exponential backoff
 * - localStorage backup
 * - Optimistic updates
 *
 * @example
 * ```tsx
 * const autosave = useAutosave(
 *   (data) => api.patch(`/posts/${id}`, data),
 *   {
 *     storageKey: `post_${id}`,
 *     debounceMs: 3000,
 *     maxRetries: 3,
 *     onSaveSuccess: (response) => setVersion(response.post.version),
 *     onSaveError: (error) => console.error('Save failed:', error),
 *   }
 * );
 *
 * // Schedule autosave with local backup
 * autosave.scheduleAutosave(serverData, localDraftData);
 *
 * // Force immediate save
 * autosave.saveNow(data);
 *
 * // Access state
 * const { isSaving, lastSaved, hasUnsavedChanges, error } = autosave;
 * ```
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DraftManager } from '../lib/draft-manager';
import type { DraftData } from '../lib/draft-manager';

interface AutosaveOptions {
  debounceMs?: number;
  maxRetries?: number;
  onSaveSuccess?: (data: any) => void;
  onSaveError?: (error: Error) => void;
  storageKey: string;
}

interface AutosaveState {
  isSaving: boolean;
  isPending: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  hasLocalBackup: boolean;
  error: Error | null;
  retryCount: number;
}

/**
 * Autosave hook with debouncing, retry, and localStorage backup
 *
 * @param saveFn - Function to save data to server
 * @param options - Configuration options
 * @returns Autosave state and control functions
 */
export function useAutosave<TData = any, TResponse = any>(
  saveFn: (data: TData) => Promise<TResponse>,
  options: AutosaveOptions
) {
  const {
    debounceMs = 3000,
    maxRetries = 3,
    onSaveSuccess,
    onSaveError,
    storageKey,
  } = options;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const localStorageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestDataRef = useRef<TData | null>(null);
  const [state, setState] = useState<AutosaveState>({
    isSaving: false,
    isPending: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    hasLocalBackup: false,
    error: null,
    retryCount: 0,
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: saveFn,
    onMutate: () => {
      setState(prev => ({ ...prev, isSaving: true, isPending: false, error: null }));
    },
    onSuccess: (data) => {
      setState(prev => ({
        ...prev,
        isSaving: false,
        isPending: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
        hasLocalBackup: true,
        error: null,
        retryCount: 0,
      }));

      onSaveSuccess?.(data);
    },
    onError: (error: Error) => {
      setState(prev => ({
        ...prev,
        isSaving: false,
        error,
      }));

      onSaveError?.(error);

      // Handle version conflicts
      if (error.message?.includes('409') || error.message?.includes('conflict')) {
        toast.error('Content was updated elsewhere. Please refresh to see the latest version.');
        return;
      }

      // Retry with exponential backoff using latest data
      if (state.retryCount < maxRetries) {
        const backoffDelay = Math.min(1000 * Math.pow(2, state.retryCount), 10000);
        setState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));

        retryTimeoutRef.current = setTimeout(() => {
          console.log(`Retrying autosave (attempt ${state.retryCount + 1}/${maxRetries})`);
          // Use latest data from ref instead of stale closure
          if (latestDataRef.current) {
            saveMutation.mutate(latestDataRef.current);
          }
        }, backoffDelay);
      } else {
        toast.error('Autosave failed. Your changes are saved locally.');
      }
    },
  });

  /**
   * Schedule autosave with debouncing
   */
  const scheduleAutosave = useCallback((data: TData, draftData?: DraftData) => {
    // Store latest data in ref for retry logic
    latestDataRef.current = data;

    // Clear existing timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (localStorageTimerRef.current) {
      clearTimeout(localStorageTimerRef.current);
    }

    // Mark as pending and unsaved
    setState(prev => ({ ...prev, hasUnsavedChanges: true, isPending: true }));

    // Debounce localStorage writes (500ms) to prevent main thread blocking
    if (draftData) {
      localStorageTimerRef.current = setTimeout(() => {
        try {
          DraftManager.save(storageKey, draftData);
          setState(prev => ({ ...prev, hasLocalBackup: true }));
        } catch (error) {
          console.error('localStorage save failed:', error);
          setState(prev => ({ ...prev, hasLocalBackup: false }));
        }
      }, 500);
    }

    // Schedule server save (3s default)
    timerRef.current = setTimeout(() => {
      saveMutation.mutate(data);
    }, debounceMs);
  }, [debounceMs, saveMutation, storageKey]);

  /**
   * Force immediate save (cancel debounce)
   */
  const saveNow = useCallback((data: TData) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    saveMutation.mutate(data);
  }, [saveMutation]);

  /**
   * Cancel pending save
   */
  const cancelSave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (localStorageTimerRef.current) {
      clearTimeout(localStorageTimerRef.current);
      localStorageTimerRef.current = null;
    }
    setState(prev => ({ ...prev, hasUnsavedChanges: false, isPending: false }));
  }, []);

  /**
   * Load draft from localStorage
   */
  const loadDraft = useCallback((): DraftData | null => {
    return DraftManager.load(storageKey);
  }, [storageKey]);

  /**
   * Remove draft from localStorage
   */
  const removeDraft = useCallback(() => {
    DraftManager.remove(storageKey);
  }, [storageKey]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (localStorageTimerRef.current) {
        clearTimeout(localStorageTimerRef.current);
      }
    };
  }, []);

  return {
    ...state,
    scheduleAutosave,
    saveNow,
    cancelSave,
    loadDraft,
    removeDraft,
  };
}
