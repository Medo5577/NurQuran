// Powered by OnSpace.AI
// Offline Quran download manager using expo-file-system + AsyncStorage

import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DOWNLOAD_DIR = `${FileSystem.documentDirectory}quran_audio/`;
const DOWNLOAD_INDEX_KEY = '@quran_downloads';
const QURAN_VERSE_CACHE_KEY = '@quran_verses_';

export interface DownloadRecord {
  surahId: number;
  reciterId: number;
  localUri: string;
  downloadedAt: string;
  fileSize?: number;
}

export interface DownloadProgress {
  surahId: number;
  reciterId: number;
  progress: number; // 0-1
  status: 'downloading' | 'done' | 'error';
  error?: string;
}

// ─── Directory Setup ──────────────────────────────────────────────────────────
async function ensureDir() {
  const info = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
  }
}

// ─── Index Management ────────────────────────────────────────────────────────
export async function getDownloadIndex(): Promise<DownloadRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(DOWNLOAD_INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveDownloadIndex(records: DownloadRecord[]) {
  await AsyncStorage.setItem(DOWNLOAD_INDEX_KEY, JSON.stringify(records));
}

export async function isDownloaded(surahId: number, reciterId: number): Promise<string | null> {
  const index = await getDownloadIndex();
  const record = index.find(r => r.surahId === surahId && r.reciterId === reciterId);
  if (!record) return null;
  const info = await FileSystem.getInfoAsync(record.localUri);
  return info.exists ? record.localUri : null;
}

// ─── Download ────────────────────────────────────────────────────────────────
export async function downloadSurah(
  surahId: number,
  reciterId: number,
  remoteUrl: string,
  onProgress: (progress: number) => void
): Promise<string> {
  await ensureDir();
  const filename = `surah_${surahId}_reciter_${reciterId}.mp3`;
  const localUri = `${DOWNLOAD_DIR}${filename}`;

  // Check if already exists
  const existing = await FileSystem.getInfoAsync(localUri);
  if (existing.exists) {
    onProgress(1);
    return localUri;
  }

  const downloadResumable = FileSystem.createDownloadResumable(
    remoteUrl,
    localUri,
    {},
    (dp) => {
      if (dp.totalBytesExpectedToWrite > 0) {
        onProgress(dp.totalBytesWritten / dp.totalBytesExpectedToWrite);
      }
    }
  );

  const result = await downloadResumable.downloadAsync();
  if (!result?.uri) throw new Error('Download failed');

  // Update index
  const index = await getDownloadIndex();
  const filtered = index.filter(r => !(r.surahId === surahId && r.reciterId === reciterId));
  const info = await FileSystem.getInfoAsync(result.uri);
  filtered.push({
    surahId,
    reciterId,
    localUri: result.uri,
    downloadedAt: new Date().toISOString(),
    fileSize: (info as any).size ?? 0,
  });
  await saveDownloadIndex(filtered);
  onProgress(1);

  return result.uri;
}

// ─── Delete ──────────────────────────────────────────────────────────────────
export async function deleteSurahDownload(surahId: number, reciterId: number): Promise<void> {
  const index = await getDownloadIndex();
  const record = index.find(r => r.surahId === surahId && r.reciterId === reciterId);
  if (record) {
    const info = await FileSystem.getInfoAsync(record.localUri);
    if (info.exists) await FileSystem.deleteAsync(record.localUri);
    const updated = index.filter(r => !(r.surahId === surahId && r.reciterId === reciterId));
    await saveDownloadIndex(updated);
  }
}

export async function deleteAllDownloads(): Promise<void> {
  const info = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
  if (info.exists) {
    await FileSystem.deleteAsync(DOWNLOAD_DIR, { idempotent: true });
  }
  await AsyncStorage.removeItem(DOWNLOAD_INDEX_KEY);
}

// ─── Total Storage ──────────────────────────────────────────────────────────
export async function getTotalDownloadSize(): Promise<number> {
  const index = await getDownloadIndex();
  let total = 0;
  for (const r of index) {
    const info = await FileSystem.getInfoAsync(r.localUri);
    if (info.exists) total += (info as any).size ?? 0;
  }
  return total;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Verse Text Cache ────────────────────────────────────────────────────────
export async function cacheVerseData(surahId: number, data: any): Promise<void> {
  try {
    await AsyncStorage.setItem(`${QURAN_VERSE_CACHE_KEY}${surahId}`, JSON.stringify(data));
  } catch {}
}

export async function getCachedVerseData(surahId: number): Promise<any | null> {
  try {
    const raw = await AsyncStorage.getItem(`${QURAN_VERSE_CACHE_KEY}${surahId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
