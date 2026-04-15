// Powered by OnSpace.AI
// AsyncStorage-based persistence service for offline storage

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  BOOKMARKS: '@nurquran_bookmarks',
  LAST_READ: '@nurquran_last_read',
  SETTINGS: '@nurquran_settings',
  CACHED_SURAHS: '@nurquran_surahs',
  FAVORITES_AZKAR: '@nurquran_fav_azkar',
  PRAYER_LOCATION: '@nurquran_location',
  TASBEEH_COUNTS: '@nurquran_tasbeeh',
  DOWNLOADED_SURAHS: '@nurquran_downloaded',
};

export interface Settings {
  selectedTranslation: string;
  translationEdition: string;
  showTransliteration: boolean;
  arabicFontSize: number;
  calculationMethod: string;
  theme: 'dark' | 'light' | 'sepia';
  audioReciterId: number;
  audioReciterServer: string;
  repeatVerse: boolean;
  autoScroll: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  selectedTranslation: 'Sahih International',
  translationEdition: 'en.sahih',
  showTransliteration: true,
  arabicFontSize: 26,
  calculationMethod: 'UmmAlQura',
  theme: 'dark',
  audioReciterId: 7,
  audioReciterServer: 'https://server8.mp3quran.net/afs/',
  repeatVerse: false,
  autoScroll: true,
};

async function safeGet<T>(key: string, fallback: T): Promise<T> {
  try {
    const val = await AsyncStorage.getItem(key);
    if (val === null) return fallback;
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

async function safeSet(key: string, value: any): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage write failed', e);
  }
}

export const Storage = {
  // Settings
  async getSettings(): Promise<Settings> {
    return safeGet(KEYS.SETTINGS, DEFAULT_SETTINGS);
  },
  async saveSettings(settings: Partial<Settings>): Promise<void> {
    const current = await this.getSettings();
    await safeSet(KEYS.SETTINGS, { ...current, ...settings });
  },

  // Last read
  async getLastRead(): Promise<{ surahId: number; verseId: number } | null> {
    return safeGet(KEYS.LAST_READ, null);
  },
  async saveLastRead(surahId: number, verseId: number): Promise<void> {
    await safeSet(KEYS.LAST_READ, { surahId, verseId });
  },

  // Bookmarks
  async getBookmarks(): Promise<any[]> {
    return safeGet(KEYS.BOOKMARKS, []);
  },
  async saveBookmarks(bookmarks: any[]): Promise<void> {
    await safeSet(KEYS.BOOKMARKS, bookmarks);
  },

  // Favorite azkar
  async getFavoriteAzkar(): Promise<any[]> {
    return safeGet(KEYS.FAVORITES_AZKAR, []);
  },
  async saveFavoriteAzkar(list: any[]): Promise<void> {
    await safeSet(KEYS.FAVORITES_AZKAR, list);
  },

  // Prayer location cache
  async getPrayerLocation(): Promise<{ lat: number; lng: number; city?: string } | null> {
    return safeGet(KEYS.PRAYER_LOCATION, null);
  },
  async savePrayerLocation(lat: number, lng: number, city?: string): Promise<void> {
    await safeSet(KEYS.PRAYER_LOCATION, { lat, lng, city });
  },

  // Tasbeeh totals
  async getTasbeehCounts(): Promise<Record<string, number>> {
    return safeGet(KEYS.TASBEEH_COUNTS, {});
  },
  async saveTasbeehCount(dhikrId: string, count: number): Promise<void> {
    const current = await this.getTasbeehCounts();
    await safeSet(KEYS.TASBEEH_COUNTS, { ...current, [dhikrId]: count });
  },

  // Cached surah list
  async getCachedSurahs(): Promise<any[] | null> {
    return safeGet(KEYS.CACHED_SURAHS, null);
  },
  async cacheSurahs(surahs: any[]): Promise<void> {
    await safeSet(KEYS.CACHED_SURAHS, surahs);
  },

  // Downloaded surahs for offline
  async getDownloadedSurahs(): Promise<number[]> {
    return safeGet(KEYS.DOWNLOADED_SURAHS, []);
  },
  async markSurahDownloaded(surahId: number): Promise<void> {
    const current = await this.getDownloadedSurahs();
    if (!current.includes(surahId)) {
      await safeSet(KEYS.DOWNLOADED_SURAHS, [...current, surahId]);
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
    } catch (e) {
      console.warn('Clear all storage failed', e);
    }
  },
};
