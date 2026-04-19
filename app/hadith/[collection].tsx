// Powered by OnSpace.AI
// Real Hadith from hadith.gading.dev API with search + infinite scroll

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, StyleSheet, Pressable,
  ActivityIndicator, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useHadithCollection, HADITH_COLLECTIONS_META } from '@/hooks/useHadith';
import type { HadithItem } from '@/services/hadithApiService';

function HadithCard({ hadith, collectionColor }: { hadith: HadithItem; collectionColor: string }) {
  const [expanded, setExpanded] = useState(false);
  const MAX_CHARS = 220;
  const longTranslation = hadith.id.length > MAX_CHARS;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${hadith.arab}\n\n${hadith.id}\n\nHadith #${hadith.number}`,
        title: `Hadith #${hadith.number}`,
      });
    } catch {}
  };

  return (
    <View style={styles.hadithCard}>
      {/* Number badge */}
      <View style={styles.hadithHeader}>
        <View style={[styles.hadithNum, { borderColor: collectionColor + '88' }]}>
          <Text style={[styles.hadithNumText, { color: collectionColor }]}>{hadith.number}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={[styles.authBadge, { backgroundColor: collectionColor + '15' }]}>
            <Text style={[styles.authText, { color: collectionColor }]}>Hadith #{hadith.number}</Text>
          </View>
        </View>
        <Pressable onPress={handleShare} hitSlop={8}>
          <MaterialIcons name="share" size={18} color={Colors.textSecondary} />
        </Pressable>
      </View>

      {/* Arabic text */}
      <Text style={styles.hadithArabic}>{hadith.arab}</Text>

      {/* Divider */}
      <View style={[styles.hadithDivider, { backgroundColor: collectionColor + '33' }]} />

      {/* Translation */}
      <Text style={styles.hadithTranslation} numberOfLines={expanded ? undefined : 4}>
        {hadith.id}
      </Text>

      {longTranslation ? (
        <Pressable onPress={() => setExpanded(e => !e)} style={styles.expandBtn}>
          <Text style={styles.expandText}>{expanded ? 'Show less' : 'Read more'}</Text>
          <MaterialIcons
            name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={16}
            color={Colors.primary}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

export default function HadithCollectionScreen() {
  const { collection } = useLocalSearchParams<{ collection: string }>();
  const router = useRouter();

  const {
    hadiths, loading, loadingMore, error, hasMore, meta,
    searchQuery, setSearchQuery, loadMore, reload,
  } = useHadithCollection(collection ?? 'bukhari');

  const collectionColor = meta?.color ?? Colors.primary;

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.footerText}>Loading more hadiths...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: collectionColor + '44' }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{meta?.name ?? 'Hadith'}</Text>
          <Text style={styles.titleAr}>{meta?.nameArabic ?? ''}</Text>
        </View>
        <Pressable onPress={reload} hitSlop={8}>
          <MaterialIcons name="refresh" size={22} color={loading ? collectionColor : Colors.textSecondary} />
        </Pressable>
      </View>

      {/* Meta info */}
      {meta ? (
        <View style={[styles.metaBar, { borderLeftColor: collectionColor }]}>
          <Text style={styles.metaAuthor}>{meta.author}</Text>
          <View style={[styles.totalBadge, { backgroundColor: collectionColor + '15' }]}>
            <Text style={[styles.totalText, { color: collectionColor }]}>
              {meta.total.toLocaleString()} hadiths
            </Text>
          </View>
        </View>
      ) : null}

      {/* Search */}
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search hadiths..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search hadiths"
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <MaterialIcons name="close" size={16} color={Colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errBanner}>
          <MaterialIcons name="wifi-off" size={14} color={Colors.error} />
          <Text style={styles.errText}>{error}</Text>
          <Pressable onPress={reload}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={hadiths}
        keyExtractor={item => `${item.number}`}
        renderItem={({ item }) => (
          <HadithCard hadith={item} collectionColor={collectionColor} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={collectionColor} />
              <Text style={styles.loadText}>Loading {meta?.name}...</Text>
            </View>
          ) : (
            <View style={styles.center}>
              <MaterialIcons name="search-off" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No hadiths found</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontSize: Typography.h4, fontWeight: '700', color: Colors.textPrimary },
  titleAr: { fontSize: Typography.small, color: Colors.primary, marginTop: 2 },
  metaBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderLeftWidth: 3, marginHorizontal: Spacing.md, marginTop: 8,
    backgroundColor: Colors.surface, borderRadius: Radius.sm,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  metaAuthor: { fontSize: Typography.caption, color: Colors.textSecondary, flex: 1, flexWrap: 'wrap' },
  totalBadge: { borderRadius: Radius.round, paddingHorizontal: 10, paddingVertical: 4 },
  totalText: { fontSize: Typography.caption, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    marginHorizontal: Spacing.md, marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm + 4, paddingVertical: 10,
    gap: Spacing.sm, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  searchInput: { flex: 1, fontSize: Typography.body, color: Colors.textPrimary },
  errBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: Spacing.md, marginBottom: 4, padding: 8,
    backgroundColor: Colors.error + '15', borderRadius: Radius.sm,
  },
  errText: { flex: 1, fontSize: Typography.small, color: Colors.textSecondary },
  retryText: { fontSize: Typography.small, color: Colors.primary, fontWeight: '700' },
  listContent: { paddingHorizontal: Spacing.md, paddingBottom: 30 },
  hadithCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  hadithHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  hadithNum: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.overlayLight, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  hadithNumText: { fontSize: Typography.caption, fontWeight: '700' },
  authBadge: { borderRadius: Radius.round, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  authText: { fontSize: Typography.small, fontWeight: '600' },
  hadithArabic: {
    fontSize: 19, color: Colors.textArabic, textAlign: 'right',
    lineHeight: 36, writingDirection: 'rtl', marginBottom: Spacing.sm,
  },
  hadithDivider: { height: 1, marginVertical: Spacing.sm },
  hadithTranslation: {
    fontSize: Typography.body, color: Colors.textPrimary, lineHeight: 23,
  },
  expandBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6,
    alignSelf: 'flex-start',
  },
  expandText: { fontSize: Typography.caption, color: Colors.primary, fontWeight: '600' },
  footerLoader: { alignItems: 'center', paddingVertical: Spacing.md, gap: 6, flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontSize: Typography.caption, color: Colors.textSecondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.xl, minHeight: 300 },
  loadText: { fontSize: Typography.body, color: Colors.textSecondary },
  emptyText: { fontSize: Typography.body, color: Colors.textMuted },
});
