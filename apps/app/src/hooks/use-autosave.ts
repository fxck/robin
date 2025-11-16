/**
 * Autosave Hook - Centralized autosave logic with:
 * - Debouncing
 * - Conflict resolution
 * - Retry with exponential backoff
 * - localStorage backup
 * - Optimistic updates
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: Error | null;
  retryCount: number;
}

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

  const queryClient = useQueryClient();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [state, setState] = useState<AutosaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    error: null,
    retryCount: 0,
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: saveFn,
    onMutate: () => {
      setState(prev => ({ ...prev, isSaving: true, error: null }));
    },
    onSuccess: (data) => {
      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
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

      // Retry with exponential backoff
      if (state.retryCount < maxRetries) {
        const backoffDelay = Math.min(1000 * Math.pow(2, state.retryCount), 10000);
        setState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));

        retryTimeoutRef.current = setTimeout(() => {
          console.log(`Retrying autosave (attempt ${state.retryCount + 1}/${maxRetries})`);
          saveMutation.mutate(saveMutation.variables as TData);
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
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Mark as unsaved
    setState(prev => ({ ...prev, hasUnsavedChanges: true }));

    // Save to localStorage immediately for backup
    if (draftData) {
      DraftManager.save(storageKey, draftData);
    }

    // Schedule server save
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
    setState(prev => ({ ...prev, hasUnsavedChanges: false }));
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
