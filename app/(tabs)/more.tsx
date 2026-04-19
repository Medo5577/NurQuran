// Powered by OnSpace.AI
import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  Animated, Vibration, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { TASBEEH_OPTIONS } from '@/constants/azkarData';
import { HADITH_COLLECTIONS_META } from '@/services/hadithApiService';
import { useAppContext } from '@/contexts/AppContext';
import IslamicCard from '@/components/ui/IslamicCard';
import GeometricDivider from '@/components/ui/GeometricDivider';

const SECTIONS = [
  { id: 'tasbeeh', label: 'Tasbeeh', icon: 'radio-button-checked' },
  { id: 'hadith', label: 'Hadith', icon: 'library-books' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

const TRANSLATION_OPTIONS = [
  { label: 'Sahih International', edition: 'en.sahih' },
  { label: 'Yusuf Ali', edition: 'en.yusufali' },
  { label: 'Pickthall', edition: 'en.pickthall' },
  { label: 'Dr. Mustafa Khattab', edition: 'en.khattab' },
  { label: 'Transliteration', edition: 'en.transliteration' },
];

export default function MoreScreen() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>('tasbeeh');
  const {
    selectedTranslation, setSelectedTranslation,
    showTransliteration, setShowTransliteration,
    arabicFontSize, setArabicFontSize,
  } = useAppContext();

  // Tasbeeh state
  const [selectedDhikr, setSelectedDhikr] = useState(TASBEEH_OPTIONS[0]);
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handleTasbeehPress = useCallback(() => {
    Vibration.vibrate(20);
    const newCount = count + 1;
    setCount(newCount);
    setTotalCount(prev => prev + 1);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 0.91, duration: 70, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 70, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
      ]),
    ]).start();

    if (newCount % selectedDhikr.defaultCount === 0 && newCount > 0) {
      Vibration.vibrate([0, 60, 60, 60]);
    }
  }, [count, selectedDhikr, scaleAnim, pulseAnim]);

  const handleReset = () => { setCount(0); Vibration.vibrate(80); };
  const progress = (count % selectedDhikr.defaultCount) / selectedDhikr.defaultCount;
  const completed = Math.floor(count / selectedDhikr.defaultCount);
  const remaining = selectedDhikr.defaultCount - (count % selectedDhikr.defaultCount);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Section Tabs */}
      <View style={styles.tabRow}>
        {SECTIONS.map(sec => (
          <Pressable
            key={sec.id}
            style={[styles.tab, activeSection === sec.id && styles.tabActive]}
            onPress={() => setActiveSection(sec.id)}
          >
            <MaterialIcons
              name={sec.icon as any}
              size={15}
              color={activeSection === sec.id ? Colors.background : Colors.textSecondary}
            />
            <Text style={[styles.tabText, activeSection === sec.id && styles.tabTextActive]}>
              {sec.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── TASBEEH ── */}
      {activeSection === 'tasbeeh' ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Digital Misbaha</Text>
            <Text style={styles.sectionTitleAr}>المسبحة الرقمية</Text>
          </View>

          {/* Selected Dhikr display */}
          <View style={styles.dhikrDisplay}>
            <Text style={styles.dhikrDisplayAr}>{selectedDhikr.arabic}</Text>
            <Text style={styles.dhikrDisplayTranslit}>{selectedDhikr.transliteration}</Text>
            <Text style={styles.dhikrDisplayEn}>{selectedDhikr.translation}</Text>
          </View>

          {/* Counter Button */}
          <View style={styles.counterArea}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Pressable onPress={handleTasbeehPress} style={styles.counterBtnOuter}>
                {/* Pulse ring */}
                <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
                {/* Progress arc via border colors */}
                <View style={[styles.outerRing, {
                  borderTopColor: Colors.primary,
                  borderRightColor: progress > 0.25 ? Colors.primary : Colors.surfaceBorder,
                  borderBottomColor: progress > 0.5 ? Colors.primary : Colors.surfaceBorder,
                  borderLeftColor: progress > 0.75 ? Colors.primary : Colors.surfaceBorder,
                }]}>
                  <View style={styles.innerCircle}>
                    <Text style={styles.countNum}>{count % selectedDhikr.defaultCount === 0 && count > 0 ? '✓' : count % selectedDhikr.defaultCount}</Text>
                    <Text style={styles.countTarget}>of {selectedDhikr.defaultCount}</Text>
                    <Text style={styles.remainingText}>{remaining} left</Text>
                  </View>
                </View>
              </Pressable>
            </Animated.View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{completed}</Text>
                <Text style={styles.statLabel}>Rounds</Text>
              </View>
              <View style={[styles.statBox, styles.statBoxMain]}>
                <Text style={[styles.statNum, { color: Colors.primary, fontSize: 24 }]}>{totalCount}</Text>
                <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Total</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{selectedDhikr.defaultCount}</Text>
                <Text style={styles.statLabel}>Target</Text>
              </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <Pressable style={[styles.controlBtn, { borderColor: Colors.error + '44' }]} onPress={handleReset}>
                <MaterialIcons name="refresh" size={20} color={Colors.error} />
                <Text style={[styles.controlText, { color: Colors.error }]}>Reset</Text>
              </Pressable>
              <Pressable
                style={[styles.controlBtn, { borderColor: Colors.success + '44' }]}
                onPress={() => { setTotalCount(0); setCount(0); Vibration.vibrate(100); }}
              >
                <MaterialIcons name="delete-outline" size={20} color={Colors.success} />
                <Text style={[styles.controlText, { color: Colors.success }]}>Clear All</Text>
              </Pressable>
            </View>
          </View>

          {/* Dhikr Selector */}
          <View style={styles.dhikrList}>
            <Text style={styles.dhikrListTitle}>Choose Your Dhikr</Text>
            {TASBEEH_OPTIONS.map(opt => (
              <Pressable
                key={opt.id}
                style={[styles.dhikrOption, selectedDhikr.id === opt.id && styles.dhikrOptionActive]}
                onPress={() => { setSelectedDhikr(opt); setCount(0); }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dhikrOptAr, selectedDhikr.id === opt.id && { color: Colors.primaryLight }]}>
                    {opt.arabic}
                  </Text>
                  <Text style={styles.dhikrOptTranslit} numberOfLines={1}>{opt.transliteration}</Text>
                  <Text style={styles.dhikrOptEn}>{opt.translation}</Text>
                </View>
                <View style={styles.dhikrOptRight}>
                  <View style={[styles.countChip, selectedDhikr.id === opt.id && styles.countChipActive]}>
                    <Text style={[styles.dhikrOptCount, selectedDhikr.id === opt.id && { color: Colors.background }]}>
                      ×{opt.defaultCount}
                    </Text>
                  </View>
                  {selectedDhikr.id === opt.id ? (
                    <MaterialIcons name="check-circle" size={18} color={Colors.primary} />
                  ) : null}
                </View>
              </Pressable>
            ))}
          </View>
          <View style={{ height: Spacing.xl }} />
        </ScrollView>

      /* ── HADITH ── */
      ) : activeSection === 'hadith' ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hadith Collections</Text>
            <Text style={styles.sectionTitleAr}>مجموعات الحديث</Text>
          </View>
          <Text style={styles.hadithSubtitle}>
            Real hadith data sourced from authenticated collections via API
          </Text>
          <View style={styles.collectionsGrid}>
            {HADITH_COLLECTIONS_META.map(col => (
              <Pressable
                key={col.id}
                style={({ pressed }) => [styles.collCard, { borderColor: col.color + '55' }, pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] }]}
                onPress={() => router.push(`/hadith/${col.id}` as any)}
              >
                <View style={[styles.collHeader, { backgroundColor: col.color + '15' }]}>
                  <MaterialIcons name="library-books" size={20} color={col.color} />
                  <View style={[styles.collDot, { backgroundColor: col.color }]} />
                </View>
                <Text style={[styles.collName, { color: col.color }]}>{col.name}</Text>
                <Text style={styles.collAr}>{col.nameArabic}</Text>
                <Text style={styles.collAuthor} numberOfLines={2}>{col.author}</Text>
                <View style={styles.collFooter}>
                  <Text style={[styles.collCount, { color: col.color }]}>
                    {col.total.toLocaleString()}
                  </Text>
                  <Text style={styles.collCountLabel}> hadiths</Text>
                </View>
                <View style={styles.collArrow}>
                  <MaterialIcons name="arrow-forward" size={14} color={col.color} />
                </View>
              </Pressable>
            ))}
          </View>

          <View style={{ height: Spacing.xl }} />
        </ScrollView>

      /* ── SETTINGS ── */
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <Text style={styles.sectionTitleAr}>الإعدادات</Text>
          </View>

          {/* Quick Links */}
          {[
            { icon: 'radio', label: 'Quran Radio & TV', sub: 'Stream live Islamic stations', route: '/radio', color: Colors.error },
            { icon: 'explore', label: 'Qibla Finder', sub: 'Compass-based direction', route: '/qibla', color: Colors.primary },
          ].map(item => (
            <Pressable key={item.route} style={styles.settingLink} onPress={() => router.push(item.route as any)}>
              <View style={[styles.settingIcon, { backgroundColor: item.color + '22' }]}>
                <MaterialIcons name={item.icon as any} size={20} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLinkTitle}>{item.label}</Text>
                <Text style={styles.settingLinkSub}>{item.sub}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
            </Pressable>
          ))}

          <View style={styles.settingGroup}>
            <Text style={styles.settingGroupTitle}>Quran Display</Text>

            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>Show Transliteration</Text>
                <Text style={styles.settingDesc}>Pronunciation guide below Arabic</Text>
              </View>
              <Switch
                value={showTransliteration}
                onValueChange={setShowTransliteration}
                trackColor={{ false: Colors.surfaceBorder, true: Colors.primary + '88' }}
                thumbColor={showTransliteration ? Colors.primary : Colors.textMuted}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>Arabic Font Size</Text>
                <Text style={styles.settingDesc}>Current: {arabicFontSize}px</Text>
              </View>
              <View style={styles.fontSizeControls}>
                <Pressable style={styles.fontBtn} onPress={() => setArabicFontSize(Math.max(18, arabicFontSize - 2))}>
                  <MaterialIcons name="remove" size={16} color={Colors.textPrimary} />
                </Pressable>
                <Text style={styles.fontSizeValue}>{arabicFontSize}</Text>
                <Pressable style={styles.fontBtn} onPress={() => setArabicFontSize(Math.min(44, arabicFontSize + 2))}>
                  <MaterialIcons name="add" size={16} color={Colors.textPrimary} />
                </Pressable>
              </View>
            </View>

            {/* Font size preview */}
            <View style={styles.fontPreview}>
              <Text style={[styles.fontPreviewText, { fontSize: arabicFontSize }]}>
                بِسْمِ اللَّهِ
              </Text>
            </View>

            <View style={styles.settingBlockLabel}>
              <Text style={styles.settingLabel}>Translation</Text>
            </View>
            {TRANSLATION_OPTIONS.map(t => (
              <Pressable
                key={t.edition}
                style={[styles.transOption, selectedTranslation === t.label && styles.transOptionActive]}
                onPress={() => setSelectedTranslation(t.label)}
              >
                <Text style={[styles.transOptionText, selectedTranslation === t.label && { color: Colors.primary }]}>
                  {t.label}
                </Text>
                {selectedTranslation === t.label ? (
                  <MaterialIcons name="check" size={18} color={Colors.primary} />
                ) : null}
              </Pressable>
            ))}
          </View>

          <IslamicCard style={styles.aboutCard}>
            <View style={styles.aboutLogo}>
              <MaterialIcons name="menu-book" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.aboutTitle}>NurQuran</Text>
            <Text style={styles.aboutTitleAr}>نور القرآن</Text>
            <Text style={styles.aboutDesc}>
              Quran: alquran.cloud · Audio: mp3quran.net{'\n'}
              Prayer Times: Adhan Library · Hadith: hadith.gading.dev{'\n'}
              Adhkar: GitHub JSON API
            </Text>
            <Text style={styles.aboutVersion}>Version 3.0 · Built with Expo</Text>
          </IslamicCard>

          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabRow: {
    flexDirection: 'row', margin: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 4, gap: 4, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 9, borderRadius: Radius.md,
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: Typography.small, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.background, fontWeight: '700' },
  sectionHeader: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xs },
  sectionTitle: { fontSize: Typography.h2, fontWeight: '700', color: Colors.textPrimary },
  sectionTitleAr: { fontSize: Typography.caption, color: Colors.primary, marginTop: 2 },

  // ── Dhikr Display ─────────────────────────────────────────────────────────
  dhikrDisplay: {
    alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface, marginHorizontal: Spacing.md, marginTop: Spacing.sm,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.primary + '33',
  },
  dhikrDisplayAr: { fontSize: Typography.arabicLG, color: Colors.textArabic, textAlign: 'center', lineHeight: 50 },
  dhikrDisplayTranslit: { fontSize: Typography.caption, color: Colors.primary, fontStyle: 'italic', textAlign: 'center', marginTop: 2 },
  dhikrDisplayEn: { fontSize: Typography.body, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },

  // ── Counter ───────────────────────────────────────────────────────────────
  counterArea: { alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  counterBtnOuter: {
    width: 210, height: 210, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md, position: 'relative',
  },
  pulseRing: {
    position: 'absolute', width: 210, height: 210, borderRadius: 105,
    borderWidth: 1, borderColor: Colors.primary + '33',
  },
  outerRing: {
    width: 200, height: 200, borderRadius: 100, borderWidth: 8,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface,
  },
  innerCircle: { alignItems: 'center' },
  countNum: { fontSize: 62, fontWeight: '700', color: Colors.primary, lineHeight: 70 },
  countTarget: { fontSize: Typography.caption, color: Colors.textSecondary },
  remainingText: { fontSize: Typography.small, color: Colors.textMuted, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md, width: '100%' },
  statBox: {
    flex: 1, alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: Radius.md, paddingVertical: Spacing.sm,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  statBoxMain: { borderColor: Colors.primary + '55', backgroundColor: Colors.overlayLight },
  statNum: { fontSize: Typography.h3, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { fontSize: Typography.small, color: Colors.textMuted },
  controls: { flexDirection: 'row', gap: Spacing.md },
  controlBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: Radius.round, borderWidth: 1,
    backgroundColor: Colors.surface,
  },
  controlText: { fontSize: Typography.body, fontWeight: '600' },

  // Dhikr list
  dhikrList: { paddingHorizontal: Spacing.md, marginTop: Spacing.sm },
  dhikrListTitle: { fontSize: Typography.h4, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.sm },
  dhikrOption: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: Radius.md, padding: Spacing.sm + 2, marginBottom: Spacing.xs,
    borderWidth: 1, borderColor: Colors.surfaceBorder, gap: Spacing.sm,
  },
  dhikrOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.overlayLight },
  dhikrOptAr: { fontSize: 18, color: Colors.textArabic, marginBottom: 2 },
  dhikrOptTranslit: { fontSize: Typography.small, color: Colors.primary, fontStyle: 'italic', marginBottom: 2 },
  dhikrOptEn: { fontSize: Typography.small, color: Colors.textSecondary },
  dhikrOptRight: { alignItems: 'center', gap: 4 },
  countChip: {
    backgroundColor: Colors.overlayLight, borderRadius: Radius.round,
    paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: Colors.primary + '44',
  },
  countChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dhikrOptCount: { fontSize: Typography.caption, color: Colors.primary, fontWeight: '700' },

  // ── Hadith ────────────────────────────────────────────────────────────────
  hadithSubtitle: {
    fontSize: Typography.caption, color: Colors.textSecondary, fontStyle: 'italic',
    paddingHorizontal: Spacing.md, marginBottom: Spacing.md, marginTop: 4,
  },
  collectionsGrid: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  collCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, position: 'relative',
  },
  collHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: Radius.sm, padding: 8, marginBottom: Spacing.sm },
  collDot: { width: 10, height: 10, borderRadius: 5 },
  collName: { fontSize: Typography.body, fontWeight: '700' },
  collAr: { fontSize: Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  collAuthor: { fontSize: Typography.small, color: Colors.textMuted, marginTop: 4, lineHeight: 18 },
  collFooter: { flexDirection: 'row', alignItems: 'baseline', marginTop: 8 },
  collCount: { fontSize: Typography.h3, fontWeight: '700' },
  collCountLabel: { fontSize: Typography.caption, color: Colors.textMuted },
  collArrow: {
    position: 'absolute', right: Spacing.md, bottom: Spacing.md,
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  settingLink: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm + 4,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  settingIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  settingLinkTitle: { fontSize: Typography.body, fontWeight: '600', color: Colors.textPrimary },
  settingLinkSub: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 2 },
  settingGroup: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  settingGroupTitle: { fontSize: Typography.h4, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.sm },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm + 4,
    borderWidth: 1, borderColor: Colors.surfaceBorder, marginBottom: Spacing.xs,
  },
  settingLabel: { fontSize: Typography.body, fontWeight: '500', color: Colors.textPrimary },
  settingDesc: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 2 },
  settingBlockLabel: { paddingTop: Spacing.sm, paddingBottom: 4 },
  fontSizeControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fontBtn: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  fontSizeValue: { fontSize: Typography.body, fontWeight: '700', color: Colors.primary, minWidth: 28, textAlign: 'center' },
  fontPreview: {
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md,
    alignItems: 'center', marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  fontPreviewText: { color: Colors.textArabic, lineHeight: 60 },
  transOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.sm + 2, borderRadius: Radius.sm, marginBottom: 2,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  transOptionActive: { backgroundColor: Colors.overlayLight, borderColor: Colors.primary },
  transOptionText: { fontSize: Typography.body, color: Colors.textPrimary },
  aboutCard: { marginHorizontal: Spacing.md, alignItems: 'center', marginBottom: Spacing.md },
  aboutLogo: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.overlayLight,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.primary + '55', marginBottom: 8,
  },
  aboutTitle: { fontSize: Typography.h3, fontWeight: '700', color: Colors.primary },
  aboutTitleAr: { fontSize: Typography.arabicSM, color: Colors.textArabic, marginTop: 2 },
  aboutDesc: { fontSize: Typography.caption, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 },
  aboutVersion: { fontSize: Typography.small, color: Colors.textMuted, marginTop: 6 },
});
