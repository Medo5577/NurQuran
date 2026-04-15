// Powered by OnSpace.AI
import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  Animated, Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { TASBEEH_OPTIONS } from '@/constants/azkarData';
import { HADITH_COLLECTIONS, FORTY_NAWAWI } from '@/constants/hadithData';
import IslamicCard from '@/components/ui/IslamicCard';
import GeometricDivider from '@/components/ui/GeometricDivider';

export default function MoreScreen() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'tasbeeh' | 'hadith'>('tasbeeh');

  // Tasbeeh state
  const [selectedDhikr, setSelectedDhikr] = useState(TASBEEH_OPTIONS[0]);
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleTasbeehPress = useCallback(() => {
    Vibration.vibrate(30);
    const newCount = count + 1;
    setCount(newCount);
    setTotalCount(prev => prev + 1);

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    if (newCount >= selectedDhikr.defaultCount) {
      Vibration.vibrate([0, 50, 50, 50]);
    }
  }, [count, selectedDhikr, scaleAnim]);

  const handleReset = () => {
    setCount(0);
    Vibration.vibrate(60);
  };

  const progress = Math.min(count / selectedDhikr.defaultCount, 1);
  const circumference = 2 * Math.PI * 100;
  const completed = Math.floor(count / selectedDhikr.defaultCount);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Section Toggle */}
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleBtn, activeSection === 'tasbeeh' && styles.toggleActive]}
          onPress={() => setActiveSection('tasbeeh')}
        >
          <MaterialIcons name="radio-button-checked" size={18} color={activeSection === 'tasbeeh' ? Colors.background : Colors.textSecondary} />
          <Text style={[styles.toggleText, activeSection === 'tasbeeh' && styles.toggleTextActive]}>Tasbeeh</Text>
        </Pressable>
        <Pressable
          style={[styles.toggleBtn, activeSection === 'hadith' && styles.toggleActive]}
          onPress={() => setActiveSection('hadith')}
        >
          <MaterialIcons name="library-books" size={18} color={activeSection === 'hadith' ? Colors.background : Colors.textSecondary} />
          <Text style={[styles.toggleText, activeSection === 'hadith' && styles.toggleTextActive]}>Hadith</Text>
        </Pressable>
      </View>

      {activeSection === 'tasbeeh' ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Tasbeeh Header */}
          <View style={styles.tasbeehHeader}>
            <Text style={styles.title}>Digital Misbaha</Text>
            <Text style={styles.titleAr}>المسبحة الرقمية</Text>
          </View>

          {/* Counter Circle */}
          <View style={styles.counterArea}>
            <Animated.View style={[styles.counterOuter, { transform: [{ scale: scaleAnim }] }]}>
              <Pressable style={styles.counterBtn} onPress={handleTasbeehPress}>
                <View style={[styles.progressRing, { borderColor: Colors.surfaceBorder }]}>
                  <View style={[
                    styles.progressFill,
                    {
                      borderColor: Colors.primary,
                      borderRightColor: progress > 0.25 ? Colors.primary : 'transparent',
                      borderBottomColor: progress > 0.5 ? Colors.primary : 'transparent',
                      borderLeftColor: progress > 0.75 ? Colors.primary : 'transparent',
                    }
                  ]} />
                  <View style={styles.counterInner}>
                    <Text style={styles.countNumber}>{count}</Text>
                    <Text style={styles.countTarget}>/ {selectedDhikr.defaultCount}</Text>
                    {completed > 0 ? (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedText}>×{completed}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            </Animated.View>

            {/* Selected Dhikr */}
            <Text style={styles.dhikrArabic}>{selectedDhikr.arabic}</Text>
            <Text style={styles.dhikrTranslit}>{selectedDhikr.transliteration}</Text>
            <Text style={styles.dhikrTranslation}>{selectedDhikr.translation}</Text>

            {/* Controls */}
            <View style={styles.controls}>
              <Pressable style={styles.controlBtn} onPress={handleReset}>
                <MaterialIcons name="refresh" size={22} color={Colors.error} />
                <Text style={styles.controlText}>Reset</Text>
              </Pressable>
              <View style={styles.totalBadge}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalNum}>{totalCount}</Text>
              </View>
              <Pressable style={styles.controlBtn}>
                <MaterialIcons name="share" size={22} color={Colors.primary} />
                <Text style={[styles.controlText, { color: Colors.primary }]}>Share</Text>
              </Pressable>
            </View>
          </View>

          {/* Dhikr Selector */}
          <View style={styles.dhikrSelector}>
            <Text style={styles.selectorTitle}>Choose Dhikr</Text>
            {TASBEEH_OPTIONS.map(option => (
              <Pressable
                key={option.id}
                style={[styles.dhikrOption, selectedDhikr.id === option.id && styles.dhikrOptionActive]}
                onPress={() => { setSelectedDhikr(option); setCount(0); }}
              >
                <View style={styles.dhikrOptionLeft}>
                  <Text style={[styles.dhikrOptionAr, selectedDhikr.id === option.id && { color: Colors.primary }]}>
                    {option.arabic}
                  </Text>
                  <Text style={styles.dhikrOptionEn}>{option.translation}</Text>
                </View>
                <Text style={styles.dhikrOptionCount}>×{option.defaultCount}</Text>
                {selectedDhikr.id === option.id ? (
                  <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                ) : null}
              </Pressable>
            ))}
          </View>

          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hadith Header */}
          <View style={styles.tasbeehHeader}>
            <Text style={styles.title}>Hadith Collections</Text>
            <Text style={styles.titleAr}>مجموعات الحديث</Text>
          </View>

          {/* Collections Grid */}
          <View style={styles.collectionsGrid}>
            {HADITH_COLLECTIONS.map(col => (
              <Pressable
                key={col.id}
                style={({ pressed }) => [styles.collCard, { borderColor: col.color + '44' }, pressed && { opacity: 0.8 }]}
                onPress={() => router.push(`/hadith/${col.id}` as any)}
              >
                <View style={[styles.collDot, { backgroundColor: col.color }]} />
                <Text style={styles.collName}>{col.name}</Text>
                <Text style={styles.collAr}>{col.nameArabic}</Text>
                <Text style={styles.collAuthor}>{col.author}</Text>
                <Text style={[styles.collCount, { color: col.color }]}>
                  {col.totalHadiths.toLocaleString()} hadiths
                </Text>
              </Pressable>
            ))}
          </View>

          <GeometricDivider />

          {/* 40 Nawawi Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>40 Hadith Nawawi</Text>
            <Text style={styles.sectionTitleAr}>الأربعون النووية</Text>
          </View>
          {FORTY_NAWAWI.map(hadith => (
            <IslamicCard key={hadith.id} style={styles.hadithCard}>
              <View style={styles.hadithHeader}>
                <View style={styles.hadithNum}>
                  <Text style={styles.hadithNumText}>{hadith.hadithNumber}</Text>
                </View>
                <View style={styles.hadithMeta}>
                  <Text style={styles.hadithNarrator}>{hadith.narrator}</Text>
                  <View style={styles.gradeBadge}>
                    <Text style={styles.gradeText}>{hadith.grade}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.hadithArabic}>{hadith.arabic}</Text>
              <Text style={styles.hadithTranslation}>{hadith.translation}</Text>
              <View style={styles.hadithFooter}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{hadith.category}</Text>
                </View>
              </View>
            </IslamicCard>
          ))}

          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  toggleRow: {
    flexDirection: 'row',
    margin: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  toggleActive: { backgroundColor: Colors.primary },
  toggleText: { fontSize: Typography.body, fontWeight: Typography.semiBold, color: Colors.textSecondary },
  toggleTextActive: { color: Colors.background },
  tasbeehHeader: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: Typography.h2, fontWeight: Typography.bold, color: Colors.textPrimary },
  titleAr: { fontSize: Typography.caption, color: Colors.primary, marginTop: 2 },
  counterArea: { alignItems: 'center', paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  counterOuter: { marginBottom: Spacing.md },
  counterBtn: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center' },
  progressRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  progressFill: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 8,
    borderTopColor: Colors.primary,
  },
  counterInner: { alignItems: 'center' },
  countNumber: { fontSize: 64, fontWeight: Typography.bold, color: Colors.primary, lineHeight: 72 },
  countTarget: { fontSize: Typography.body, color: Colors.textSecondary },
  completedBadge: {
    marginTop: 4,
    backgroundColor: Colors.success + '33',
    borderRadius: Radius.round,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  completedText: { fontSize: Typography.caption, color: Colors.success, fontWeight: Typography.bold },
  dhikrArabic: { fontSize: 28, color: Colors.textArabic, textAlign: 'center', lineHeight: 46, marginBottom: 4 },
  dhikrTranslit: { fontSize: Typography.caption, color: Colors.textSecondary, fontStyle: 'italic', textAlign: 'center' },
  dhikrTranslation: { fontSize: Typography.body, color: Colors.textPrimary, textAlign: 'center', marginTop: 4, marginBottom: Spacing.md },
  controls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl },
  controlBtn: { alignItems: 'center', gap: 4 },
  controlText: { fontSize: Typography.small, color: Colors.error, fontWeight: Typography.medium },
  totalBadge: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  totalLabel: { fontSize: Typography.small, color: Colors.textSecondary },
  totalNum: { fontSize: Typography.h3, fontWeight: Typography.bold, color: Colors.primary },
  dhikrSelector: { paddingHorizontal: Spacing.md },
  selectorTitle: { fontSize: Typography.h4, fontWeight: Typography.semiBold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  dhikrOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: Spacing.sm,
  },
  dhikrOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.overlayLight },
  dhikrOptionLeft: { flex: 1 },
  dhikrOptionAr: { fontSize: 17, color: Colors.textArabic },
  dhikrOptionEn: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 2 },
  dhikrOptionCount: { fontSize: Typography.caption, color: Colors.textMuted, fontWeight: Typography.bold },
  // Hadith
  collectionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm },
  collCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.sm + 4,
    borderWidth: 1,
  },
  collDot: { width: 10, height: 10, borderRadius: 5, marginBottom: Spacing.xs },
  collName: { fontSize: Typography.caption, fontWeight: Typography.bold, color: Colors.textPrimary },
  collAr: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 1 },
  collAuthor: { fontSize: Typography.small, color: Colors.textMuted, marginTop: 2 },
  collCount: { fontSize: Typography.small, fontWeight: Typography.bold, marginTop: 6 },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: Typography.h4, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  sectionTitleAr: { fontSize: Typography.caption, color: Colors.primary, marginTop: 2 },
  hadithCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm },
  hadithHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  hadithNum: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.overlayLight, borderWidth: 1, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  hadithNumText: { fontSize: Typography.caption, fontWeight: Typography.bold, color: Colors.primary },
  hadithMeta: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hadithNarrator: { fontSize: Typography.caption, color: Colors.textSecondary, flex: 1 },
  gradeBadge: { backgroundColor: Colors.success + '22', borderRadius: Radius.round, paddingHorizontal: 8, paddingVertical: 2 },
  gradeText: { fontSize: Typography.small, color: Colors.success, fontWeight: Typography.bold },
  hadithArabic: { fontSize: 18, color: Colors.textArabic, textAlign: 'right', lineHeight: 34, marginBottom: Spacing.sm, writingDirection: 'rtl' },
  hadithTranslation: { fontSize: Typography.body, color: Colors.textPrimary, lineHeight: 22, marginBottom: Spacing.sm },
  hadithFooter: { flexDirection: 'row' },
  categoryBadge: { backgroundColor: Colors.overlayLight, borderRadius: Radius.round, paddingHorizontal: 10, paddingVertical: 3 },
  categoryText: { fontSize: Typography.small, color: Colors.primary, fontWeight: Typography.medium },
});
