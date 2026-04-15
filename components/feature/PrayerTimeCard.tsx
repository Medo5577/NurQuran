// Powered by OnSpace.AI
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { PrayerTime } from '@/constants/prayerData';

interface PrayerTimeCardProps {
  prayer: PrayerTime;
  isNext?: boolean;
  isActive?: boolean;
}

export default function PrayerTimeCard({ prayer, isNext, isActive }: PrayerTimeCardProps) {
  return (
    <View style={[styles.card, isNext && styles.nextCard, isActive && styles.activeCard]}>
      <View style={styles.left}>
        <MaterialIcons
          name={prayer.icon as any}
          size={20}
          color={isNext ? Colors.background : Colors.primary}
        />
        <View style={{ marginLeft: Spacing.sm }}>
          <Text style={[styles.name, isNext && styles.nameNext]}>{prayer.name}</Text>
          <Text style={[styles.arabic, isNext && styles.arabicNext]}>{prayer.nameArabic}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.time, isNext && styles.timeNext]}>{prayer.time}</Text>
        {isNext ? (
          <View style={styles.nextBadge}>
            <Text style={styles.nextBadgeText}>Next</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1F2E',
    borderRadius: Radius.md,
    padding: Spacing.sm + 4,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: '#2A3441',
  },
  nextCard: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  activeCard: {
    borderColor: Colors.primary,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    fontSize: Typography.body,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
  },
  nameNext: {
    color: Colors.background,
    fontWeight: Typography.semiBold,
  },
  arabic: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  arabicNext: {
    color: Colors.background,
    opacity: 0.8,
  },
  time: {
    fontSize: Typography.h4,
    fontWeight: Typography.bold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  timeNext: {
    color: Colors.background,
  },
  nextBadge: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  nextBadgeText: {
    fontSize: 10,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
});
