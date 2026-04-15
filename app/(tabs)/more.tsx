// Powered by OnSpace.AI
import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  Animated, Vibration, Modal, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { TASBEEH_OPTIONS } from '@/constants/azkarData';
import { HADITH_COLLECTIONS, FORTY_NAWAWI } from '@/constants/hadithData';
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

  const handleTasbeehPress = useCallback(() => {
    Vibration.vibrate(25);
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

  const handleReset = () => { setCount(0); Vibration.vibrate(60); };
  const progress = Math.min(count / selectedDhikr.defaultCount, 1);
  const completed = Math.floor(count / selectedDhikr.defaultCount);

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

          {/* Counter */}
          <View style={styles.counterArea}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Pressable onPress={handleTasbeehPress} style={styles.counterBtn}>
                <View style={styles.outerRing}>
                  <View style={[styles.progressArc, {
                    borderTopColor: Colors.primary,
                    borderRightColor: progress > 0.25 ? Colors.primary : Colors.surfaceBorder,
                    borderBottomColor: progress > 0.5 ? Colors.primary : Colors.surfaceBorder,
                    borderLeftColor: progress > 0.75 ? Colors.primary : Colors.surfaceBorder,
                  }]} />
                  <View style={styles.innerCircle}>
                    <Text style={styles.countNum}>{count}</Text>
                    <Text style={styles.countTarget}>/ {selectedDhikr.defaultCount}</Text>
                    {completed > 0 ? (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedText}>×{completed} done</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            </Animated.View>
            <Text style={styles.dhikrArabic}>{selectedDhikr.arabic}</Text>
            <Text style={styles.dhikrTranslit}>{selectedDhikr.transliteration}</Text>
            <Text style={styles.dhikrTranslation}>{selectedDhikr.translation}</Text>

            {/* Controls */}
            <View style={styles.controls}>
              <Pressable style={styles.controlBtn} onPress={handleReset}>
                <MaterialIcons name="refresh" size={22} color={Colors.error} />
                <Text style={[styles.controlText, { color: Colors.error }]}>Reset</Text>
              </Pressable>
              <View style={styles.totalBadge}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalNum}>{totalCount.toLocaleString()}</Text>
              </View>
              <Pressable style={styles.controlBtn}>
                <MaterialIcons name="share" size={22} color={Colors.primary} />
                <Text style={[styles.controlText, { color: Colors.primary }]}>Share</Text>
              </Pressable>
            </View>
          </View>

          {/* Dhikr Selector */}
          <View style={styles.dhikrList}>
            <Text style={styles.dhikrListTitle}>Choose Dhikr</Text>
            {TASBEEH_OPTIONS.map(opt => (
              <Pressable
                key={opt.id}
                style={[styles.dhikrOption, selectedDhikr.id === opt.id && styles.dhikrOptionActive]}
                onPress={() => { setSelectedDhikr(opt); setCount(0); }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dhikrOptAr, selectedDhikr.id === opt.id && { color: Colors.primary }]}>
                    {opt.arabic}
                  </Text>
                  <Text style={styles.dhikrOptEn}>{opt.translation}</Text>
                </View>
                <Text style={styles.dhikrOptCount}>×{opt.defaultCount}</Text>
                {selectedDhikr.id === opt.id ? (
                  <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                ) : null}
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
                <Text style={[styles.collCount, { color: col.color }]}>{col.totalHadiths.toLocaleString()} hadiths</Text>
              </Pressable>
            ))}
          </View>
          <GeometricDivider />
          <View style={styles.subHeader}>
            <Text style={styles.sectionTitle}>40 Hadith Nawawi</Text>
            <Text style={styles.sectionTitleAr}>الأربعون النووية</Text>
          </View>
          {FORTY_NAWAWI.map(hadith => (
            <IslamicCard key={hadith.id} style={styles.hadithCard}>
              <View style={styles.hadithHeader}>
                <View style={styles.hadithNum}>
                  <Text style={styles.hadithNumText}>{hadith.hadithNumber}</Text>
                </View>
                <Text style={styles.hadithNarrator}>{hadith.narrator}</Text>
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeText}>{hadith.grade}</Text>
                </View>
              </View>
              <Text style={styles.hadithArabic}>{hadith.arabic}</Text>
              <Text style={styles.hadithTranslation}>{hadith.translation}</Text>
              <View style={styles.catBadge}>
                <Text style={styles.catText}>{hadith.category}</Text>
              </View>
            </IslamicCard>
          ))}
          <View style={{ height: Spacing.xl }} />
        </ScrollView>

      /* ── SETTINGS ── */
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <Text style={styles.sectionTitleAr}>الإعدادات</Text>
          </View>

          {/* Radio & TV Link */}
          <Pressable style={styles.settingLink} onPress={() => router.push('/radio' as any)}>
            <View style={[styles.settingIcon, { backgroundColor: Colors.error + '22' }]}>
              <MaterialIcons name="radio" size={20} color={Colors.error} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLinkTitle}>Quran Radio & TV</Text>
              <Text style={styles.settingLinkSub}>Stream live Islamic stations</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
          </Pressable>

          {/* Qibla Finder Link */}
          <Pressable style={styles.settingLink} onPress={() => router.push('/qibla' as any)}>
            <View style={[styles.settingIcon, { backgroundColor: Colors.primary + '22' }]}>
              <MaterialIcons name="explore" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLinkTitle}>Qibla Finder</Text>
              <Text style={styles.settingLinkSub}>Compass-based Qibla direction</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
          </Pressable>

          <View style={styles.settingGroup}>
            <Text style={styles.settingGroupTitle}>Quran Display</Text>

            {/* Transliteration Toggle */}
            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>Show Transliteration</Text>
                <Text style={styles.settingDesc}>Show pronunciation guide below Arabic</Text>
              </View>
              <Switch
                value={showTransliteration}
                onValueChange={setShowTransliteration}
                trackColor={{ false: Colors.surfaceBorder, true: Colors.primary + '88' }}
                thumbColor={showTransliteration ? Colors.primary : Colors.textMuted}
              />
            </View>

            {/* Font Size */}
            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>Arabic Font Size</Text>
                <Text style={styles.settingDesc}>Current: {arabicFontSize}px</Text>
              </View>
              <View style={styles.fontSizeControls}>
                <Pressable
                  style={styles.fontBtn}
                  onPress={() => setArabicFontSize(Math.max(18, arabicFontSize - 2))}
                >
                  <MaterialIcons name="remove" size={16} color={Colors.textPrimary} />
                </Pressable>
                <Text style={styles.fontSizeValue}>{arabicFontSize}</Text>
                <Pressable
                  style={styles.fontBtn}
                  onPress={() => setArabicFontSize(Math.min(40, arabicFontSize + 2))}
                >
                  <MaterialIcons name="add" size={16} color={Colors.textPrimary} />
                </Pressable>
              </View>
            </View>

            {/* Translation Picker */}
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

          {/* App Info */}
          <IslamicCard style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>NurQuran</Text>
            <Text style={styles.aboutTitleAr}>نور القرآن</Text>
            <Text style={styles.aboutDesc}>
              Powered by alquran.cloud API, mp3quran.net, and the Adhan prayer calculation library.
            </Text>
            <Text style={styles.aboutVersion}>Version 2.0 • Built with Expo</Text>
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
  tabText: { fontSize: Typography.small, fontWeight: Typography.semiBold, color: Colors.textSecondary },
  tabTextActive: { color: Colors.background, fontWeight: Typography.bold },
  sectionHeader: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  subHeader: { paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: Typography.h2, fontWeight: Typography.bold, color: Colors.textPrimary },
  sectionTitleAr: { fontSize: Typography.caption, color: Colors.primary, marginTop: 2 },
  // Tasbeeh
  counterArea: { alignItems: 'center', paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  counterBtn: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  outerRing: {
    width: 220, height: 220, borderRadius: 110,
    borderWidth: 8, borderColor: Colors.surfaceBorder,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface,
  },
  progressArc: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 8,
    borderTopColor: Colors.primary,
  },
  innerCircle: { alignItems: 'center' },
  countNum: { fontSize: 64, fontWeight: Typography.bold, color: Colors.primary, lineHeight: 72 },
  countTarget: { fontSize: Typography.body, color: Colors.textSecondary },
  completedBadge: {
    marginTop: 4, backgroundColor: Colors.success + '33',
    borderRadius: Radius.round, paddingHorizontal: 12, paddingVertical: 3,
  },
  completedText: { fontSize: Typography.caption, color: Colors.success, fontWeight: Typography.bold },
  dhikrArabic: { fontSize: 28, color: Colors.textArabic, textAlign: 'center', lineHeight: 46, marginBottom: 4 },
  dhikrTranslit: { fontSize: Typography.caption, color: Colors.textSecondary, fontStyle: 'italic', textAlign: 'center' },
  dhikrTranslation: { fontSize: Typography.body, color: Colors.textPrimary, textAlign: 'center', marginTop: 4, marginBottom: Spacing.md },
  controls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl },
  controlBtn: { alignItems: 'center', gap: 4 },
  controlText: { fontSize: Typography.small, fontWeight: Typography.medium },
  totalBadge: {
    alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: Radius.md, paddingHorizontal: 20, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.primary,
  },
  totalLabel: { fontSize: Typography.small, color: Colors.textSecondary },
  totalNum: { fontSize: Typography.h3, fontWeight: Typography.bold, color: Colors.primary },
  dhikrList: { paddingHorizontal: Spacing.md },
  dhikrListTitle: { fontSize: Typography.h4, fontWeight: Typography.semiBold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  dhikrOption: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: Radius.md, padding: Spacing.sm + 2, marginBottom: Spacing.xs,
    borderWidth: 1, borderColor: Colors.surfaceBorder, gap: Spacing.sm,
  },
  dhikrOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.overlayLight },
  dhikrOptAr: { fontSize: 17, color: Colors.textArabic },
  dhikrOptEn: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 2 },
  dhikrOptCount: { fontSize: Typography.caption, color: Colors.textMuted, fontWeight: Typography.bold },
  // Hadith
  collectionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm },
  collCard: {
    width: '47%', backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: Spacing.sm + 4, borderWidth: 1,
  },
  collDot: { width: 10, height: 10, borderRadius: 5, marginBottom: Spacing.xs },
  collName: { fontSize: Typography.caption, fontWeight: Typography.bold, color: Colors.textPrimary },
  collAr: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 1 },
  collAuthor: { fontSize: Typography.small, color: Colors.textMuted, marginTop: 2 },
  collCount: { fontSize: Typography.small, fontWeight: Typography.bold, marginTop: 6 },
  hadithCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm },
  hadithHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  hadithNum: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.overlayLight, borderWidth: 1, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  hadithNumText: { fontSize: Typography.caption, fontWeight: Typography.bold, color: Colors.primary },
  hadithNarrator: { flex: 1, fontSize: Typography.caption, color: Colors.textSecondary },
  gradeBadge: { backgroundColor: Colors.success + '22', borderRadius: Radius.round, paddingHorizontal: 8, paddingVertical: 2 },
  gradeText: { fontSize: Typography.small, color: Colors.success, fontWeight: Typography.bold },
  hadithArabic: { fontSize: 18, color: Colors.textArabic, textAlign: 'right', lineHeight: 34, marginBottom: Spacing.sm, writingDirection: 'rtl' },
  hadithTranslation: { fontSize: Typography.body, color: Colors.textPrimary, lineHeight: 22, marginBottom: Spacing.sm },
  catBadge: { backgroundColor: Colors.overlayLight, borderRadius: Radius.round, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  catText: { fontSize: Typography.small, color: Colors.primary, fontWeight: Typography.medium },
  // Settings
  settingLink: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm + 4,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  settingIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  settingLinkTitle: { fontSize: Typography.body, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  settingLinkSub: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 2 },
  settingGroup: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  settingGroupTitle: { fontSize: Typography.h4, fontWeight: Typography.semiBold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm + 4,
    borderWidth: 1, borderColor: Colors.surfaceBorder, marginBottom: Spacing.xs,
  },
  settingLabel: { fontSize: Typography.body, fontWeight: Typography.medium, color: Colors.textPrimary },
  settingDesc: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 2 },
  settingBlockLabel: { paddingTop: Spacing.sm, paddingBottom: 4 },
  fontSizeControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fontBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  fontSizeValue: { fontSize: Typography.body, fontWeight: Typography.bold, color: Colors.primary, minWidth: 28, textAlign: 'center' },
  transOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.sm + 2, borderRadius: Radius.sm, marginBottom: 2,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  transOptionActive: { backgroundColor: Colors.overlayLight, borderColor: Colors.primary },
  transOptionText: { fontSize: Typography.body, color: Colors.textPrimary },
  aboutCard: { marginHorizontal: Spacing.md, alignItems: 'center', marginBottom: Spacing.md },
  aboutTitle: { fontSize: Typography.h3, fontWeight: Typography.bold, color: Colors.primary },
  aboutTitleAr: { fontSize: Typography.arabicSM, color: Colors.textArabic, marginTop: 2 },
  aboutDesc: { fontSize: Typography.caption, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 },
  aboutVersion: { fontSize: Typography.small, color: Colors.textMuted, marginTop: 6 },
});
