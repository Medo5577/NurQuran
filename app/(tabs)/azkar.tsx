// Powered by OnSpace.AI
import React, { useState } from 'react';
import { View, Text, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { AZKAR_CATEGORIES, MORNING_AZKAR, EVENING_AZKAR } from '@/constants/azkarData';
import DhikrCard from '@/components/feature/DhikrCard';
import IslamicCard from '@/components/ui/IslamicCard';

const TABS = ['Morning', 'Evening', 'Favorites'];

export default function AzkarScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Morning');

  const currentData = activeTab === 'Morning' ? MORNING_AZKAR : activeTab === 'Evening' ? EVENING_AZKAR : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Azkar & Duas</Text>
            <Text style={styles.titleAr}>الأذكار والأدعية</Text>
          </View>
        </View>

        {/* Category Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {AZKAR_CATEGORIES.map(cat => (
            <Pressable
              key={cat.id}
              style={({ pressed }) => [styles.catCard, { borderColor: cat.color + '55' }, pressed && { opacity: 0.8 }]}
              onPress={() => router.push(`/azkar/${cat.id}` as any)}
            >
              <View style={[styles.catIcon, { backgroundColor: cat.color + '22' }]}>
                <MaterialIcons name={cat.icon as any} size={24} color={cat.color} />
              </View>
              <Text style={styles.catName}>{cat.name}</Text>
              <Text style={styles.catArabic}>{cat.nameArabic}</Text>
              <Text style={[styles.catCount, { color: cat.color }]}>{cat.count} dhikr</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Tab Selector */}
        <View style={styles.tabs}>
          {TABS.map(tab => (
            <Pressable
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </Pressable>
          ))}
        </View>

        {/* Azkar List */}
        {currentData.length > 0 ? (
          currentData.map(dhikr => (
            <DhikrCard key={dhikr.id} dhikr={dhikr} />
          ))
        ) : (
          <View style={styles.empty}>
            <MaterialIcons name="favorite-border" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
            <Text style={styles.emptyText}>Tap the heart on any dhikr to save it here</Text>
          </View>
        )}

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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  title: { fontSize: Typography.h2, fontWeight: Typography.bold, color: Colors.textPrimary },
  titleAr: { fontSize: Typography.caption, color: Colors.primary, marginTop: 2 },
  catScroll: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: Spacing.sm },
  catCard: {
    width: 130,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.sm + 4,
    borderWidth: 1,
  },
  catIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  catName: { fontSize: Typography.caption, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  catArabic: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 1 },
  catCount: { fontSize: Typography.small, fontWeight: Typography.bold, marginTop: 4 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  activeTab: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: Typography.caption, fontWeight: Typography.medium, color: Colors.textSecondary },
  activeTabText: { color: Colors.background, fontWeight: Typography.bold },
  empty: { alignItems: 'center', padding: Spacing.xxl },
  emptyTitle: { fontSize: Typography.h4, fontWeight: Typography.semiBold, color: Colors.textSecondary, marginTop: Spacing.sm },
  emptyText: { fontSize: Typography.body, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xs },
});
