// Powered by OnSpace.AI
import { useState, useEffect, useCallback } from 'react';
import {
  fetchHadithPage,
  HadithItem,
  HadithCollection,
  HADITH_COLLECTIONS_META,
  HadithMeta,
} from '@/services/hadithApiService';

export function useHadithCollection(collectionId: string) {
  const [hadiths, setHadiths] = useState<HadithItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const LIMIT = 20;

  const meta = HADITH_COLLECTIONS_META.find(c => c.id === collectionId);

  const load = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;
    if (!reset && !hasMore) return;
    if (reset) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const result = await fetchHadithPage(collectionId, currentPage, LIMIT);
      if (!result) throw new Error('Failed to load hadiths');

      const newHadiths = result.hadiths;
      if (reset) {
        setHadiths(newHadiths);
        setPage(2);
      } else {
        setHadiths(prev => [...prev, ...newHadiths]);
        setPage(p => p + 1);
      }
      setHasMore(newHadiths.length === LIMIT);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [collectionId, page, hasMore]);

  useEffect(() => {
    load(true);
  }, [collectionId]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) load(false);
  }, [load, loadingMore, hasMore, loading]);

  const filteredHadiths = searchQuery
    ? hadiths.filter(h =>
        h.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.arab.includes(searchQuery) ||
        String(h.number).includes(searchQuery)
      )
    : hadiths;

  return {
    hadiths: filteredHadiths,
    loading,
    loadingMore,
    error,
    hasMore,
    meta,
    searchQuery,
    setSearchQuery,
    loadMore,
    reload: () => load(true),
  };
}

export { HADITH_COLLECTIONS_META };
