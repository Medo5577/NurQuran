// Powered by OnSpace.AI
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { HADITH_COLLECTIONS, FORTY_NAWAWI } from '@/constants/hadithData';
import IslamicCard from '@/components/ui/IslamicCard';

export default function HadithCollectionScreen() {
  const { collection } = useLocalSearchParams<{ collection: string }>();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const colInfo = HADITH_COLLECTIONS.find(c => c.id === collection);
  const data = collection === '40nawawi' ? FORTY_NAWAWI : FORTY_NAWAWI;

  const filtered = query.trim()
    ? data.filter(h => h.translation.toLowerCase().includes(query.toLowerCase()) || h.arabic.includes(query))
    : data;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{colInfo?.name ?? 'Hadith'}</Text>
          <Text style={styles.arabic}>{colInfo?.nameArabic}</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search hadiths..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map(hadith => (
          <IslamicCard key={hadith.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.numBadge}>
                <Text style={styles.numText}>{hadith.hadithNumber}</Text>
              </View>
              <Text style={styles.narrator}>{hadith.narrator}</Text>
              <View style={styles.gradeBadge}>
                <Text style={styles.grade}>{hadith.grade}</Text>
              </View>
            </View>
            <Text style={styles.arabic}>{hadith.arabic}</Text>
            <Text style={styles.translation}>{hadith.translation}</Text>
            <View style={styles.footer}>
              <View style={styles.catBadge}>
                <Text style={styles.catText}>{hadith.category}</Text>
              </View>
            </View>
          </IslamicCard>
        ))}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    margin: Spacing.md,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 10,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  searchInput: { flex: 1, fontSize: Typography.body, color: Colors.textPrimary },
  card: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  numBadge: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.overlayLight, borderWidth: 1, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  numText: { fontSize: Typography.small, fontWeight: Typography.bold, color: Colors.primary },
  narrator: { flex: 1, fontSize: Typography.caption, color: Colors.textSecondary },
  gradeBadge: { backgroundColor: Colors.success + '22', borderRadius: Radius.round, paddingHorizontal: 8, paddingVertical: 2 },
  grade: { fontSize: Typography.small, color: Colors.success, fontWeight: Typography.bold },
  arabic: { fontSize: 18, color: Colors.textArabic, textAlign: 'right', lineHeight: 34, marginBottom: Spacing.sm, writingDirection: 'rtl' },
  translation: { fontSize: Typography.body, color: Colors.textPrimary, lineHeight: 22, marginBottom: Spacing.sm },
  footer: { flexDirection: 'row' },
  catBadge: { backgroundColor: Colors.overlayLight, borderRadius: Radius.round, paddingHorizontal: 10, paddingVertical: 3 },
  catText: { fontSize: Typography.small, color: Colors.primary, fontWeight: Typography.medium },
});
