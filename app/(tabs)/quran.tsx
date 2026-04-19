// Powered by OnSpace.AI
import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TextInput, StyleSheet, Pressable, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useQuranSurahs, SurahMeta } from '@/hooks/useQuran';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useOfflineQuran } from '@/hooks/useOfflineQuran';

const FILTER_TABS = ['All', 'Meccan', 'Medinan', 'Downloaded'];

function SurahRow({
  surah, onPress, onPlay, isPlaying, downloadStatus, onDownload,
}: {
  surah: SurahMeta;
  onPress: () => void;
  onPlay: () => void;
  isPlaying: boolean;
  downloadStatus: 'none' | 'downloading' | 'done' | 'error';
  onDownload: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.surahRow, isPlaying && styles.surahRowActive, pressed && { opacity: 0.75 }]}
      onPress={onPress}
    >
      <View style={[styles.surahNumBox, isPlaying && styles.surahNumBoxActive]}>
        <Text style={[styles.surahNum, isPlaying && styles.surahNumActive]}>{surah.number}</Text>
      </View>
      <View style={styles.surahInfo}>
        <Text style={[styles.surahName, isPlaying && { color: Colors.primary }]}>{surah.name}</Text>
        <Text style={styles.surahMeta}>{surah.verses} verses · {surah.revelation}</Text>
        <Text style={styles.surahMeaning} numberOfLines={1}>{surah.meaning}</Text>
      </View>
      <View style={styles.surahRight}>
        <Text style={styles.surahArabic}>{surah.nameArabic}</Text>
        <View style={styles.actionRow}>
          {/* Download indicator */}
          <Pressable
            hitSlop={8}
            onPress={e => { e.stopPropagation(); onDownload(); }}
            style={styles.actionBtn}
          >
            {downloadStatus === 'downloading' ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <MaterialIcons
                name={downloadStatus === 'done' ? 'download-done' : 'download-for-offline'}
                size={18}
                color={downloadStatus === 'done' ? Colors.success : Colors.textMuted}
              />
            )}
          </Pressable>
          {/* Play button */}
          <Pressable hitSlop={8} onPress={e => { e.stopPropagation(); onPlay(); }} style={styles.actionBtn}>
            <MaterialIcons
              name={isPlaying ? 'pause-circle' : 'play-circle'}
              size={22}
              color={isPlaying ? Colors.primary : Colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export default function QuranScreen() {
  const router = useRouter();
  const { surahs, loading, error, reload } = useQuranSurahs();
  const { audioState, isPlaying, currentSurahId, playSurah, togglePlayPause } = useAudioPlayer();
  const { getState, isDownloadedSync, startDownload, cancelDelete, totalSizeFormatted, downloadCount } = useOfflineQuran();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const filtered = useMemo(() => {
    let list = surahs;
    if (activeTab === 'Meccan') list = list.filter(s => s.revelation === 'Meccan');
    else if (activeTab === 'Medinan') list = list.filter(s => s.revelation === 'Medinan');
    else if (activeTab === 'Downloaded') list = list.filter(s => isDownloadedSync(s.id));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.nameArabic.includes(q) ||
        s.meaning.toLowerCase().includes(q) ||
        String(s.number).includes(q)
      );
    }
    return list;
  }, [surahs, query, activeTab, getState]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Al-Quran Al-Kareem</Text>
          <Text style={styles.titleAr}>القرآن الكريم</Text>
        </View>
        <View style={styles.headerRight}>
          {loading ? <ActivityIndicator size="small" color={Colors.primary} /> : null}
          {downloadCount > 0 ? (
            <View style={styles.downloadBadge}>
              <MaterialIcons name="download-done" size={12} color={Colors.success} />
              <Text style={styles.downloadBadgeText}>{downloadCount}</Text>
            </View>
          ) : null}
          <Pressable style={styles.iconBtn} onPress={reload}>
            <MaterialIcons name="refresh" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Now Playing Mini Bar */}
      {currentSurahId !== null ? (
        <Pressable
          style={styles.nowPlayingBar}
          onPress={() => router.push(`/surah/${currentSurahId}` as any)}
        >
          <View style={styles.waveIcon}>
            <MaterialIcons name="graphic-eq" size={16} color={Colors.background} />
          </View>
          <Text style={styles.nowPlayingText} numberOfLines={1}>
            {isPlaying ? 'Playing' : 'Paused'} — Surah #{currentSurahId}
          </Text>
          <View style={styles.progressBarMini}>
            <View style={[styles.progressFillMini, { width: `${(audioState.positionMs / Math.max(1, audioState.durationMs)) * 100}%` }]} />
          </View>
          <Pressable onPress={togglePlayPause} hitSlop={8}>
            <MaterialIcons name={isPlaying ? 'pause' : 'play-arrow'} size={22} color={Colors.primary} />
          </Pressable>
        </Pressable>
      ) : null}

      {/* Search */}
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search surah name, number or meaning..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="Search surahs"
        />
        {query.length > 0 ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <MaterialIcons name="close" size={18} color={Colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabs}>
        {FILTER_TABS.map(tab => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            {tab === 'Downloaded' && downloadCount > 0 ? (
              <View style={styles.tabCountBadge}>
                <Text style={styles.tabCountText}>{downloadCount}</Text>
              </View>
            ) : null}
          </Pressable>
        ))}
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filtered.length}</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <MaterialIcons name="wifi-off" size={16} color={Colors.warning} />
          <Text style={styles.errorText}>Using cached data</Text>
          <Pressable onPress={reload}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Surah List */}
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => {
          const dlState = getState(item.id);
          const playing = currentSurahId === item.id && isPlaying;
          return (
            <SurahRow
              surah={item}
              onPress={() => router.push(`/surah/${item.id}` as any)}
              onPlay={() => {
                if (currentSurahId === item.id) togglePlayPause();
                else playSurah(item.id);
              }}
              isPlaying={playing}
              downloadStatus={dlState.status}
              onDownload={() => {
                if (dlState.status === 'done') cancelDelete(item.id);
                else if (dlState.status !== 'downloading') startDownload(item.id);
              }}
            />
          );
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading from Quran API...</Text>
            </View>
          ) : (
            <View style={styles.center}>
              <MaterialIcons name={activeTab === 'Downloaded' ? 'download-for-offline' : 'search-off'} size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>
                {activeTab === 'Downloaded' ? 'No downloaded surahs yet' : 'No surahs found'}
              </Text>
              {activeTab === 'Downloaded' ? (
                <Text style={styles.emptyHint}>Tap the download icon next to any surah</Text>
              ) : null}
            </View>
          )
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={filtered.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
      />

      {/* Storage info footer */}
      {downloadCount > 0 ? (
        <View style={styles.storageFooter}>
          <MaterialIcons name="storage" size={14} color={Colors.textMuted} />
          <Text style={styles.storageText}>{downloadCount} surahs · {totalSizeFormatted} stored</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  title: { fontSize: Typography.h2, fontWeight: '700', color: Colors.textPrimary },
  titleAr: { fontSize: Typography.caption, color: Colors.primary, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  downloadBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.success + '20', borderRadius: Radius.round,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  downloadBadgeText: { fontSize: Typography.small, color: Colors.success, fontWeight: '700' },
  iconBtn: { padding: 6 },
  nowPlayingBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: 8,
  },
  waveIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
  nowPlayingText: { flex: 1, fontSize: Typography.caption, fontWeight: '600', color: Colors.background },
  progressBarMini: { width: 60, height: 3, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 2 },
  progressFillMini: { height: '100%', backgroundColor: Colors.background, borderRadius: 2 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm + 4, paddingVertical: 10,
    gap: Spacing.sm, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  searchInput: { flex: 1, fontSize: Typography.body, color: Colors.textPrimary },
  tabs: {
    flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.xs,
    marginBottom: Spacing.sm, alignItems: 'center', flexWrap: 'wrap',
  },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.round,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  activeTab: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: Typography.caption, fontWeight: '500', color: Colors.textSecondary },
  activeTabText: { color: Colors.background, fontWeight: '700' },
  tabCountBadge: {
    backgroundColor: Colors.success, borderRadius: Radius.round,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  tabCountText: { fontSize: 9, color: Colors.background, fontWeight: '700' },
  countBadge: {
    marginLeft: 'auto', backgroundColor: Colors.overlayLight, borderRadius: Radius.round,
    paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.primary + '44',
  },
  countText: { fontSize: Typography.small, color: Colors.primary, fontWeight: '700' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm, padding: Spacing.sm,
    backgroundColor: Colors.warning + '15', borderRadius: Radius.sm,
  },
  errorText: { flex: 1, fontSize: Typography.small, color: Colors.textSecondary },
  retryText: { fontSize: Typography.small, color: Colors.primary, fontWeight: '700' },
  surahRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  surahRowActive: { backgroundColor: Colors.overlayLight },
  surahNumBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.overlayLight, borderWidth: 1, borderColor: Colors.primary + '55',
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm,
  },
  surahNumBoxActive: { backgroundColor: Colors.primary + '22', borderColor: Colors.primary },
  surahNum: { fontSize: Typography.caption, fontWeight: '700', color: Colors.primary },
  surahNumActive: { color: Colors.primary },
  surahInfo: { flex: 1 },
  surahName: { fontSize: Typography.body, fontWeight: '600', color: Colors.textPrimary },
  surahMeta: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 2 },
  surahMeaning: { fontSize: Typography.small, color: Colors.textMuted, fontStyle: 'italic', marginTop: 1 },
  surahRight: { alignItems: 'flex-end', marginLeft: Spacing.sm },
  surahArabic: { fontSize: Typography.arabicSM, color: Colors.textArabic, marginBottom: 4 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionBtn: { padding: 2 },
  separator: { height: 1, backgroundColor: Colors.surfaceBorder, marginHorizontal: Spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  loadingText: { fontSize: Typography.body, color: Colors.textSecondary, marginTop: Spacing.sm },
  emptyText: { fontSize: Typography.body, color: Colors.textMuted, marginTop: Spacing.sm },
  emptyHint: { fontSize: Typography.caption, color: Colors.textMuted, marginTop: 4, textAlign: 'center' },
  storageFooter: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: Colors.surfaceBorder,
  },
  storageText: { fontSize: Typography.small, color: Colors.textMuted },
});
