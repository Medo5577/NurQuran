// Powered by OnSpace.AI
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { Dhikr } from '@/constants/azkarData';
import { useAppContext } from '@/contexts/AppContext';

interface DhikrCardProps {
  dhikr: Dhikr;
  currentCount?: number;
}

export default function DhikrCard({ dhikr, currentCount }: DhikrCardProps) {
  const { toggleFavoriteAzkar, isAzkarFavorite } = useAppContext();
  const isFav = isAzkarFavorite(dhikr.id);

  return (
    <View style={styles.card}>
      {/* Arabic */}
      <Text style={styles.arabic}>{dhikr.arabic}</Text>

      {/* Transliteration */}
      <Text style={styles.transliteration}>{dhikr.transliteration}</Text>

      {/* Translation */}
      <Text style={styles.translation}>{dhikr.translation}</Text>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>×{dhikr.count}</Text>
        </View>
        {currentCount !== undefined ? (
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>{currentCount} done</Text>
          </View>
        ) : null}
        <Pressable
          onPress={() => toggleFavoriteAzkar(dhikr)}
          hitSlop={8}
          style={styles.favBtn}
        >
          <MaterialIcons
            name={isFav ? 'favorite' : 'favorite-border'}
            size={20}
            color={isFav ? Colors.error : Colors.textSecondary}
          />
        </Pressable>
        <View style={styles.virtue}>
          <MaterialIcons name="info-outline" size={14} color={Colors.primary} />
          <Text style={styles.virtueText} numberOfLines={2}>{dhikr.virtue}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  arabic: {
    fontSize: 22,
    color: Colors.textArabic,
    textAlign: 'right',
    lineHeight: 40,
    marginBottom: Spacing.sm,
    writingDirection: 'rtl',
  },
  transliteration: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
  translation: {
    fontSize: Typography.body,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    paddingTop: Spacing.sm,
  },
  countBadge: {
    backgroundColor: Colors.overlayLight,
    borderRadius: Radius.round,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  countText: {
    fontSize: Typography.caption,
    color: Colors.primary,
    fontWeight: Typography.bold,
  },
  progressBadge: {
    backgroundColor: '#1A2E1F',
    borderRadius: Radius.round,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  progressText: {
    fontSize: Typography.caption,
    color: Colors.success,
    fontWeight: Typography.medium,
  },
  favBtn: {
    marginLeft: 'auto',
    padding: 4,
  },
  virtue: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    width: '100%',
    marginTop: 4,
  },
  virtueText: {
    fontSize: Typography.small,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 18,
  },
});
