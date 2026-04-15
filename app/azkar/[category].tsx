// Powered by OnSpace.AI
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { AZKAR_CATEGORIES, MORNING_AZKAR, EVENING_AZKAR } from '@/constants/azkarData';
import DhikrCard from '@/components/feature/DhikrCard';

const DATA_MAP: Record<string, typeof MORNING_AZKAR> = {
  morning: MORNING_AZKAR,
  evening: EVENING_AZKAR,
};

export default function AzkarCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const catInfo = AZKAR_CATEGORIES.find(c => c.id === category);
  const data = DATA_MAP[category ?? ''] ?? MORNING_AZKAR;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{catInfo?.name ?? 'Azkar'}</Text>
          <Text style={styles.arabic}>{catInfo?.nameArabic}</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {data.map(dhikr => <DhikrCard key={dhikr.id} dhikr={dhikr} />)}
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
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontSize: Typography.h4, fontWeight: Typography.bold, color: Colors.textPrimary },
  arabic: { fontSize: Typography.caption, color: Colors.primary, marginTop: 2 },
});
