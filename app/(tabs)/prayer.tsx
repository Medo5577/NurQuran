// Powered by OnSpace.AI
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { getMockedPrayerTimes, getNextPrayer, HIJRI_MONTHS } from '@/constants/prayerData';
import PrayerTimeCard from '@/components/feature/PrayerTimeCard';
import IslamicCard from '@/components/ui/IslamicCard';

export default function PrayerScreen() {
  const router = useRouter();
  const prayerDay = getMockedPrayerTimes();
  const { prayer: nextPrayer, timeLeft } = getNextPrayer(prayerDay.prayers);
  const mainPrayers = prayerDay.prayers.filter(p => p.name !== 'Sunrise');
  const sunrise = prayerDay.prayers.find(p => p.name === 'Sunrise');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Prayer Times</Text>
            <Text style={styles.titleAr}>مواقيت الصلاة</Text>
          </View>
          <Pressable style={styles.locationBtn}>
            <MaterialIcons name="my-location" size={16} color={Colors.primary} />
            <Text style={styles.locationTxt}>Mecca, SA</Text>
            <MaterialIcons name="keyboard-arrow-down" size={16} color={Colors.textSecondary} />
          </Pressable>
        </View>

        {/* Hijri Date Card */}
        <IslamicCard elevated style={styles.dateCard}>
          <View style={styles.dateInner}>
            <View style={styles.dateLeft}>
              <Text style={styles.hijriDay}>{prayerDay.hijriDate}</Text>
              <Text style={styles.hijriMonthYear}>{prayerDay.hijriMonth} {prayerDay.hijriYear}</Text>
              <Text style={styles.gregorian}>{prayerDay.date}</Text>
            </View>
            <View style={styles.dateDivider} />
            <View style={styles.dateRight}>
              <MaterialIcons name="nights-stay" size={40} color={Colors.primary} />
            </View>
          </View>

          {/* Next Prayer Countdown */}
          <View style={styles.countdownBar}>
            <MaterialIcons name={nextPrayer.icon as any} size={18} color={Colors.background} />
            <Text style={styles.countdownText}>
              Next: {nextPrayer.name} ({nextPrayer.nameArabic}) at {nextPrayer.time}
            </Text>
            <View style={styles.timeLeftBadge}>
              <Text style={styles.timeLeftText}>{timeLeft}</Text>
            </View>
          </View>
        </IslamicCard>

        {/* Prayer Times List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Prayer Times</Text>
          {mainPrayers.map(prayer => (
            <PrayerTimeCard
              key={prayer.name}
              prayer={prayer}
              isNext={prayer.name === nextPrayer.name}
            />
          ))}
          {sunrise ? (
            <View style={styles.sunriseRow}>
              <MaterialIcons name="wb-sunny" size={16} color={Colors.warning} />
              <Text style={styles.sunriseText}>Sunrise: {sunrise.time}</Text>
            </View>
          ) : null}
        </View>

        {/* Qibla + Compass */}
        <Pressable onPress={() => router.push('/qibla' as any)}>
          <IslamicCard goldBorder style={styles.qiblaCard}>
            <View style={styles.qiblaInner}>
              <View>
                <Text style={styles.qiblaTitle}>Qibla Direction</Text>
                <Text style={styles.qiblaTitleAr}>اتجاه القبلة</Text>
                <Text style={styles.qiblaSub}>Tap to open compass finder</Text>
              </View>
              <View style={styles.compass}>
                <MaterialIcons name="explore" size={48} color={Colors.primary} />
                <Text style={styles.compassDeg}>N 45° NE</Text>
              </View>
            </View>
          </IslamicCard>
        </Pressable>

        {/* Islamic Calendar */}
        <IslamicCard style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <MaterialIcons name="calendar-month" size={20} color={Colors.primary} />
            <Text style={styles.calendarTitle}>Hijri Calendar — {prayerDay.hijriYear} AH</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.calendarRow}>
              {HIJRI_MONTHS.map((month, idx) => (
                <View key={month} style={[styles.monthBadge, idx === 9 && styles.monthActive]}>
                  <Text style={[styles.monthNum, idx === 9 && styles.monthNumActive]}>{idx + 1}</Text>
                  <Text style={[styles.monthName, idx === 9 && styles.monthNameActive]} numberOfLines={2}>
                    {month}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </IslamicCard>

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
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  locationTxt: { fontSize: Typography.caption, color: Colors.textPrimary, fontWeight: Typography.medium },
  dateCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  dateInner: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  dateLeft: { flex: 1 },
  hijriDay: { fontSize: 52, fontWeight: Typography.bold, color: Colors.textPrimary, lineHeight: 60 },
  hijriMonthYear: { fontSize: Typography.h3, color: Colors.primary, fontWeight: Typography.semiBold },
  gregorian: { fontSize: Typography.caption, color: Colors.textSecondary, marginTop: 4 },
  dateDivider: { width: 1, height: 70, backgroundColor: Colors.surfaceBorder, marginHorizontal: Spacing.md },
  dateRight: { alignItems: 'center' },
  countdownBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
    gap: Spacing.xs,
  },
  countdownText: { flex: 1, fontSize: Typography.caption, color: Colors.background, fontWeight: Typography.medium },
  timeLeftBadge: {
    backgroundColor: Colors.background,
    borderRadius: Radius.round,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  timeLeftText: { fontSize: Typography.small, fontWeight: Typography.bold, color: Colors.primary },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  sectionTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  sunriseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sunriseText: { fontSize: Typography.caption, color: Colors.warning },
  qiblaCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  qiblaInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qiblaTitle: { fontSize: Typography.h4, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  qiblaTitleAr: { fontSize: Typography.caption, color: Colors.primary, marginTop: 2 },
  qiblaSub: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 6 },
  compass: { alignItems: 'center' },
  compassDeg: { fontSize: Typography.small, color: Colors.primary, marginTop: 4, fontWeight: Typography.medium },
  calendarCard: { marginHorizontal: Spacing.md },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  calendarTitle: { fontSize: Typography.body, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  calendarRow: { flexDirection: 'row', gap: Spacing.xs },
  monthBadge: {
    width: 64,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  monthActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  monthNum: { fontSize: Typography.caption, color: Colors.textSecondary, fontWeight: Typography.bold },
  monthNumActive: { color: Colors.background },
  monthName: { fontSize: 9, color: Colors.textMuted, textAlign: 'center', marginTop: 2 },
  monthNameActive: { color: Colors.background },
});
