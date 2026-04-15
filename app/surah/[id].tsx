// Powered by OnSpace.AI
// Full Surah detail screen with real API data + integrated audio player

import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator,
  Modal, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useSurahDetail } from '@/hooks/useQuran';
import { useAudioPlayer, DEFAULT_RECITERS } from '@/hooks/useAudioPlayer';
import { useAppContext } from '@/contexts/AppContext';
import { formatAudioTime } from '@/services/audioService';

export default function SurahScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const surahId = Number(id) || 1;

  const { selectedTranslation, showTransliteration, arabicFontSize, setLastReadSurah } = useAppContext();
  const { addBookmark, removeBookmark, isBookmarked } = useAppContext();

  const { data, loading, error, reload } = useSurahDetail(surahId);
  const {
    audioState, isPlaying, isLoading: audioLoading, currentSurahId,
    progressRatio, positionText, durationText,
    selectedReciter, reciters,
    playSurah, togglePlayPause, stop, selectReciter,
  } = useAudioPlayer();

  const [showReciterModal, setShowReciterModal] = useState(false);

  React.useEffect(() => { setLastReadSurah(surahId); }, [surahId]);

  const isThisSurahPlaying = currentSurahId === surahId;
  const surah = data?.surah;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Navigation Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          {surah ? (
            <>
              <Text style={styles.surahName}>{surah.englishName}</Text>
              <Text style={styles.surahMeta}>{surah.numberOfAyahs} Verses • {surah.revelationType}</Text>
            </>
          ) : (
            <Text style={styles.surahName}>Loading...</Text>
          )}
        </View>
        <Pressable
          style={styles.iconBtn}
          onPress={() => {
            if (isThisSurahPlaying) {
              togglePlayPause();
            } else {
              playSurah(surahId);
            }
          }}
        >
          {audioLoading && isThisSurahPlaying ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <MaterialIcons
              name={isThisSurahPlaying && isPlaying ? 'pause-circle-filled' : 'play-circle-filled'}
              size={28}
              color={Colors.primary}
            />
          )}
        </Pressable>
      </View>

      {/* Audio Player Bar */}
      {isThisSurahPlaying ? (
        <View style={styles.audioBar}>
          <Pressable onPress={() => setShowReciterModal(true)} style={styles.reciterBtn}>
            <MaterialIcons name="person" size={14} color={Colors.primary} />
            <Text style={styles.reciterName} numberOfLines={1}>{selectedReciter.name}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={14} color={Colors.textSecondary} />
          </Pressable>
          <View style={styles.audioControls}>
            <Text style={styles.audioTime}>{positionText}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
            </View>
            <Text style={styles.audioTime}>{durationText}</Text>
          </View>
          <View style={styles.audioActions}>
            <Pressable onPress={togglePlayPause} hitSlop={8}>
              <MaterialIcons
                name={isPlaying ? 'pause' : 'play-arrow'}
                size={28}
                color={Colors.primary}
              />
            </Pressable>
            <Pressable onPress={stop} hitSlop={8}>
              <MaterialIcons name="stop" size={22} color={Colors.textSecondary} />
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* Surah Banner */}
      {surah ? (
        <View style={styles.banner}>
          <Text style={styles.bannerArabic}>{surah.name}</Text>
          <Text style={styles.bannerMeaning}>{surah.englishNameTranslation}</Text>
          <Text style={styles.bannerNum}>Surah #{surah.number}</Text>
        </View>
      ) : null}

      {/* Bismillah */}
      {surahId !== 1 && surahId !== 9 ? (
        <View style={styles.bismillah}>
          <Text style={styles.bismillahText}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
        </View>
      ) : null}

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadText}>Loading from Quran API...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <MaterialIcons name="wifi-off" size={48} color={Colors.textMuted} />
          <Text style={styles.errText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={reload}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {(data?.arabicVerses ?? []).map((verse, idx) => {
            const translation = data?.translationVerses?.[idx];
            const translit = data?.transliterationVerses?.[idx];
            const bookmarked = isBookmarked(surahId, verse.numberInSurah);

            return (
              <View key={verse.number} style={styles.verseCard}>
                <View style={styles.verseHeader}>
                  <View style={styles.verseNumBadge}>
                    <Text style={styles.verseNum}>{verse.numberInSurah}</Text>
                  </View>
                  <Pressable
                    hitSlop={8}
                    onPress={() => {
                      if (bookmarked) {
                        removeBookmark(surahId, verse.numberInSurah);
                      } else {
                        addBookmark({
                          surahId,
                          verseNumber: verse.numberInSurah,
                          surahName: surah?.englishName ?? '',
                          arabic: verse.text,
                          translation: translation?.text ?? '',
                          addedAt: new Date(),
                        });
                      }
                    }}
                  >
                    <MaterialIcons
                      name={bookmarked ? 'bookmark' : 'bookmark-border'}
                      size={20}
                      color={bookmarked ? Colors.primary : Colors.textSecondary}
                    />
                  </Pressable>
                </View>

                <Text style={[styles.arabicText, { fontSize: arabicFontSize }]}>{verse.text}</Text>

                {showTransliteration && translit ? (
                  <Text style={styles.translitText}>{translit.text}</Text>
                ) : null}

                {translation ? (
                  <Text style={styles.translationText}>{translation.text}</Text>
                ) : null}
              </View>
            );
          })}
          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      )}

      {/* Reciter Modal */}
      <Modal visible={showReciterModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowReciterModal(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Reciter</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {DEFAULT_RECITERS.map(r => (
                <Pressable
                  key={r.id}
                  style={[styles.reciterOption, selectedReciter.id === r.id && styles.reciterOptionActive]}
                  onPress={() => { selectReciter(r.id); setShowReciterModal(false); }}
                >
                  <View style={styles.reciterAvatar}>
                    <MaterialIcons name="person" size={20} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.reciterOptionName, selectedReciter.id === r.id && { color: Colors.primary }]}>
                      {r.name}
                    </Text>
                    <Text style={styles.reciterOptionNameAr}>{r.nameAr}</Text>
                  </View>
                  {selectedReciter.id === r.id ? (
                    <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
  },
  iconBtn: { padding: 4, minWidth: 36, alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  surahName: { fontSize: Typography.h4, fontWeight: Typography.bold, color: Colors.textPrimary },
  surahMeta: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 1 },
  audioBar: {
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
    paddingHorizontal: Spacing.md, paddingVertical: 8, gap: 6,
  },
  reciterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
  },
  reciterName: { fontSize: Typography.small, color: Colors.textSecondary, maxWidth: 200 },
  audioControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  audioTime: { fontSize: Typography.small, color: Colors.textMuted, minWidth: 38 },
  progressTrack: {
    flex: 1, height: 4, backgroundColor: Colors.surfaceBorder, borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  audioActions: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'flex-end' },
  banner: {
    alignItems: 'center', paddingVertical: Spacing.lg, paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
  },
  bannerArabic: { fontSize: Typography.arabicXL, color: Colors.textArabic, marginBottom: Spacing.xs },
  bannerMeaning: { fontSize: Typography.body, color: Colors.primary, fontStyle: 'italic' },
  bannerNum: { fontSize: Typography.caption, color: Colors.textMuted, marginTop: 4 },
  bismillah: {
    alignItems: 'center', paddingVertical: Spacing.md,
    backgroundColor: Colors.overlayLight, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
  },
  bismillahText: { fontSize: 22, color: Colors.textArabic, letterSpacing: 1 },
  verseCard: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
  },
  verseHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm,
  },
  verseNumBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.overlayLight, borderWidth: 1, borderColor: Colors.primary + '55',
    alignItems: 'center', justifyContent: 'center',
  },
  verseNum: { fontSize: Typography.small, fontWeight: Typography.bold, color: Colors.primary },
  arabicText: { color: Colors.textArabic, textAlign: 'right', lineHeight: 48, writingDirection: 'rtl', marginBottom: Spacing.sm },
  translitText: { fontSize: Typography.caption, color: Colors.textSecondary, fontStyle: 'italic', marginBottom: 6, lineHeight: 20 },
  translationText: { fontSize: Typography.body, color: Colors.textPrimary, lineHeight: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.xl },
  loadText: { fontSize: Typography.body, color: Colors.textSecondary },
  errText: { fontSize: Typography.body, color: Colors.textSecondary, textAlign: 'center' },
  retryBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { fontSize: Typography.body, fontWeight: Typography.bold, color: Colors.background },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.md, maxHeight: '70%',
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.surfaceBorder, alignSelf: 'center', marginBottom: Spacing.md },
  modalTitle: { fontSize: Typography.h3, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  reciterOption: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.sm + 4, borderRadius: Radius.md, marginBottom: 4,
  },
  reciterOptionActive: { backgroundColor: Colors.overlayLight },
  reciterAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.overlayLight,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.primary + '44',
  },
  reciterOptionName: { fontSize: Typography.body, color: Colors.textPrimary },
  reciterOptionNameAr: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 2 },
});
