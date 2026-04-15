// Powered by OnSpace.AI
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { CALCULATION_METHODS, HIJRI_MONTHS } from '@/services/prayerService';
import { CalculationMethodKey } from '@/services/prayerService';
import IslamicCard from '@/components/ui/IslamicCard';

function PrayerRow({ prayer, isNext }: { prayer: any; isNext: boolean }) {
  return (
    <View style={[styles.prayerRow, isNext && styles.prayerRowNext]}>
      <View style={[styles.prayerIcon, isNext && styles.prayerIconNext]}>
        <MaterialIcons name={prayer.icon as any} size={18} color={isNext ? Colors.background : Colors.primary} />
      </View>
      <View style={styles.prayerInfo}>
        <Text style={[styles.prayerName, isNext && styles.prayerNameNext]}>{prayer.name}</Text>
        <Text style={[styles.prayerArabic, isNext && { color: Colors.background + 'CC' }]}>{prayer.nameArabic}</Text>
      </View>
      <Text style={[styles.prayerTime, isNext && styles.prayerTimeNext]}>{prayer.time}</Text>
      {isNext ? (
        <View style={styles.nextBadge}>
          <Text style={styles.nextBadgeText}>Next</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function PrayerScreen() {
  const router = useRouter();
  const { prayerData, loading, error, cityName, calculationMethod, nextPrayerInfo, refresh, changeMethod } = usePrayerTimes();
  const [showMethodModal, setShowMethodModal] = useState(false);

  const mainPrayers = prayerData?.prayers.filter(p => p.name !== 'Sunrise') ?? [];
  const sunrise = prayerData?.prayers.find(p => p.name === 'Sunrise');
  const currentMonth = new Date().getMonth();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Prayer Times</Text>
            <Text style={styles.titleAr}>مواقيت الصلاة</Text>
          </View>
          <Pressable style={styles.locationBtn} onPress={refresh}>
            <MaterialIcons name="my-location" size={14} color={Colors.primary} />
            <Text style={styles.locationTxt} numberOfLines={1}>{cityName}</Text>
            {loading ? <ActivityIndicator size="small" color={Colors.primary} /> : null}
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errBanner}>
            <MaterialIcons name="warning" size={14} color={Colors.warning} />
            <Text style={styles.errText}>{error}</Text>
          </View>
        ) : null}

        {/* Hijri Date Card */}
        {prayerData ? (
          <IslamicCard elevated style={styles.dateCard}>
            <View style={styles.dateInner}>
              <View style={styles.dateLeft}>
                <Text style={styles.hijriDay}>{prayerData.hijriDate}</Text>
                <Text style={styles.hijriMonthYear}>{prayerData.hijriMonth} {prayerData.hijriYear}</Text>
                <Text style={styles.gregorian}>{prayerData.date}</Text>
              </View>
              <View style={styles.dateDivider} />
              <View style={styles.dateRight}>
                <MaterialIcons name="nights-stay" size={44} color={Colors.primary} />
                <Text style={styles.qiblaAngle}>Qibla {prayerData.qiblaAngle}°</Text>
              </View>
            </View>
            {nextPrayerInfo ? (
              <View style={styles.countdownBar}>
                <MaterialIcons name={nextPrayerInfo.prayer.icon as any} size={16} color={Colors.background} />
                <Text style={styles.countdownText}>
                  {nextPrayerInfo.prayer.name} ({nextPrayerInfo.prayer.nameArabic}) at {nextPrayerInfo.prayer.time}
                </Text>
                <View style={styles.timeLeftBadge}>
                  <Text style={styles.timeLeftText}>{nextPrayerInfo.timeLeft}</Text>
                </View>
              </View>
            ) : null}
          </IslamicCard>
        ) : loading ? (
          <View style={styles.skeleton}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Calculating prayer times...</Text>
          </View>
        ) : null}

        {/* Calculation Method Selector */}
        <Pressable style={styles.methodRow} onPress={() => setShowMethodModal(true)}>
          <MaterialIcons name="calculate" size={16} color={Colors.primary} />
          <Text style={styles.methodText}>
            {CALCULATION_METHODS.find(m => m.key === calculationMethod)?.label ?? calculationMethod}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={16} color={Colors.textSecondary} />
        </Pressable>

        {/* Prayer Times List */}
        {mainPrayers.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Prayer Times</Text>
            <IslamicCard style={{ padding: 0, overflow: 'hidden' }}>
              {mainPrayers.map((prayer, idx) => (
                <React.Fragment key={prayer.name}>
                  <PrayerRow prayer={prayer} isNext={prayer.isNext ?? false} />
                  {idx < mainPrayers.length - 1 ? <View style={styles.prayerDivider} /> : null}
                </React.Fragment>
              ))}
            </IslamicCard>
            {sunrise ? (
              <View style={styles.sunriseRow}>
                <MaterialIcons name="wb-sunny" size={16} color={Colors.warning} />
                <Text style={styles.sunriseText}>Sunrise: {sunrise.time}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Qibla Card */}
        <Pressable onPress={() => router.push('/qibla' as any)}>
          <IslamicCard goldBorder style={styles.qiblaCard}>
            <View style={styles.qiblaInner}>
              <View>
                <Text style={styles.qiblaTitle}>Qibla Direction</Text>
                <Text style={styles.qiblaTitleAr}>اتجاه القبلة</Text>
                {prayerData ? (
                  <Text style={styles.qiblaSub}>{prayerData.qiblaAngle}° from North • Tap to open compass</Text>
                ) : (
                  <Text style={styles.qiblaSub}>Tap to open compass finder</Text>
                )}
              </View>
              <View style={styles.compassIcon}>
                <MaterialIcons name="explore" size={52} color={Colors.primary} />
              </View>
            </View>
          </IslamicCard>
        </Pressable>

        {/* Hijri Calendar Strip */}
        <IslamicCard style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <MaterialIcons name="calendar-month" size={20} color={Colors.primary} />
            <Text style={styles.calendarTitle}>
              Hijri Calendar {prayerData ? `— ${prayerData.hijriYear} AH` : ''}
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.calendarRow}>
              {HIJRI_MONTHS.map((month, idx) => (
                <View key={month} style={[styles.monthBadge, idx === currentMonth && styles.monthActive]}>
                  <Text style={[styles.monthNum, idx === currentMonth && styles.monthNumActive]}>{idx + 1}</Text>
                  <Text style={[styles.monthName, idx === currentMonth && styles.monthNameActive]} numberOfLines={2}>
                    {month}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </IslamicCard>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* Calculation Method Modal */}
      <Modal visible={showMethodModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowMethodModal(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Calculation Method</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {CALCULATION_METHODS.map(m => (
                <Pressable
                  key={m.key}
                  style={[styles.methodOption, calculationMethod === m.key && styles.methodOptionActive]}
                  onPress={() => { changeMethod(m.key as CalculationMethodKey); setShowMethodModal(false); }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.methodOptionLabel, calculationMethod === m.key && { color: Colors.primary }]}>
                      {m.label}
                    </Text>
                    <Text style={styles.methodOptionAr}>{m.labelAr}</Text>
                  </View>
                  {calculationMethod === m.key ? (
                    <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
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
  locationBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surface, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.surfaceBorder, maxWidth: 160,
  },
  locationTxt: { fontSize: Typography.caption, color: Colors.textPrimary, fontWeight: Typography.medium, flex: 1 },
  errBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: Spacing.md, marginBottom: 4, padding: 8,
    backgroundColor: Colors.warning + '15', borderRadius: Radius.sm,
  },
  errText: { flex: 1, fontSize: Typography.small, color: Colors.textSecondary },
  dateCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm },
  dateInner: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  dateLeft: { flex: 1 },
  hijriDay: { fontSize: 52, fontWeight: Typography.bold, color: Colors.textPrimary, lineHeight: 60 },
  hijriMonthYear: { fontSize: Typography.h3, color: Colors.primary, fontWeight: Typography.semiBold },
  gregorian: { fontSize: Typography.caption, color: Colors.textSecondary, marginTop: 4 },
  dateDivider: { width: 1, height: 70, backgroundColor: Colors.surfaceBorder, marginHorizontal: Spacing.md },
  dateRight: { alignItems: 'center', gap: 4 },
  qiblaAngle: { fontSize: Typography.small, color: Colors.primary, fontWeight: Typography.medium },
  countdownBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.sm + 2, gap: 6,
  },
  countdownText: { flex: 1, fontSize: Typography.caption, color: Colors.background, fontWeight: Typography.medium },
  timeLeftBadge: { backgroundColor: Colors.background, borderRadius: Radius.round, paddingHorizontal: 10, paddingVertical: 3 },
  timeLeftText: { fontSize: Typography.small, fontWeight: Typography.bold, color: Colors.primary },
  skeleton: { alignItems: 'center', padding: Spacing.xl, gap: Spacing.sm },
  loadingText: { fontSize: Typography.body, color: Colors.textSecondary },
  methodRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.sm, padding: 10,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  methodText: { flex: 1, fontSize: Typography.small, color: Colors.textSecondary },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.h4, fontWeight: Typography.semiBold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  prayerRow: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.sm + 4, gap: Spacing.sm,
  },
  prayerRowNext: { backgroundColor: Colors.primary },
  prayerIcon: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.overlayLight, alignItems: 'center', justifyContent: 'center',
  },
  prayerIconNext: { backgroundColor: 'rgba(255,255,255,0.25)' },
  prayerInfo: { flex: 1 },
  prayerName: { fontSize: Typography.body, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  prayerNameNext: { color: Colors.background },
  prayerArabic: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 1 },
  prayerTime: { fontSize: Typography.body, fontWeight: Typography.bold, color: Colors.primary },
  prayerTimeNext: { color: Colors.background },
  nextBadge: {
    backgroundColor: Colors.background, borderRadius: Radius.round, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 4,
  },
  nextBadgeText: { fontSize: Typography.small, color: Colors.primary, fontWeight: Typography.bold },
  prayerDivider: { height: 1, backgroundColor: Colors.surfaceBorder, marginHorizontal: Spacing.sm },
  sunriseRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 4 },
  sunriseText: { fontSize: Typography.caption, color: Colors.warning },
  qiblaCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  qiblaInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qiblaTitle: { fontSize: Typography.h4, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  qiblaTitleAr: { fontSize: Typography.caption, color: Colors.primary, marginTop: 2 },
  qiblaSub: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 6 },
  compassIcon: {},
  calendarCard: { marginHorizontal: Spacing.md },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  calendarTitle: { fontSize: Typography.body, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  calendarRow: { flexDirection: 'row', gap: Spacing.xs },
  monthBadge: {
    width: 64, alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: Radius.sm, padding: 8, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  monthActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  monthNum: { fontSize: Typography.caption, color: Colors.textSecondary, fontWeight: Typography.bold },
  monthNumActive: { color: Colors.background },
  monthName: { fontSize: 9, color: Colors.textMuted, textAlign: 'center', marginTop: 2 },
  monthNameActive: { color: Colors.background },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.md, maxHeight: '80%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.surfaceBorder,
    alignSelf: 'center', marginBottom: Spacing.md,
  },
  modalTitle: { fontSize: Typography.h3, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  methodOption: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.sm + 4,
    borderRadius: Radius.md, marginBottom: 4, gap: Spacing.sm,
  },
  methodOptionActive: { backgroundColor: Colors.overlayLight },
  methodOptionLabel: { fontSize: Typography.body, color: Colors.textPrimary },
  methodOptionAr: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 2 },
});
