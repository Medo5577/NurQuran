// Powered by OnSpace.AI
import React, { createContext, useState, useContext, useCallback, useEffect, ReactNode } from 'react';
import { Storage } from '@/services/storageService';
import type { Dhikr } from '@/constants/azkarData';

export interface BookmarkedVerse {
  surahId: number;
  verseNumber: number;
  surahName: string;
  arabic: string;
  translation: string;
  addedAt: Date;
}

export interface FavoriteAzkar {
  dhikr: Dhikr;
  addedAt: Date;
}

interface AppContextType {
  // Bookmarks
  bookmarks: BookmarkedVerse[];
  addBookmark: (verse: BookmarkedVerse) => void;
  removeBookmark: (surahId: number, verseNumber: number) => void;
  isBookmarked: (surahId: number, verseNumber: number) => boolean;

  // Favorite Azkar
  favoriteAzkar: FavoriteAzkar[];
  toggleFavoriteAzkar: (dhikr: Dhikr) => void;
  isAzkarFavorite: (id: number) => boolean;

  // Last Read
  lastReadSurah: number | null;
  setLastReadSurah: (id: number) => void;

  // Settings
  selectedTranslation: string;
  setSelectedTranslation: (t: string) => void;
  translationEdition: string;
  showTransliteration: boolean;
  setShowTransliteration: (v: boolean) => void;
  arabicFontSize: number;
  setArabicFontSize: (s: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkedVerse[]>([]);
  const [favoriteAzkar, setFavoriteAzkar] = useState<FavoriteAzkar[]>([]);
  const [lastReadSurah, setLastReadSurahState] = useState<number | null>(null);
  const [selectedTranslation, setSelectedTranslationState] = useState('Sahih International');
  const [translationEdition, setTranslationEdition] = useState('en.sahih');
  const [showTransliteration, setShowTransliterationState] = useState(true);
  const [arabicFontSize, setArabicFontSizeState] = useState(26);

  // Load persisted state on mount
  useEffect(() => {
    (async () => {
      const [settings, savedBookmarks, savedFaves, lastRead] = await Promise.all([
        Storage.getSettings(),
        Storage.getBookmarks(),
        Storage.getFavoriteAzkar(),
        Storage.getLastRead(),
      ]);
      setSelectedTranslationState(settings.selectedTranslation);
      setTranslationEdition(settings.translationEdition);
      setShowTransliterationState(settings.showTransliteration);
      setArabicFontSizeState(settings.arabicFontSize);
      if (savedBookmarks.length > 0) setBookmarks(savedBookmarks);
      if (savedFaves.length > 0) setFavoriteAzkar(savedFaves);
      if (lastRead) setLastReadSurahState(lastRead.surahId);
    })();
  }, []);

  const addBookmark = useCallback((verse: BookmarkedVerse) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.surahId === verse.surahId && b.verseNumber === verse.verseNumber);
      if (exists) return prev;
      const updated = [{ ...verse, addedAt: new Date() }, ...prev];
      Storage.saveBookmarks(updated);
      return updated;
    });
  }, []);

  const removeBookmark = useCallback((surahId: number, verseNumber: number) => {
    setBookmarks(prev => {
      const updated = prev.filter(b => !(b.surahId === surahId && b.verseNumber === verseNumber));
      Storage.saveBookmarks(updated);
      return updated;
    });
  }, []);

  const isBookmarked = useCallback((surahId: number, verseNumber: number) =>
    bookmarks.some(b => b.surahId === surahId && b.verseNumber === verseNumber),
  [bookmarks]);

  const toggleFavoriteAzkar = useCallback((dhikr: Dhikr) => {
    setFavoriteAzkar(prev => {
      const exists = prev.some(f => f.dhikr.id === dhikr.id);
      const updated = exists
        ? prev.filter(f => f.dhikr.id !== dhikr.id)
        : [{ dhikr, addedAt: new Date() }, ...prev];
      Storage.saveFavoriteAzkar(updated);
      return updated;
    });
  }, []);

  const isAzkarFavorite = useCallback((id: number) =>
    favoriteAzkar.some(f => f.dhikr.id === id),
  [favoriteAzkar]);

  const setLastReadSurah = useCallback((id: number) => {
    setLastReadSurahState(id);
    Storage.saveLastRead(id, 1);
  }, []);

  const setSelectedTranslation = useCallback((t: string) => {
    const editionMap: Record<string, string> = {
      'Sahih International': 'en.sahih',
      'Yusuf Ali': 'en.yusufali',
      'Pickthall': 'en.pickthall',
      'Dr. Mustafa Khattab': 'en.khattab',
      'Transliteration': 'en.transliteration',
    };
    const edition = editionMap[t] ?? 'en.sahih';
    setSelectedTranslationState(t);
    setTranslationEdition(edition);
    Storage.saveSettings({ selectedTranslation: t, translationEdition: edition });
  }, []);

  const setShowTransliteration = useCallback((v: boolean) => {
    setShowTransliterationState(v);
    Storage.saveSettings({ showTransliteration: v });
  }, []);

  const setArabicFontSize = useCallback((s: number) => {
    setArabicFontSizeState(s);
    Storage.saveSettings({ arabicFontSize: s });
  }, []);

  return (
    <AppContext.Provider value={{
      bookmarks, addBookmark, removeBookmark, isBookmarked,
      favoriteAzkar, toggleFavoriteAzkar, isAzkarFavorite,
      lastReadSurah, setLastReadSurah,
      selectedTranslation, setSelectedTranslation, translationEdition,
      showTransliteration, setShowTransliteration,
      arabicFontSize, setArabicFontSize,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
