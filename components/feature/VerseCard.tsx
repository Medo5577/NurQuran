// Powered by OnSpace.AI
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { Verse } from '@/constants/quranData';
import { useAppContext } from '@/contexts/AppContext';

interface VerseCardProps {
  verse: Verse;
  surahName: string;
  fontSize?: number;
  showTransliteration?: boolean;
}

export default function VerseCard({ verse, surahName, fontSize = 26, showTransliteration = true }: VerseCardProps) {
  const { addBookmark, removeBookmark, isBookmarked } = useAppContext();
  const bookmarked = isBookmarked(verse.surahId, verse.verseNumber);

  const handleBookmark = () => {
    if (bookmarked) {
      removeBookmark(verse.surahId, verse.verseNumber);
    } else {
      addBookmark({
        surahId: verse.surahId,
        verseNumber: verse.verseNumber,
        surahName,
        arabic: verse.arabic,
        translation: verse.translation,
        addedAt: new Date(),
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Verse Number Header */}
      <View style={styles.header}>
        <View style={styles.verseNumber}>
          <Text style={styles.verseNumText}>{verse.verseNumber}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable onPress={handleBookmark} style={styles.actionBtn} hitSlop={8}>
            <MaterialIcons
              name={bookmarked ? 'bookmark' : 'bookmark-border'}
              size={22}
              color={bookmarked ? Colors.primary : Colors.textSecondary}
            />
          </Pressable>
          <Pressable style={styles.actionBtn} hitSlop={8}>
            <MaterialIcons name="volume-up" size={22} color={Colors.textSecondary} />
          </Pressable>
          <Pressable style={styles.actionBtn} hitSlop={8}>
            <MaterialIcons name="share" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Arabic Text */}
      <Text style={[styles.arabic, { fontSize }]}>{verse.arabic}</Text>

      {/* Transliteration */}
      {showTransliteration ? (
        <Text style={styles.transliteration}>{verse.transliteration}</Text>
      ) : null}

      {/* Translation */}
      <Text style={styles.translation}>{verse.translation}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  verseNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.overlayLight,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseNumText: {
    color: Colors.primary,
    fontSize: Typography.caption,
    fontWeight: Typography.bold,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    padding: 4,
  },
  arabic: {
    color: Colors.textArabic,
    textAlign: 'right',
    lineHeight: 50,
    marginBottom: Spacing.sm,
    fontWeight: Typography.medium,
    writingDirection: 'rtl',
  },
  transliteration: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  translation: {
    fontSize: Typography.body,
    color: Colors.textPrimary,
    lineHeight: 24,
    marginTop: Spacing.xs,
  },
});
