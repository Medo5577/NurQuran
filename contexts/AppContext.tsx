// Powered by OnSpace.AI
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { MORNING_AZKAR, EVENING_AZKAR, Dhikr } from '@/constants/azkarData';

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
  showTransliteration: boolean;
  setShowTransliteration: (v: boolean) => void;
  arabicFontSize: number;
  setArabicFontSize: (s: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkedVerse[]>([]);
  const [favoriteAzkar, setFavoriteAzkar] = useState<FavoriteAzkar[]>([]);
  const [lastReadSurah, setLastReadSurah] = useState<number | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState('English - Sahih International');
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [arabicFontSize, setArabicFontSize] = useState(26);

  const addBookmark = useCallback((verse: BookmarkedVerse) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.surahId === verse.surahId && b.verseNumber === verse.verseNumber);
      if (exists) return prev;
      return [{ ...verse, addedAt: new Date() }, ...prev];
    });
  }, []);

  const removeBookmark = useCallback((surahId: number, verseNumber: number) => {
    setBookmarks(prev => prev.filter(b => !(b.surahId === surahId && b.verseNumber === verseNumber)));
  }, []);

  const isBookmarked = useCallback((surahId: number, verseNumber: number) => {
    return bookmarks.some(b => b.surahId === surahId && b.verseNumber === verseNumber);
  }, [bookmarks]);

  const toggleFavoriteAzkar = useCallback((dhikr: Dhikr) => {
    setFavoriteAzkar(prev => {
      const exists = prev.some(f => f.dhikr.id === dhikr.id);
      if (exists) return prev.filter(f => f.dhikr.id !== dhikr.id);
      return [{ dhikr, addedAt: new Date() }, ...prev];
    });
  }, []);

  const isAzkarFavorite = useCallback((id: number) => {
    return favoriteAzkar.some(f => f.dhikr.id === id);
  }, [favoriteAzkar]);

  return (
    <AppContext.Provider value={{
      bookmarks, addBookmark, removeBookmark, isBookmarked,
      favoriteAzkar, toggleFavoriteAzkar, isAzkarFavorite,
      lastReadSurah, setLastReadSurah,
      selectedTranslation, setSelectedTranslation,
      showTransliteration, setShowTransliteration,
      arabicFontSize, setArabicFontSize,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
