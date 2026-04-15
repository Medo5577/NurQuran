// Powered by OnSpace.AI
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { SURAHS, AL_FATIHA_VERSES } from '@/constants/quranData';
import { useAppContext } from '@/contexts/AppContext';
import VerseCard from '@/components/feature/VerseCard';

export default function SurahScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { setLastReadSurah, arabicFontSize, showTransliteration } = useAppContext();
  const surahId = Number(id);
  const surah = SURAHS.find(s => s.id === surahId) ?? SURAHS[0];

  React.useEffect(() => {
    setLastReadSurah(surahId);
  }, [surahId]);

  // Use Al-Fatiha verses for surah 1, otherwise show placeholder
  const verses = surahId === 1 ? AL_FATIHA_VERSES : AL_FATIHA_VERSES.map(v => ({
    ...v,
    surahId,
    verseNumber: v.verseNumber,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Navigation Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.surahName}>{surah.name}</Text>
          <Text style={styles.surahMeta}>{surah.verses} Verses • {surah.revelation}</Text>
        </View>
        <Pressable style={styles.audioBtn}>
          <MaterialIcons name="volume-up" size={22} color={Colors.primary} />
        </Pressable>
      </View>

      {/* Surah Info Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerArabic}>{surah.nameArabic}</Text>
        <Text style={styles.bannerMeaning}>{surah.meaning}</Text>
        <Text style={styles.bannerNumber}>Surah #{surah.id}</Text>
      </View>

      {/* Bismillah */}
      {surahId !== 1 && surahId !== 9 ? (
        <View style={styles.bismillah}>
          <Text style={styles.bismillahText}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
        </View>
      ) : null}

      <ScrollView showsVerticalScrollIndicator={false}>
        {verses.map(verse => (
          <VerseCard
            key={`${verse.surahId}-${verse.verseNumber}`}
            verse={verse}
            surahName={surah.name}
            fontSize={arabicFontSize}
            showTransliteration={showTransliteration}
          />
        ))}

        {surahId !== 1 ? (
          <View style={styles.notice}>
            <MaterialIcons name="info-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.noticeText}>
              Full surah text available via Quran.com API integration. Showing Al-Fatiha as preview.
            </Text>
          </View>
        ) : null}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, alignItems: 'center' },
  surahName: { fontSize: Typography.h4, fontWeight: Typography.bold, color: Colors.textPrimary },
  surahMeta: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 1 },
  audioBtn: { padding: 4 },
  banner: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  bannerArabic: { fontSize: Typography.arabicXL, color: Colors.textArabic, marginBottom: Spacing.xs },
  bannerMeaning: { fontSize: Typography.body, color: Colors.primary, fontStyle: 'italic' },
  bannerNumber: { fontSize: Typography.caption, color: Colors.textMuted, marginTop: 4 },
  bismillah: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.overlayLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  bismillahText: {
    fontSize: Typography.arabicMD,
    color: Colors.textArabic,
    letterSpacing: 1,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  noticeText: { flex: 1, fontSize: Typography.small, color: Colors.textMuted, lineHeight: 18 },
});
