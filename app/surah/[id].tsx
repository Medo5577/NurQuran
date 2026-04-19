// Powered by OnSpace.AI
// Full Surah reader — page-flip Mushaf effect, animated sticky header,
// bottom audio player, verse highlighting, offline support

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator,
  Modal, Dimensions, Animated, Easing, PanResponder,
  ScrollView, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useSurahDetail, useQuranSurahs } from '@/hooks/useQuran';
import { useAudioPlayer, DEFAULT_RECITERS } from '@/hooks/useAudioPlayer';
import { useAppContext } from '@/contexts/AppContext';
import { useOfflineQuran } from '@/hooks/useOfflineQuran';
import { formatAudioTime } from '@/services/audioService';

const { width: SW, height: SH } = Dimensions.get('window');
const VERSES_PER_PAGE = 5;

// ─── Page Flip Card ──────────────────────────────────────────────────────────
interface PageProps {
  verses: any[];
  translationVerses: any[];
  transliterationVerses: any[];
  arabicFontSize: number;
  showTransliteration: boolean;
  activeVerseIdx: number | null;
  surahId: number;
  pageIndex: number;
  isBookmarked: (sid: number, vn: number) => boolean;
  onBookmark: (verse: any, translation: any) => void;
}

function VersePage({
  verses, translationVerses, transliterationVerses,
  arabicFontSize, showTransliteration, activeVerseIdx,
  surahId, isBookmarked, onBookmark, pageIndex,
}: PageProps) {
  return (
    <View style={styles.pageContent}>
      {verses.map((verse, localIdx) => {
        const globalIdx = pageIndex * VERSES_PER_PAGE + localIdx;
        const translation = translationVerses[globalIdx];
        const translit = transliterationVerses[globalIdx];
        const isActive = activeVerseIdx === globalIdx;
        const bookmarked = isBookmarked(surahId, verse.numberInSurah);

        return (
          <View
            key={verse.number}
            style={[styles.verseItem, isActive && styles.verseItemActive]}
          >
            <View style={styles.verseHeader}>
              <View style={[styles.verseNumBadge, isActive && styles.verseNumBadgeActive]}>
                <Text style={[styles.verseNum, isActive && styles.verseNumActive]}>
                  {verse.numberInSurah}
                </Text>
              </View>
              <Pressable
                hitSlop={8}
                onPress={() => onBookmark(verse, translation)}
              >
                <MaterialIcons
                  name={bookmarked ? 'bookmark' : 'bookmark-border'}
                  size={18}
                  color={bookmarked ? Colors.primary : Colors.textSecondary}
                />
              </Pressable>
            </View>

            <Text style={[
              styles.arabicText,
              { fontSize: arabicFontSize },
              isActive && styles.arabicTextActive,
            ]}>
              {verse.text}
            </Text>

            {showTransliteration && translit ? (
              <Text style={styles.translitText}>{translit.text}</Text>
            ) : null}

            {translation ? (
              <Text style={[styles.translationText, isActive && styles.translationTextActive]}>
                {translation.text}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function SurahScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const surahId = Number(id) || 1;

  const { selectedTranslation, showTransliteration, arabicFontSize, setLastReadSurah } = useAppContext();
  const { addBookmark, removeBookmark, isBookmarked, translationEdition } = useAppContext();
  const { surahs } = useQuranSurahs();
  const { data, loading, error, reload } = useSurahDetail(surahId, translationEdition);
  const {
    audioState, isPlaying, isLoading: audioLoading, currentSurahId,
    progressRatio, positionText, durationText,
    selectedReciter,
    playSurah, togglePlayPause, stop, selectReciter,
    seekTo,
  } = useAudioPlayer();

  const { getState, isDownloadedSync, startDownload, cancelDelete } = useOfflineQuran(selectedReciter.id);

  const [currentPage, setCurrentPage] = useState(0);
  const [showReciterModal, setShowReciterModal] = useState(false);
  const [activeVerseIdx, setActiveVerseIdx] = useState<number | null>(null);

  // Animated values for page flip
  const flipAnim = useRef(new Animated.Value(0)).current;
  const isFlipping = useRef(false);
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const headerTranslate = useRef(new Animated.Value(0)).current;

  const surahMeta = surahs.find(s => s.id === surahId);
  const arabicVerses = data?.arabicVerses ?? [];
  const translationVerses = data?.translationVerses ?? [];
  const transliterationVerses = data?.transliterationVerses ?? [];
  const totalPages = Math.ceil(arabicVerses.length / VERSES_PER_PAGE);

  const isThisSurahPlaying = currentSurahId === surahId;
  const downloadState = getState(surahId);

  useEffect(() => { setLastReadSurah(surahId); }, [surahId]);

  // ── Verse sync from audio progress ───────────────────────────────────────
  useEffect(() => {
    if (!isThisSurahPlaying || arabicVerses.length === 0) {
      setActiveVerseIdx(null);
      return;
    }
    if (audioState.durationMs > 0 && audioState.positionMs > 0) {
      const ratio = audioState.positionMs / audioState.durationMs;
      const estimatedVerseIdx = Math.min(
        Math.floor(ratio * arabicVerses.length),
        arabicVerses.length - 1
      );
      setActiveVerseIdx(estimatedVerseIdx);
      // Auto-flip to the page containing active verse
      const targetPage = Math.floor(estimatedVerseIdx / VERSES_PER_PAGE);
      if (targetPage !== currentPage && !isFlipping.current) {
        animateFip(targetPage > currentPage ? 'next' : 'prev', targetPage);
      }
    }
  }, [audioState.positionMs, audioState.durationMs, arabicVerses.length, isThisSurahPlaying]);

  // ── Page flip animation ───────────────────────────────────────────────────
  const animateFip = useCallback((direction: 'next' | 'prev', targetPage: number) => {
    if (isFlipping.current) return;
    isFlipping.current = true;

    const startVal = direction === 'next' ? 0 : 0;
    const endVal = direction === 'next' ? 1 : -1;

    flipAnim.setValue(startVal);
    Animated.sequence([
      Animated.timing(flipAnim, {
        toValue: endVal,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentPage(targetPage);
      flipAnim.setValue(0);
      isFlipping.current = false;
    });
  }, [flipAnim]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      animateFip('next', currentPage + 1);
    }
  }, [currentPage, totalPages, animateFip]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 0) {
      animateFip('prev', currentPage - 1);
    }
  }, [currentPage, animateFip]);

  // ── Swipe gesture ─────────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20 && Math.abs(g.dy) < 60,
      onPanResponderRelease: (_, g) => {
        if (g.dx < -60) goToNextPage();
        else if (g.dx > 60) goToPrevPage();
      },
    })
  ).current;

  // ── Scroll header reveal ──────────────────────────────────────────────────
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((event: any) => {
    // No-op; pages are not scrolled individually, kept for future
  }, []);

  // ── Bookmark handler ─────────────────────────────────────────────────────
  const handleBookmark = useCallback((verse: any, translation: any) => {
    if (isBookmarked(surahId, verse.numberInSurah)) {
      removeBookmark(surahId, verse.numberInSurah);
    } else {
      addBookmark({
        surahId,
        verseNumber: verse.numberInSurah,
        surahName: surahMeta?.name ?? `Surah ${surahId}`,
        arabic: verse.text,
        translation: translation?.text ?? '',
        addedAt: new Date(),
      });
    }
  }, [surahId, surahMeta, isBookmarked, addBookmark, removeBookmark]);

  // ── Page flip interpolations ───────────────────────────────────────────
  const rotateY = flipAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['20deg', '0deg', '-20deg'],
  });
  const translateX = flipAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [SW * 0.15, 0, -SW * 0.15],
  });
  const pageOpacity = flipAnim.interpolate({
    inputRange: [-1, -0.5, 0, 0.5, 1],
    outputRange: [0, 0.3, 1, 0.3, 0],
  });

  const pageVerses = arabicVerses.slice(
    currentPage * VERSES_PER_PAGE,
    (currentPage + 1) * VERSES_PER_PAGE
  );

  const BOTTOM_PLAYER_HEIGHT = 100 + insets.bottom;

  return (
    <View style={styles.container}>
      {/* ── Animated Sticky Surah Name Header ── */}
      <Animated.View style={[styles.stickyHeader, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </Pressable>

        <Animated.View style={styles.headerCenter}>
          {surahMeta ? (
            <>
              <Text style={styles.headerSurahArabic}>{surahMeta.nameArabic}</Text>
              <Text style={styles.headerSurahName}>{surahMeta.name}</Text>
            </>
          ) : (
            <Text style={styles.headerSurahName}>Surah #{surahId}</Text>
          )}
        </Animated.View>

        <View style={styles.headerActions}>
          {/* Download button */}
          <Pressable
            hitSlop={8}
            onPress={() => {
              if (downloadState.status === 'done') {
                cancelDelete(surahId);
              } else if (downloadState.status !== 'downloading') {
                startDownload(surahId);
              }
            }}
            style={styles.headerIconBtn}
          >
            {downloadState.status === 'downloading' ? (
              <View style={styles.downloadProgress}>
                <Text style={styles.downloadPct}>{Math.round(downloadState.progress * 100)}%</Text>
              </View>
            ) : (
              <MaterialIcons
                name={downloadState.status === 'done' ? 'download-done' : 'download'}
                size={22}
                color={downloadState.status === 'done' ? Colors.success : Colors.textSecondary}
              />
            )}
          </Pressable>

          {/* Play/Pause */}
          <Pressable
            hitSlop={8}
            onPress={() => isThisSurahPlaying ? togglePlayPause() : playSurah(surahId)}
            style={styles.headerIconBtn}
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
      </Animated.View>

      {/* ── Bismillah ── */}
      {surahId !== 9 && currentPage === 0 ? (
        <View style={[styles.bismillah, { marginTop: 60 + insets.top }]}>
          {surahId !== 1 ? (
            <Text style={styles.bismillahText}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
          ) : null}
          {surahMeta ? (
            <View style={styles.surahIntro}>
              <Text style={styles.surahIntroArabic}>{surahMeta.nameArabic}</Text>
              <Text style={styles.surahIntroMeaning}>{surahMeta.meaning}</Text>
              <Text style={styles.surahIntroMeta}>{surahMeta.verses} verses · {surahMeta.revelation}</Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={{ height: 60 + insets.top }} />
      )}

      {/* ── Content ── */}
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
        <View style={styles.bookArea} {...panResponder.panHandlers}>
          {/* Page Flip Animated Container */}
          <Animated.View style={[
            styles.pageContainer,
            {
              transform: [
                { perspective: 1200 },
                { rotateY },
                { translateX },
              ],
              opacity: pageOpacity,
            },
          ]}>
            {/* Mushaf Page Style */}
            <View style={styles.mushafPage}>
              {/* Page ornament top */}
              <View style={styles.pageOrnamentTop}>
                <View style={styles.ornamentLine} />
                <MaterialIcons name="star" size={10} color={Colors.primary} />
                <View style={styles.ornamentLine} />
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.pageScroll, { paddingBottom: BOTTOM_PLAYER_HEIGHT }]}
              >
                {pageVerses.length > 0 ? (
                  <VersePage
                    verses={pageVerses}
                    translationVerses={translationVerses}
                    transliterationVerses={transliterationVerses}
                    arabicFontSize={arabicFontSize}
                    showTransliteration={showTransliteration}
                    activeVerseIdx={activeVerseIdx}
                    surahId={surahId}
                    pageIndex={currentPage}
                    isBookmarked={isBookmarked}
                    onBookmark={handleBookmark}
                  />
                ) : (
                  <View style={styles.center}>
                    <ActivityIndicator color={Colors.primary} />
                  </View>
                )}
              </ScrollView>

              {/* Page ornament bottom */}
              <View style={styles.pageOrnamentBottom}>
                <View style={styles.ornamentLine} />
                <Text style={styles.pageNum}>{currentPage + 1} / {totalPages}</Text>
                <View style={styles.ornamentLine} />
              </View>
            </View>
          </Animated.View>

          {/* Left/Right tap zones */}
          <Pressable
            style={styles.tapZoneLeft}
            onPress={goToPrevPage}
            hitSlop={0}
          >
            {currentPage > 0 ? (
              <View style={styles.pageArrow}>
                <MaterialIcons name="chevron-right" size={24} color={Colors.primary + '88'} />
              </View>
            ) : null}
          </Pressable>
          <Pressable
            style={styles.tapZoneRight}
            onPress={goToNextPage}
            hitSlop={0}
          >
            {currentPage < totalPages - 1 ? (
              <View style={styles.pageArrow}>
                <MaterialIcons name="chevron-left" size={24} color={Colors.primary + '88'} />
              </View>
            ) : null}
          </Pressable>
        </View>
      )}

      {/* ── Bottom Audio Player ── */}
      {isThisSurahPlaying ? (
        <View style={[styles.bottomPlayer, { paddingBottom: insets.bottom + 8 }]}>
          {/* Reciter selector */}
          <View style={styles.bottomPlayerTop}>
            <Pressable onPress={() => setShowReciterModal(true)} style={styles.reciterRow}>
              <View style={styles.reciterAvatar}>
                <MaterialIcons name="person" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.reciterNameText} numberOfLines={1}>{selectedReciter.name}</Text>
              <MaterialIcons name="keyboard-arrow-up" size={16} color={Colors.textSecondary} />
            </Pressable>

            {/* Verse indicator */}
            {activeVerseIdx !== null ? (
              <View style={styles.verseIndicator}>
                <Text style={styles.verseIndicatorText}>
                  آية {arabicVerses[activeVerseIdx]?.numberInSurah ?? '—'}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Progress bar */}
          <View style={styles.progressRow}>
            <Text style={styles.audioTime}>{positionText}</Text>
            <Pressable
              style={styles.progressTrack}
              onPress={(e) => {
                const { locationX } = e.nativeEvent;
                const trackWidth = SW - Spacing.md * 2 - 80;
                const ratio = Math.max(0, Math.min(1, locationX / trackWidth));
                if (audioState.durationMs > 0) {
                  seekTo(ratio * audioState.durationMs);
                }
              }}
            >
              <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
              <View style={[styles.progressThumb, { left: `${Math.min(97, progressRatio * 100)}%` }]} />
            </Pressable>
            <Text style={styles.audioTime}>{durationText}</Text>
          </View>

          {/* Controls */}
          <View style={styles.playerControls}>
            <Pressable onPress={stop} hitSlop={8}>
              <MaterialIcons name="stop" size={22} color={Colors.textSecondary} />
            </Pressable>
            <Pressable
              onPress={() => seekTo(Math.max(0, audioState.positionMs - 10000))}
              hitSlop={8}
            >
              <MaterialIcons name="replay-10" size={26} color={Colors.textPrimary} />
            </Pressable>
            <Pressable onPress={togglePlayPause} style={styles.playBtnLarge}>
              <MaterialIcons
                name={isPlaying ? 'pause' : 'play-arrow'}
                size={30}
                color={Colors.background}
              />
            </Pressable>
            <Pressable
              onPress={() => seekTo(Math.min(audioState.durationMs, audioState.positionMs + 10000))}
              hitSlop={8}
            >
              <MaterialIcons name="forward-10" size={26} color={Colors.textPrimary} />
            </Pressable>
            <Pressable
              onPress={() => {
                if (surahId < 114) {
                  router.replace(`/surah/${surahId + 1}` as any);
                }
              }}
              hitSlop={8}
            >
              <MaterialIcons name="skip-next" size={22} color={Colors.textSecondary} />
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* ── Reciter Modal ── */}
      <Modal visible={showReciterModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowReciterModal(false)}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Reciter — اختر القارئ</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {DEFAULT_RECITERS.map(r => (
                <Pressable
                  key={r.id}
                  style={[styles.reciterOption, selectedReciter.id === r.id && styles.reciterOptionActive]}
                  onPress={() => { selectReciter(r.id); setShowReciterModal(false); }}
                >
                  <View style={styles.reciterAvatarModal}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // ── Sticky Header ──────────────────────────────────────────────────────────
  stickyHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.background + 'F5',
    paddingHorizontal: Spacing.sm, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.primary + '33',
  },
  backBtn: { padding: 8, minWidth: 40 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerSurahArabic: { fontSize: Typography.arabicSM, color: Colors.textArabic, lineHeight: 22 },
  headerSurahName: { fontSize: Typography.caption, color: Colors.textSecondary, marginTop: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 80, justifyContent: 'flex-end' },
  headerIconBtn: { padding: 6 },
  downloadProgress: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  downloadPct: { fontSize: 8, color: Colors.primary, fontWeight: '700' },

  // ── Bismillah / Surah Intro ───────────────────────────────────────────────
  bismillah: {
    alignItems: 'center', paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
  },
  bismillahText: {
    fontSize: 20, color: Colors.textArabic, letterSpacing: 1, marginBottom: 8,
  },
  surahIntro: { alignItems: 'center', paddingTop: 4 },
  surahIntroArabic: { fontSize: Typography.arabicLG, color: Colors.primary },
  surahIntroMeaning: { fontSize: Typography.caption, color: Colors.textSecondary, fontStyle: 'italic', marginTop: 4 },
  surahIntroMeta: { fontSize: Typography.small, color: Colors.textMuted, marginTop: 3 },

  // ── Book Area ──────────────────────────────────────────────────────────────
  bookArea: {
    flex: 1, position: 'relative',
  },
  pageContainer: {
    flex: 1, marginHorizontal: 6, marginVertical: 4,
  },
  mushafPage: {
    flex: 1,
    backgroundColor: '#0F1419',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '33',
    overflow: 'hidden',
    // Mushaf-like shadow
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  pageOrnamentTop: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.primary + '22',
    gap: 6,
  },
  pageOrnamentBottom: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md,
    paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.primary + '22',
    gap: 6,
  },
  ornamentLine: { flex: 1, height: 1, backgroundColor: Colors.primary + '44' },
  pageNum: { fontSize: Typography.small, color: Colors.primary + 'AA', fontWeight: '600' },
  pageScroll: { paddingHorizontal: Spacing.md, paddingTop: 8 },
  pageContent: { gap: 2 },

  // Tap zones for page navigation
  tapZoneLeft: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 44,
    justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 8,
  },
  tapZoneRight: {
    position: 'absolute', right: 0, top: 0, bottom: 0, width: 44,
    justifyContent: 'center', alignItems: 'flex-end', paddingRight: 8,
  },
  pageArrow: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.overlayLight, alignItems: 'center', justifyContent: 'center',
  },

  // ── Verse Items ───────────────────────────────────────────────────────────
  verseItem: {
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
    paddingHorizontal: 2,
  },
  verseItemActive: {
    backgroundColor: Colors.primary + '10',
    borderRadius: Radius.sm,
    borderLeftWidth: 3, borderLeftColor: Colors.primary,
    paddingLeft: 8,
    borderBottomColor: Colors.primary + '33',
  },
  verseHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6,
  },
  verseNumBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.overlayLight, borderWidth: 1, borderColor: Colors.primary + '44',
    alignItems: 'center', justifyContent: 'center',
  },
  verseNumBadgeActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  verseNum: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  verseNumActive: { color: Colors.background },
  arabicText: {
    color: Colors.textArabic, textAlign: 'right', lineHeight: 46,
    writingDirection: 'rtl', marginBottom: 6,
  },
  arabicTextActive: { color: Colors.primaryLight },
  translitText: {
    fontSize: Typography.small, color: Colors.textSecondary,
    fontStyle: 'italic', marginBottom: 4, lineHeight: 18,
  },
  translationText: { fontSize: Typography.body, color: Colors.textPrimary, lineHeight: 22 },
  translationTextActive: { color: Colors.textPrimary },

  // ── Bottom Player ─────────────────────────────────────────────────────────
  bottomPlayer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1, borderTopColor: Colors.primary + '44',
    paddingTop: 10,
    paddingHorizontal: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomPlayerTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8,
  },
  reciterRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  reciterAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.overlayLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primary + '44',
  },
  reciterNameText: { fontSize: Typography.caption, color: Colors.textSecondary, flex: 1 },
  verseIndicator: {
    backgroundColor: Colors.primary + '22', borderRadius: Radius.round,
    paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: Colors.primary + '44',
  },
  verseIndicatorText: { fontSize: Typography.small, color: Colors.primary, fontWeight: '700' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  audioTime: { fontSize: Typography.small, color: Colors.textMuted, minWidth: 36, textAlign: 'center' },
  progressTrack: {
    flex: 1, height: 5, backgroundColor: Colors.surfaceBorder, borderRadius: 3,
    overflow: 'visible', justifyContent: 'center',
  },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  progressThumb: {
    position: 'absolute', width: 12, height: 12, borderRadius: 6,
    backgroundColor: Colors.primary, top: -3.5, marginLeft: -6,
    borderWidth: 2, borderColor: Colors.background,
  },
  playerControls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
  },
  playBtnLarge: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },

  // ── Modals ───────────────────────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.md, maxHeight: '70%',
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.surfaceBorder, alignSelf: 'center', marginBottom: Spacing.md },
  modalTitle: { fontSize: Typography.h3, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  reciterOption: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.sm + 4, borderRadius: Radius.md, marginBottom: 4,
  },
  reciterOptionActive: { backgroundColor: Colors.overlayLight },
  reciterAvatarModal: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.overlayLight,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.primary + '44',
  },
  reciterOptionName: { fontSize: Typography.body, color: Colors.textPrimary },
  reciterOptionNameAr: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 2 },

  // ── Misc ─────────────────────────────────────────────────────────────────
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.xl },
  loadText: { fontSize: Typography.body, color: Colors.textSecondary },
  errText: { fontSize: Typography.body, color: Colors.textSecondary, textAlign: 'center' },
  retryBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { fontSize: Typography.body, fontWeight: '700', color: Colors.background },
});
