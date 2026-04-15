// Powered by OnSpace.AI
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useAppContext } from '@/contexts/AppContext';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import SectionHeader from '@/components/ui/SectionHeader';
import IslamicCard from '@/components/ui/IslamicCard';
import GeometricDivider from '@/components/ui/GeometricDivider';

const { width } = Dimensions.get('window');

const QUICK_ACCESS = [
  { id: 'quran', label: 'Al-Quran', arabic: 'القرآن', icon: 'menu-book', route: '/(tabs)/quran', color: '#C9A84C' },
  { id: 'prayer', label: 'Prayer', arabic: 'الصلاة', icon: 'access-time', route: '/(tabs)/prayer', color: '#5294E0' },
  { id: 'azkar', label: 'Azkar', arabic: 'الأذكار', icon: 'self-improvement', route: '/(tabs)/azkar', color: '#2ECC71' },
  { id: 'tasbeeh', label: 'Tasbeeh', arabic: 'التسبيح', icon: 'radio-button-checked', route: '/(tabs)/more', color: '#E05252' },
  { id: 'qibla', label: 'Qibla', arabic: 'القبلة', icon: 'explore', route: '/qibla', color: '#7B68EE' },
  { id: 'radio', label: 'Radio', arabic: 'الإذاعة', icon: 'radio', route: '/radio', color: '#1A8C6E' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { bookmarks, lastReadSurah } = useAppContext();
  const { prayerData, cityName, nextPrayerInfo, loading } = usePrayerTimes();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero Banner */}
        <View style={styles.heroContainer}>
          <Image
            source={require('@/assets/images/hero-banner.png')}
            style={styles.heroBg}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.heroOverlay}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroGreeting}>As-salamu alaykum</Text>
                <Text style={styles.heroGreetingAr}>السلام عليكم</Text>
              </View>
              <Pressable
                style={styles.locationBtn}
                onPress={() => router.push('/(tabs)/prayer')}
              >
                <MaterialIcons name="location-on" size={14} color={Colors.primary} />
                <Text style={styles.locationText} numberOfLines={1}>{loading ? '...' : cityName}</Text>
              </Pressable>
            </View>
            <Text style={styles.heroTime}>{currentTime}</Text>
            {prayerData ? (
              <Text style={styles.heroDate}>
                {prayerData.hijriDate} {prayerData.hijriMonth} {prayerData.hijriYear}
              </Text>
            ) : null}

            {nextPrayerInfo ? (
              <View style={styles.nextPrayerPill}>
                <MaterialIcons name={nextPrayerInfo.prayer.icon as any} size={14} color={Colors.background} />
                <Text style={styles.nextPrayerText}>
                  {nextPrayerInfo.prayer.name} at {nextPrayerInfo.prayer.time} — {nextPrayerInfo.timeLeft}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <GeometricDivider />

        {/* Quick Access Grid */}
        <SectionHeader title="Quick Access" titleArabic="الوصول السريع" />
        <View style={styles.quickGrid}>
          {QUICK_ACCESS.map(item => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [styles.quickItem, pressed && { opacity: 0.8, transform: [{ scale: 0.94 }] }]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.quickIcon, { backgroundColor: item.color + '22', borderColor: item.color + '55' }]}>
                <MaterialIcons name={item.icon as any} size={26} color={item.color} />
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
              <Text style={styles.quickArabic}>{item.arabic}</Text>
            </Pressable>
          ))}
        </View>

        <GeometricDivider />

        {/* Continue Reading */}
        <SectionHeader
          title="Continue Reading"
          titleArabic="متابعة القراءة"
          actionLabel="Full Quran"
          onAction={() => router.push('/(tabs)/quran')}
        />
        <IslamicCard goldBorder style={styles.continueCard} onPress={() => router.push(`/surah/${lastReadSurah ?? 1}` as any)}>
          <View style={styles.continueInner}>
            <View style={styles.continueLeft}>
              <Text style={styles.continueLabel}>Last Read</Text>
              <Text style={styles.continueSurah}>Surah #{lastReadSurah ?? 1}</Text>
              <Text style={styles.continueMeta}>Tap to continue reading</Text>
            </View>
            <View style={styles.continueRight}>
              <Image
                source={require('@/assets/images/pattern-bg.png')}
                style={styles.patternThumb}
                contentFit="cover"
              />
              <View style={styles.readBtn}>
                <MaterialIcons name="play-arrow" size={18} color={Colors.background} />
                <Text style={styles.readBtnText}>Read</Text>
              </View>
            </View>
          </View>
        </IslamicCard>

        {/* Bookmarks */}
        {bookmarks.length > 0 ? (
          <>
            <GeometricDivider />
            <SectionHeader
              title="Bookmarks"
              titleArabic="المفضلة"
              actionLabel={`All (${bookmarks.length})`}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bookmarksScroll}>
              {bookmarks.slice(0, 5).map((bm, idx) => (
                <IslamicCard key={idx} style={styles.bookmarkCard} onPress={() => router.push(`/surah/${bm.surahId}` as any)}>
                  <Text style={styles.bmSurah}>{bm.surahName}</Text>
                  <Text style={styles.bmVerse}>Verse {bm.verseNumber}</Text>
                  <Text style={styles.bmArabic} numberOfLines={2}>{bm.arabic}</Text>
                </IslamicCard>
              ))}
            </ScrollView>
          </>
        ) : null}

        {/* Daily Verse */}
        <GeometricDivider />
        <SectionHeader title="Verse of the Day" titleArabic="آية اليوم" />
        <IslamicCard elevated style={styles.verseOfDay}>
          <MaterialIcons name="format-quote" size={24} color={Colors.primary} style={{ marginBottom: 8 }} />
          <Text style={styles.vodArabic}>إِنَّ مَعَ الْعُسْرِ يُسْرًا</Text>
          <Text style={styles.vodTranslation}>
            "Indeed, with hardship will be ease."
          </Text>
          <Text style={styles.vodRef}>— Al-Inshirah 94:6</Text>
        </IslamicCard>

        {/* Radio Banner */}
        <GeometricDivider />
        <Pressable onPress={() => router.push('/radio' as any)}>
          <IslamicCard goldBorder style={styles.radioBanner}>
            <View style={styles.radioInner}>
              <View style={[styles.radioIconBox, { backgroundColor: Colors.success + '22' }]}>
                <MaterialIcons name="radio" size={32} color={Colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.radioTitle}>Quran Radio & Live TV</Text>
                <Text style={styles.radioSub}>Stream live Quran recitations and Islamic channels</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={Colors.primary} />
            </View>
          </IslamicCard>
        </Pressable>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 20 },
  heroContainer: {
    height: 220, marginHorizontal: Spacing.md, marginTop: Spacing.sm,
    borderRadius: Radius.xl, overflow: 'hidden',
  },
  heroBg: { ...StyleSheet.absoluteFillObject },
  heroOverlay: {
    flex: 1, backgroundColor: 'rgba(13, 17, 23, 0.68)',
    padding: Spacing.md, justifyContent: 'space-between',
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroGreeting: { fontSize: Typography.h3, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  heroGreetingAr: { fontSize: Typography.caption, color: Colors.primary, marginTop: 2 },
  locationBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.overlayLight, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: Radius.round, borderWidth: 1, borderColor: Colors.primary + '44', maxWidth: 140,
  },
  locationText: { color: Colors.primary, fontSize: Typography.small, fontWeight: Typography.medium, flex: 1 },
  heroTime: { fontSize: 40, fontWeight: Typography.bold, color: Colors.textPrimary, letterSpacing: 1 },
  heroDate: { fontSize: Typography.caption, color: Colors.primary, marginTop: 2 },
  nextPrayerPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Radius.round, alignSelf: 'flex-start',
  },
  nextPrayerText: { fontSize: Typography.caption, fontWeight: Typography.semiBold, color: Colors.background },
  quickGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: Spacing.sm, paddingBottom: Spacing.sm, gap: 2,
  },
  quickItem: {
    width: (width - Spacing.md * 2) / 3,
    alignItems: 'center', paddingVertical: Spacing.md,
  },
  quickIcon: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, marginBottom: Spacing.xs,
  },
  quickLabel: { fontSize: Typography.caption, fontWeight: Typography.semiBold, color: Colors.textPrimary, marginBottom: 2 },
  quickArabic: { fontSize: Typography.small, color: Colors.textMuted },
  continueCard: { marginHorizontal: Spacing.md },
  continueInner: { flexDirection: 'row', alignItems: 'center' },
  continueLeft: { flex: 1 },
  continueLabel: {
    fontSize: Typography.small, color: Colors.textSecondary, marginBottom: 4,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  continueSurah: { fontSize: Typography.h3, fontWeight: Typography.bold, color: Colors.textPrimary },
  continueMeta: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 6 },
  continueRight: { alignItems: 'center', marginLeft: Spacing.md },
  patternThumb: { width: 80, height: 80, borderRadius: Radius.md, marginBottom: 8, opacity: 0.7 },
  readBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.round,
  },
  readBtnText: { fontSize: Typography.caption, fontWeight: Typography.bold, color: Colors.background },
  bookmarksScroll: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  bookmarkCard: { width: 160 },
  bmSurah: { fontSize: Typography.caption, fontWeight: Typography.semiBold, color: Colors.primary, marginBottom: 2 },
  bmVerse: { fontSize: Typography.small, color: Colors.textSecondary, marginBottom: Spacing.xs },
  bmArabic: { fontSize: 16, color: Colors.textArabic, textAlign: 'right', lineHeight: 26 },
  verseOfDay: { marginHorizontal: Spacing.md },
  vodArabic: { fontSize: 22, color: Colors.textArabic, textAlign: 'right', lineHeight: 40, marginBottom: Spacing.sm },
  vodTranslation: { fontSize: Typography.body, color: Colors.textPrimary, lineHeight: 24, fontStyle: 'italic', marginBottom: Spacing.sm },
  vodRef: { fontSize: Typography.caption, color: Colors.primary, fontWeight: Typography.medium, textAlign: 'right' },
  radioBanner: { marginHorizontal: Spacing.md },
  radioInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  radioIconBox: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  radioTitle: { fontSize: Typography.body, fontWeight: Typography.bold, color: Colors.textPrimary },
  radioSub: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 3 },
});
