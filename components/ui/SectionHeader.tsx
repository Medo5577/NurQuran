// Powered by OnSpace.AI
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  titleArabic?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function SectionHeader({ title, titleArabic, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {titleArabic ? <Text style={styles.arabic}>{titleArabic}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  title: {
    fontSize: Typography.h4,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  arabic: {
    fontSize: Typography.caption,
    color: Colors.textGold,
    textAlign: 'left',
    marginTop: 2,
  },
  action: {
    fontSize: Typography.caption,
    color: Colors.primary,
    fontWeight: Typography.medium,
  },
});
