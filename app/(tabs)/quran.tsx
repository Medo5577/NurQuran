// Powered by OnSpace.AI
import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TextInput, StyleSheet, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { SURAHS, Surah } from '@/constants/quranData';
import SurahListItem from '@/components/feature/SurahListItem';

const FILTER_TABS = ['All', 'Meccan', 'Medinan', 'Bookmarked'];

export default function QuranScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const filteredSurahs = useMemo(() => {
    let list = SURAHS;
    if (activeTab === 'Meccan') list = list.filter(s => s.revelation === 'Meccan');
    else if (activeTab === 'Medinan') list = list.filter(s => s.revelation === 'Medinan');
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.nameArabic.includes(q) ||
        s.meaning.toLowerCase().includes(q)
      );
    }
    return list;
  }, [query, activeTab]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Al-Quran Al-Kareem</Text>
          <Text style={styles.titleAr}>القرآن الكريم</Text>
        </View>
        <Pressable style={styles.settingsBtn}>
          <MaterialIcons name="settings" size={22} color={Colors.textSecondary} />
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search surah name or meaning..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
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
      </View>

      {/* Surah List */}
      <FlatList
        data={filteredSurahs}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <SurahListItem
            surah={item}
            onPress={() => router.push(`/surah/${item.id}` as any)}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="search-off" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No surahs found</Text>
          </View>
        }
        contentContainerStyle={filteredSurahs.length === 0 ? { flex: 1 } : undefined}
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
  title: {
    fontSize: Typography.h2,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  titleAr: {
    fontSize: Typography.caption,
    color: Colors.primary,
    marginTop: 2,
  },
  settingsBtn: {
    padding: 8,
  },
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
  searchInput: {
    flex: 1,
    fontSize: Typography.body,
    color: Colors.textPrimary,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.round,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  activeTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.caption,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.background,
    fontWeight: Typography.bold,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.body,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
});
