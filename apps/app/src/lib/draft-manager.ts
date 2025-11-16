/**
 * Draft Manager - Local storage backup for post drafts
 * Prevents data loss even when network fails or browser crashes
 */

export interface DraftData {
  title: string;
  content: string;
  coverImage?: string;
  status: 'draft' | 'published';
  version: number;
  postId?: string;
  lastModified: number;
}

const DRAFT_KEY_PREFIX = 'robin_draft_';
const DRAFT_LIST_KEY = 'robin_drafts_list';
const MAX_DRAFTS = 50;

export class DraftManager {
  /**
   * Save draft to localStorage
   */
  static save(key: string, data: DraftData): void {
    try {
      const draftKey = `${DRAFT_KEY_PREFIX}${key}`;
      localStorage.setItem(draftKey, JSON.stringify({
        ...data,
        lastModified: Date.now(),
      }));

      // Update drafts list
      this.addToDraftsList(key);

      // Clean up old drafts
      this.cleanupOldDrafts();
    } catch (error) {
      console.error('Failed to save draft to localStorage:', error);
      // If quota exceeded, remove oldest drafts and retry
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.cleanupOldDrafts(10);
        try {
          const draftKey = `${DRAFT_KEY_PREFIX}${key}`;
          localStorage.setItem(draftKey, JSON.stringify(data));
        } catch (retryError) {
          console.error('Still failed after cleanup. Draft may be too large:', retryError);
          // Draft itself might be too large (e.g., embedded large images)
          // Don't throw - fail silently but log for debugging
        }
      }
    }
  }

  /**
   * Load draft from localStorage
   */
  static load(key: string): DraftData | null {
    try {
      const draftKey = `${DRAFT_KEY_PREFIX}${key}`;
      const data = localStorage.getItem(draftKey);
      if (!data) return null;

      return JSON.parse(data) as DraftData;
    } catch (error) {
      console.error('Failed to load draft from localStorage:', error);
      return null;
    }
  }

  /**
   * Remove draft from localStorage
   */
  static remove(key: string): void {
    try {
      const draftKey = `${DRAFT_KEY_PREFIX}${key}`;
      localStorage.removeItem(draftKey);
      this.removeFromDraftsList(key);
    } catch (error) {
      console.error('Failed to remove draft from localStorage:', error);
    }
  }

  /**
   * Check if draft exists and is newer than server version
   */
  static hasNewerDraft(key: string, serverTimestamp: number): boolean {
    const draft = this.load(key);
    if (!draft) return false;

    return draft.lastModified > serverTimestamp;
  }

  /**
   * Get all draft keys
   */
  private static getDraftsList(): string[] {
    try {
      const list = localStorage.getItem(DRAFT_LIST_KEY);
      return list ? JSON.parse(list) : [];
    } catch {
      return [];
    }
  }

  /**
   * Add to drafts list
   */
  private static addToDraftsList(key: string): void {
    try {
      const list = this.getDraftsList();
      if (!list.includes(key)) {
        list.push(key);
        localStorage.setItem(DRAFT_LIST_KEY, JSON.stringify(list));
      }
    } catch (error) {
      console.error('Failed to update drafts list:', error);
    }
  }

  /**
   * Remove from drafts list
   */
  private static removeFromDraftsList(key: string): void {
    try {
      const list = this.getDraftsList();
      const filtered = list.filter(k => k !== key);
      localStorage.setItem(DRAFT_LIST_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to update drafts list:', error);
    }
  }

  /**
   * Clean up old drafts to prevent localStorage bloat
   */
  private static cleanupOldDrafts(maxToKeep: number = MAX_DRAFTS): void {
    try {
      const list = this.getDraftsList();
      if (list.length <= maxToKeep) return;

      // Load all drafts with timestamps
      const draftsWithTime = list
        .map(key => ({
          key,
          data: this.load(key),
        }))
        .filter(d => d.data !== null)
        .sort((a, b) => (b.data!.lastModified - a.data!.lastModified));

      // Remove oldest drafts
      const toRemove = draftsWithTime.slice(maxToKeep);
      toRemove.forEach(({ key }) => {
        localStorage.removeItem(`${DRAFT_KEY_PREFIX}${key}`);
      });

      // Update list
      const newList = draftsWithTime.slice(0, maxToKeep).map(d => d.key);
      localStorage.setItem(DRAFT_LIST_KEY, JSON.stringify(newList));
    } catch (error) {
      console.error('Failed to cleanup old drafts:', error);
    }
  }

  /**
   * Generate a temporary draft key for new posts
   */
  static generateTempKey(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
