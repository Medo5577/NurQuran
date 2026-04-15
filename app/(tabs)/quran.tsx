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

const FILTER_TABS = ['All', 'Meccan', 'Medinan'];

function SurahRow({ surah, onPress }: { surah: SurahMeta; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.surahRow, pressed && { opacity: 0.75 }]}
      onPress={onPress}
    >
      <View style={styles.surahNumBox}>
        <Text style={styles.surahNum}>{surah.number}</Text>
      </View>
      <View style={styles.surahInfo}>
        <Text style={styles.surahName}>{surah.name}</Text>
        <Text style={styles.surahMeta}>{surah.verses} verses • {surah.revelation}</Text>
        <Text style={styles.surahMeaning} numberOfLines={1}>{surah.meaning}</Text>
      </View>
      <View style={styles.surahRight}>
        <Text style={styles.surahArabic}>{surah.nameArabic}</Text>
      </View>
    </Pressable>
  );
}

export default function QuranScreen() {
  const router = useRouter();
  const { surahs, loading, error, reload } = useQuranSurahs();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const filtered = useMemo(() => {
    let list = surahs;
    if (activeTab === 'Meccan') list = list.filter(s => s.revelation === 'Meccan');
    else if (activeTab === 'Medinan') list = list.filter(s => s.revelation === 'Medinan');
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
  }, [surahs, query, activeTab]);

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
          <Pressable style={styles.iconBtn} onPress={reload}>
            <MaterialIcons name="refresh" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>
      </View>

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
          </Pressable>
        ))}
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filtered.length}</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <MaterialIcons name="wifi-off" size={20} color={Colors.error} />
          <Text style={styles.errorText}>Using cached data. {error}</Text>
          <Pressable onPress={reload}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <SurahRow surah={item} onPress={() => router.push(`/surah/${item.id}` as any)} />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading from Quran API...</Text>
            </View>
          ) : (
            <View style={styles.center}>
              <MaterialIcons name="search-off" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No surahs found</Text>
            </View>
          )
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={filtered.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  title: { fontSize: Typography.h2, fontWeight: Typography.bold, color: Colors.textPrimary },
  titleAr: { fontSize: Typography.caption, color: Colors.primary, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { padding: 6 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 10,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  searchInput: { flex: 1, fontSize: Typography.body, color: Colors.textPrimary },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: Radius.round,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  activeTab: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: Typography.caption, fontWeight: Typography.medium, color: Colors.textSecondary },
  activeTabText: { color: Colors.background, fontWeight: Typography.bold },
  countBadge: {
    marginLeft: 'auto',
    backgroundColor: Colors.overlayLight,
    borderRadius: Radius.round,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  countText: { fontSize: Typography.small, color: Colors.primary, fontWeight: Typography.bold },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.error + '15',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.error + '44',
  },
  errorText: { flex: 1, fontSize: Typography.small, color: Colors.textSecondary },
  retryText: { fontSize: Typography.small, color: Colors.primary, fontWeight: Typography.bold },
  surahRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  surahNumBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.overlayLight,
    borderWidth: 1,
    borderColor: Colors.primary + '55',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  surahNum: { fontSize: Typography.caption, fontWeight: Typography.bold, color: Colors.primary },
  surahInfo: { flex: 1 },
  surahName: { fontSize: Typography.body, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  surahMeta: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 2 },
  surahMeaning: { fontSize: Typography.small, color: Colors.textMuted, fontStyle: 'italic', marginTop: 1 },
  surahRight: { alignItems: 'flex-end', marginLeft: Spacing.sm },
  surahArabic: { fontSize: Typography.arabicSM, color: Colors.textArabic },
  separator: { height: 1, backgroundColor: Colors.surfaceBorder, marginHorizontal: Spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  loadingText: { fontSize: Typography.body, color: Colors.textSecondary, marginTop: Spacing.sm },
  emptyText: { fontSize: Typography.body, color: Colors.textMuted, marginTop: Spacing.sm },
});
