// Powered by OnSpace.AI
// Hook for managing offline Quran audio downloads

import { useState, useEffect, useCallback } from 'react';
import {
  downloadSurah,
  deleteSurahDownload,
  isDownloaded,
  getDownloadIndex,
  getTotalDownloadSize,
  formatFileSize,
  DownloadRecord,
} from '@/services/downloadService';
import { getSurahAudioUrl } from '@/services/mp3quranApi';
import { DEFAULT_RECITERS } from './useAudioPlayer';

export interface SurahDownloadState {
  surahId: number;
  reciterId: number;
  status: 'none' | 'downloading' | 'done' | 'error';
  progress: number;
  localUri?: string;
  error?: string;
}

const downloadStates: Map<string, SurahDownloadState> = new Map();
const listeners: Set<() => void> = new Set();

function notifyListeners() {
  listeners.forEach(fn => fn());
}

function getKey(surahId: number, reciterId: number) {
  return `${surahId}_${reciterId}`;
}

export function useOfflineQuran(selectedReciterId: number = DEFAULT_RECITERS[0].id) {
  const [downloads, setDownloads] = useState<Map<string, SurahDownloadState>>(new Map(downloadStates));
  const [allRecords, setAllRecords] = useState<DownloadRecord[]>([]);
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    const onChange = () => setDownloads(new Map(downloadStates));
    listeners.add(onChange);

    // Load existing downloads
    (async () => {
      const records = await getDownloadIndex();
      setAllRecords(records);
      const size = await getTotalDownloadSize();
      setTotalSize(size);

      // Pre-populate states for downloaded files
      for (const r of records) {
        const key = getKey(r.surahId, r.reciterId);
        if (!downloadStates.has(key)) {
          downloadStates.set(key, {
            surahId: r.surahId,
            reciterId: r.reciterId,
            status: 'done',
            progress: 1,
            localUri: r.localUri,
          });
        }
      }
      notifyListeners();
    })();

    return () => { listeners.delete(onChange); };
  }, []);

  const getState = useCallback((surahId: number): SurahDownloadState => {
    const key = getKey(surahId, selectedReciterId);
    return downloadStates.get(key) ?? { surahId, reciterId: selectedReciterId, status: 'none', progress: 0 };
  }, [selectedReciterId, downloads]);

  const isDownloadedSync = useCallback((surahId: number): boolean => {
    const state = getState(surahId);
    return state.status === 'done';
  }, [getState]);

  const startDownload = useCallback(async (surahId: number) => {
    const key = getKey(surahId, selectedReciterId);
    const reciter = DEFAULT_RECITERS.find(r => r.id === selectedReciterId) ?? DEFAULT_RECITERS[0];
    const remoteUrl = getSurahAudioUrl(reciter.server, surahId);

    downloadStates.set(key, { surahId, reciterId: selectedReciterId, status: 'downloading', progress: 0 });
    notifyListeners();

    try {
      const localUri = await downloadSurah(surahId, selectedReciterId, remoteUrl, (progress) => {
        downloadStates.set(key, { surahId, reciterId: selectedReciterId, status: 'downloading', progress });
        notifyListeners();
      });

      downloadStates.set(key, { surahId, reciterId: selectedReciterId, status: 'done', progress: 1, localUri });
      notifyListeners();

      // Refresh records
      const records = await getDownloadIndex();
      setAllRecords(records);
      const size = await getTotalDownloadSize();
      setTotalSize(size);
    } catch (e: any) {
      downloadStates.set(key, { surahId, reciterId: selectedReciterId, status: 'error', progress: 0, error: e?.message ?? 'Download failed' });
      notifyListeners();
    }
  }, [selectedReciterId]);

  const cancelDelete = useCallback(async (surahId: number) => {
    const key = getKey(surahId, selectedReciterId);
    await deleteSurahDownload(surahId, selectedReciterId);
    downloadStates.delete(key);
    notifyListeners();

    const records = await getDownloadIndex();
    setAllRecords(records);
    const size = await getTotalDownloadSize();
    setTotalSize(size);
  }, [selectedReciterId]);

  return {
    getState,
    isDownloadedSync,
    startDownload,
    cancelDelete,
    allRecords,
    totalSizeFormatted: formatFileSize(totalSize),
    downloadCount: allRecords.filter(r => r.reciterId === selectedReciterId).length,
  };
}
