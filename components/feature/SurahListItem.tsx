// Powered by OnSpace.AI
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { Surah } from '@/constants/quranData';

interface SurahListItemProps {
  surah: Surah;
  onPress: () => void;
}

export default function SurahListItem({ surah, onPress }: SurahListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.numberBadge}>
        <Text style={styles.numberText}>{surah.id}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{surah.name}</Text>
        <Text style={styles.sub}>
          {surah.nameTransliteration} • {surah.verses} verses • {surah.revelation}
        </Text>
        <Text style={styles.meaning}>{surah.meaning}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.arabic}>{surah.nameArabic}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F2E',
  },
  pressed: {
    backgroundColor: '#1A1F2E',
  },
  numberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.overlayLight,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  numberText: {
    color: Colors.primary,
    fontSize: Typography.caption,
    fontWeight: Typography.bold,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  sub: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  meaning: {
    fontSize: Typography.small,
    color: Colors.textGold,
    marginTop: 1,
    fontStyle: 'italic',
  },
  right: {
    marginLeft: Spacing.sm,
  },
  arabic: {
    fontSize: Typography.arabicSM,
    color: Colors.textArabic,
    textAlign: 'right',
  },
});
