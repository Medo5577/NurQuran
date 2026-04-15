// Powered by OnSpace.AI
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchSurahWithTranslation, fetchAllSurahs, ApiSurah, SurahWithVerses } from '@/services/quranApi';
import { Storage } from '@/services/storageService';

export interface SurahMeta {
  id: number;
  number: number;
  name: string;
  nameArabic: string;
  meaning: string;
  verses: number;
  revelation: 'Meccan' | 'Medinan';
  juz?: number;
}

function mapApiSurah(s: ApiSurah): SurahMeta {
  return {
    id: s.number,
    number: s.number,
    name: s.englishName,
    nameArabic: s.name,
    meaning: s.englishNameTranslation,
    verses: s.numberOfAyahs,
    revelation: s.revelationType === 'Meccan' ? 'Meccan' : 'Medinan',
  };
}

export function useQuranSurahs() {
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try cache first
      const cached = await Storage.getCachedSurahs();
      if (cached && cached.length > 0) {
        setSurahs(cached);
        setLoading(false);
      }
      // Always refresh from API
      const apiSurahs = await fetchAllSurahs();
      const mapped = apiSurahs.map(mapApiSurah);
      setSurahs(mapped);
      await Storage.cacheSurahs(mapped);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load surahs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { surahs, loading, error, reload: load };
}

export function useSurahDetail(surahId: number, translationEdition = 'en.sahih') {
  const [data, setData] = useState<SurahWithVerses | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const load = useCallback(async () => {
    if (!surahId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSurahWithTranslation(surahId, translationEdition);
      if (mountedRef.current) setData(result);
    } catch (e: any) {
      if (mountedRef.current) setError(e?.message ?? 'Failed to load surah');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [surahId, translationEdition]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load };
}
