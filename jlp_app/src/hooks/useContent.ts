import { useState, useEffect, useCallback } from 'react';
import type { ContentRecord, ContentInput } from '../types/index';
import { useUserStore } from '../store/userStore';

export function useContent() {
  const currentUser = useUserStore((s) => s.currentUser);
  const [items, setItems] = useState<ContentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!currentUser) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await window.content?.getAll(currentUser.userId);
      setItems(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const getById = useCallback(async (contentId: number) => {
    try {
      setError(null);
      return await window.content?.getById(contentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get content');
      return undefined;
    }
  }, []);

  const create = useCallback(async (data: ContentInput) => {
    try {
      setError(null);
      const result = await window.content?.create(data);
      await refresh();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create content');
      return undefined;
    }
  }, [refresh]);

  const update = useCallback(async (contentId: number, data: Partial<ContentInput>) => {
    try {
      setError(null);
      const result = await window.content?.update(contentId, data);
      await refresh();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update content');
      return undefined;
    }
  }, [refresh]);

  const remove = useCallback(async (contentId: number) => {
    try {
      setError(null);
      const result = await window.content?.delete(contentId);
      await refresh();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete content');
      return undefined;
    }
  }, [refresh]);

  const importUrl = useCallback(async (url: string) => {
    if (!currentUser) {
      setError('You must be signed in to import content.');
      return undefined;
    }
    try {
      setError(null);
      const result = await window.content?.import(url, currentUser.userId);
      await refresh();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import content');
      return undefined;
    }
  }, [refresh, currentUser]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, error, refresh, getById, create, update, remove, importUrl };
}
