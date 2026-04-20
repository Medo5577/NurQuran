// Powered by OnSpace.AI
// Islamic Radio & Live TV screen using mp3quran.net API

import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useRadioTV } from '@/hooks/useRadioTV';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { RadioStation, LiveTVStation } from '@/services/mp3quranApi';
import IslamicCard from '@/components/ui/IslamicCard';

const TABS = ['Radio', 'Live TV'];

function RadioCard({ station, isPlaying, onPress }: {
  station: RadioStation; isPlaying: boolean; onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.stationCard, isPlaying && styles.stationCardActive, pressed && { opacity: 0.8 }]}
      onPress={onPress}
    >
      <View style={[styles.stationIcon, isPlaying && styles.stationIconActive]}>
        <MaterialIcons name="radio" size={22} color={isPlaying ? Colors.background : Colors.primary} />
      </View>
      <View style={styles.stationInfo}>
        <Text style={[styles.stationName, isPlaying && styles.stationNameActive]} numberOfLines={2}>
          {station.name}
        </Text>
        {isPlaying ? (
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        ) : null}
      </View>
      <MaterialIcons
        name={isPlaying ? 'pause-circle-filled' : 'play-circle-filled'}
        size={32}
        color={isPlaying ? Colors.background : Colors.primary}
      />
    </Pressable>
  );
}

function TVCard({ station, isPlaying, onPress }: {
  station: LiveTVStation; isPlaying: boolean; onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.tvCard, isPlaying && styles.tvCardActive, pressed && { opacity: 0.8 }]}
      onPress={onPress}
    >
      <View style={[styles.tvIcon, isPlaying && styles.tvIconActive]}>
        <MaterialIcons name="live-tv" size={24} color={isPlaying ? Colors.background : Colors.primary} />
      </View>
      <Text style={[styles.tvName, isPlaying && styles.tvNameActive]} numberOfLines={2}>{station.name}</Text>
      {isPlaying ? (
        <View style={styles.liveRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function RadioScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Radio');
  const { radioStations, tvStations, loading, error, reload } = useRadioTV();
  const { audioState, isPlaying, playUrl, togglePlayPause, stop } = useAudioPlayer();

  const handlePlayRadio = async (station: RadioStation) => {
    if (audioState.uri === station.url && isPlaying) {
      await togglePlayPause();
    } else {
      await playUrl(station.url);
    }
  };

  const handlePlayTV = async (station: LiveTVStation) => {
    // For Live TV HLS streams, play audio track via expo-av
    if (audioState.uri === station.url && isPlaying) {
      await togglePlayPause();
    } else {
      await playUrl(station.url);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Quran Radio & TV</Text>
          <Text style={styles.titleAr}>إذاعة وتلفزيون</Text>
        </View>
        <Pressable onPress={reload} hitSlop={8}>
          <MaterialIcons name="refresh" size={22} color={loading ? Colors.primary : Colors.textSecondary} />
        </Pressable>
      </View>

      {/* Now Playing Bar */}
      {audioState.isLoaded || audioState.isBuffering ? (
        <View style={styles.nowPlayingBar}>
          <MaterialIcons
            name={audioState.isBuffering ? 'hourglass-empty' : 'graphic-eq'}
            size={18}
            color={Colors.primary}
          />
          <Text style={styles.nowPlayingText} numberOfLines={1}>
            {audioState.isBuffering ? 'Connecting...' : 'Now Streaming'}
          </Text>
          <Pressable onPress={togglePlayPause} hitSlop={8}>
            <MaterialIcons name={isPlaying ? 'pause' : 'play-arrow'} size={24} color={Colors.primary} />
          </Pressable>
          <Pressable onPress={stop} hitSlop={8}>
            <MaterialIcons name="stop" size={22} color={Colors.textSecondary} />
          </Pressable>
        </View>
      ) : null}

      {/* Tab Toggle */}
      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <MaterialIcons
              name={tab === 'Radio' ? 'radio' : 'live-tv'}
              size={16}
              color={activeTab === tab ? Colors.background : Colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      {error ? (
        <View style={styles.errBanner}>
          <MaterialIcons name="wifi-off" size={14} color={Colors.error} />
          <Text style={styles.errText}>{error}</Text>
          <Pressable onPress={reload}><Text style={styles.retryText}>Retry</Text></Pressable>
        </View>
      ) : null}

      {loading && (activeTab === 'Radio' ? radioStations : tvStations).length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadText}>Loading {activeTab} stations...</Text>
        </View>
      ) : activeTab === 'Radio' ? (
        <FlatList
          key="radio-list"
          data={radioStations}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <RadioCard
              station={item}
              isPlaying={audioState.uri === item.url && isPlaying}
              onPress={() => handlePlayRadio(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <MaterialIcons name="radio" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No radio stations available</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          key="tv-grid"
          data={tvStations}
          keyExtractor={item => String(item.id)}
          numColumns={2}
          renderItem={({ item }) => (
            <TVCard
              station={item}
              isPlaying={audioState.uri === item.url && isPlaying}
              onPress={() => handlePlayTV(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.tvGrid}
          ListEmptyComponent={
            <View style={styles.center}>
              <MaterialIcons name="live-tv" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No TV channels available</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontSize: Typography.h4, fontWeight: Typography.bold, color: Colors.textPrimary },
  titleAr: { fontSize: Typography.small, color: Colors.primary, marginTop: 2 },
  nowPlayingBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.overlayLight, paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.primary + '33',
  },
  nowPlayingText: { flex: 1, fontSize: Typography.caption, color: Colors.primary, fontWeight: Typography.medium },
  tabRow: {
    flexDirection: 'row', margin: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 4, gap: 4, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: Radius.md,
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: Typography.body, fontWeight: Typography.semiBold, color: Colors.textSecondary },
  tabTextActive: { color: Colors.background },
  errBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: Spacing.md, marginBottom: 4, padding: 8,
    backgroundColor: Colors.error + '15', borderRadius: Radius.sm,
  },
  errText: { flex: 1, fontSize: Typography.small, color: Colors.textSecondary },
  retryText: { fontSize: Typography.small, color: Colors.primary, fontWeight: Typography.bold },
  listContent: { paddingHorizontal: Spacing.md, paddingBottom: 20, gap: Spacing.xs },
  stationCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm + 4,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  stationCardActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stationIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.overlayLight, alignItems: 'center', justifyContent: 'center',
  },
  stationIconActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  stationInfo: { flex: 1 },
  stationName: { fontSize: Typography.body, fontWeight: Typography.medium, color: Colors.textPrimary },
  stationNameActive: { color: Colors.background },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.error },
  liveText: { fontSize: Typography.small, color: Colors.error, fontWeight: Typography.bold },
  tvGrid: { padding: Spacing.md, gap: Spacing.sm },
  tvCard: {
    flex: 1, margin: 4, backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: Colors.surfaceBorder, minHeight: 120,
  },
  tvCardActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tvIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.overlayLight, alignItems: 'center', justifyContent: 'center',
  },
  tvIconActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  tvName: { fontSize: Typography.caption, color: Colors.textPrimary, textAlign: 'center', fontWeight: Typography.medium },
  tvNameActive: { color: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.xl },
  loadText: { fontSize: Typography.body, color: Colors.textSecondary },
  emptyText: { fontSize: Typography.body, color: Colors.textMuted },
});
