// Powered by OnSpace.AI
import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Vibration,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useAdhkar } from '@/hooks/useAdhkar';
import { useAppContext } from '@/contexts/AppContext';
import IslamicCard from '@/components/ui/IslamicCard';

function AdhkarCard({ item, isFavorite, onToggleFave }: {
  item: any; isFavorite: boolean; onToggleFave: () => void;
}) {
  const [tapped, setTapped] = useState(0);

  const handleTap = () => {
    if (tapped < item.count) {
      setTapped(p => p + 1);
      Vibration.vibrate(15);
    }
  };

  return (
    <IslamicCard style={styles.adhkarCard}>
      {item.count > 1 ? (
        <View style={styles.countRow}>
          <Pressable onPress={handleTap} style={styles.tapCounter}>
            <Text style={styles.tapCount}>{tapped}/{item.count}</Text>
          </Pressable>
          <Pressable onPress={onToggleFave} hitSlop={8}>
            <MaterialIcons
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={20}
              color={isFavorite ? Colors.error : Colors.textSecondary}
            />
          </Pressable>
        </View>
      ) : (
        <View style={styles.countRow}>
          <View style={styles.onceBadge}>
            <Text style={styles.onceBadgeText}>×1</Text>
          </View>
          <Pressable onPress={onToggleFave} hitSlop={8}>
            <MaterialIcons
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={20}
              color={isFavorite ? Colors.error : Colors.textSecondary}
            />
          </Pressable>
        </View>
      )}
      <Text style={styles.arabicText}>{item.content}</Text>
      {item.description ? (
        <Text style={styles.descText}>{item.description}</Text>
      ) : null}
      {item.reference ? (
        <Text style={styles.refText}>{item.reference}</Text>
      ) : null}
    </IslamicCard>
  );
}

export default function AzkarScreen() {
  const { categories, loading, error, selectedCategory, setSelectedCategory, activeCategory } = useAdhkar();
  const { isAzkarFavorite, toggleFavoriteAzkar } = useAppContext();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Azkar & Duas</Text>
          <Text style={styles.titleAr}>الأذكار والأدعية</Text>
        </View>
        {loading ? <ActivityIndicator size="small" color={Colors.primary} /> : null}
      </View>

      {error ? (
        <View style={styles.errBanner}>
          <MaterialIcons name="info-outline" size={14} color={Colors.warning} />
          <Text style={styles.errText}>Using offline data</Text>
        </View>
      ) : null}

      {/* Category Chips */}
      <View style={styles.catOuter}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          {categories.map(cat => (
            <Pressable
              key={cat.categoryId}
              style={[styles.catChip, selectedCategory === cat.categoryId && styles.catChipActive]}
              onPress={() => setSelectedCategory(cat.categoryId)}
            >
              <Text style={[styles.catChipText, selectedCategory === cat.categoryId && styles.catChipTextActive]}>
                {cat.category}
              </Text>
              <Text style={[styles.catChipCount, selectedCategory === cat.categoryId && { color: Colors.background + 'AA' }]}>
                {cat.items.length}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Adhkar List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {loading && categories.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadText}>Loading Adhkar...</Text>
          </View>
        ) : activeCategory ? (
          <>
            <View style={styles.catHeaderBlock}>
              <Text style={styles.catHeaderTitle}>{activeCategory.category}</Text>
              <Text style={styles.catHeaderCount}>{activeCategory.items.length} remembrances</Text>
            </View>
            {activeCategory.items.map(item => (
              <AdhkarCard
                key={item.id}
                item={item}
                isFavorite={isAzkarFavorite(item.id)}
                onToggleFave={() => toggleFavoriteAzkar({
                  id: item.id,
                  arabic: item.content,
                  transliteration: '',
                  translation: item.description,
                  count: item.count,
                  reference: item.reference,
                  category: 'general',
                })}
              />
            ))}
          </>
        ) : null}
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  title: { fontSize: Typography.h2, fontWeight: Typography.bold, color: Colors.textPrimary },
  titleAr: { fontSize: Typography.caption, color: Colors.primary, marginTop: 2 },
  errBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: Spacing.md, marginBottom: 4, padding: 8,
    backgroundColor: Colors.warning + '15', borderRadius: Radius.sm,
  },
  errText: { fontSize: Typography.small, color: Colors.textSecondary },
  catOuter: { minHeight: 52 },
  catScroll: { paddingHorizontal: Spacing.md, paddingVertical: 6, gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: Radius.round, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipText: { fontSize: Typography.caption, fontWeight: Typography.medium, color: Colors.textSecondary },
  catChipTextActive: { color: Colors.background, fontWeight: Typography.bold },
  catChipCount: {
    fontSize: Typography.small, color: Colors.primary, fontWeight: Typography.bold,
    backgroundColor: Colors.overlayLight, borderRadius: Radius.round, paddingHorizontal: 6, paddingVertical: 1,
  },
  listContent: { paddingHorizontal: 0 },
  catHeaderBlock: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  catHeaderTitle: { fontSize: Typography.h3, fontWeight: Typography.bold, color: Colors.textPrimary },
  catHeaderCount: { fontSize: Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  adhkarCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  tapCounter: {
    backgroundColor: Colors.primary, borderRadius: Radius.round,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  tapCount: { fontSize: Typography.caption, fontWeight: Typography.bold, color: Colors.background },
  onceBadge: {
    backgroundColor: Colors.overlayLight, borderRadius: Radius.round,
    paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: Colors.primary + '44',
  },
  onceBadgeText: { fontSize: Typography.small, color: Colors.primary, fontWeight: Typography.bold },
  arabicText: {
    fontSize: 22, color: Colors.textArabic, textAlign: 'right',
    lineHeight: 40, writingDirection: 'rtl', marginBottom: Spacing.sm,
  },
  descText: { fontSize: Typography.body, color: Colors.textPrimary, lineHeight: 22, marginBottom: 6 },
  refText: { fontSize: Typography.small, color: Colors.primary, fontStyle: 'italic' },
  center: { alignItems: 'center', padding: Spacing.xl, gap: Spacing.sm },
  loadText: { fontSize: Typography.body, color: Colors.textSecondary },
});
