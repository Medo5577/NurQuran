// Powered by OnSpace.AI
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const QIBLA_DIRECTION = 118; // Degrees from North (example: approximate from London)

export default function QiblaScreen() {
  const router = useRouter();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [degrees, setDegrees] = useState(QIBLA_DIRECTION);
  const [isCalibrating, setIsCalibrating] = useState(false);

  useEffect(() => {
    // Simulate compass needle animation
    Animated.timing(rotateAnim, {
      toValue: degrees,
      duration: 600,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
  }, [degrees]);

  const handleCalibrate = () => {
    setIsCalibrating(true);
    const randomVariance = (Math.random() - 0.5) * 10;
    setTimeout(() => {
      setDegrees(QIBLA_DIRECTION + randomVariance);
      setIsCalibrating(false);
    }, 1500);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const cardinalDir = (deg: number) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Qibla Finder</Text>
          <Text style={styles.titleAr}>القبلة</Text>
        </View>
        <Pressable onPress={handleCalibrate} hitSlop={8}>
          <MaterialIcons name="sync" size={22} color={Colors.primary} />
        </Pressable>
      </View>

      {/* Compass */}
      <View style={styles.compassArea}>
        {/* Outer Ring */}
        <View style={styles.compassRing}>
          {/* Cardinal Labels */}
          {['N', 'E', 'S', 'W'].map((dir, i) => {
            const angle = i * 90;
            const rad = (angle - 90) * (Math.PI / 180);
            const r = 130;
            return (
              <Text
                key={dir}
                style={[styles.cardinal, {
                  left: 160 + r * Math.cos(rad) - 10,
                  top: 160 + r * Math.sin(rad) - 10,
                  color: dir === 'N' ? Colors.error : Colors.textSecondary,
                }]}
              >
                {dir}
              </Text>
            );
          })}

          {/* Compass Needle */}
          <Animated.View style={[styles.needleContainer, { transform: [{ rotate }] }]}>
            {/* Kaaba Icon at needle tip */}
            <View style={styles.needleTip}>
              <MaterialIcons name="mosque" size={20} color={Colors.background} />
            </View>
            <View style={styles.needle} />
            <View style={styles.needleSouth} />
          </Animated.View>

          {/* Center Dot */}
          <View style={styles.centerDot} />
        </View>

        {/* Degree Display */}
        <View style={styles.degreeDisplay}>
          <Text style={styles.degreeValue}>{Math.round(degrees)}°</Text>
          <Text style={styles.degreeDir}>{cardinalDir(degrees)} — Direction to Mecca</Text>
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <MaterialIcons name="location-on" size={20} color={Colors.primary} />
          <Text style={styles.infoLabel}>Your Location</Text>
          <Text style={styles.infoValue}>Detecting...</Text>
        </View>
        <View style={styles.infoCard}>
          <MaterialIcons name="explore" size={20} color={Colors.primary} />
          <Text style={styles.infoLabel}>Qibla Angle</Text>
          <Text style={styles.infoValue}>{Math.round(degrees)}° NE</Text>
        </View>
        <View style={styles.infoCard}>
          <MaterialIcons name="flight" size={20} color={Colors.primary} />
          <Text style={styles.infoLabel}>Distance</Text>
          <Text style={styles.infoValue}>~4,832 km</Text>
        </View>
      </View>

      {/* Calibrate */}
      {isCalibrating ? (
        <View style={styles.calibratingBar}>
          <MaterialIcons name="sync" size={16} color={Colors.primary} />
          <Text style={styles.calibratingText}>Calibrating compass...</Text>
        </View>
      ) : null}

      <View style={styles.disclaimer}>
        <MaterialIcons name="info-outline" size={14} color={Colors.textMuted} />
        <Text style={styles.disclaimerText}>
          For accurate results, hold the device flat and away from metal objects. Full GPS compass integration coming soon.
        </Text>
      </View>
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
  titleAr: { fontSize: Typography.caption, color: Colors.primary, marginTop: 2 },
  compassArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  compassRing: {
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  cardinal: {
    position: 'absolute',
    fontSize: Typography.body,
    fontWeight: Typography.bold,
    width: 20,
    textAlign: 'center',
  },
  needleContainer: {
    width: 4,
    height: 220,
    alignItems: 'center',
    position: 'absolute',
  },
  needleTip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  needle: {
    width: 3,
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  needleSouth: {
    width: 3,
    height: 80,
    backgroundColor: Colors.textMuted,
    borderRadius: 2,
    marginTop: 4,
  },
  centerDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  degreeDisplay: { marginTop: Spacing.lg, alignItems: 'center' },
  degreeValue: { fontSize: 48, fontWeight: Typography.bold, color: Colors.primary, lineHeight: 56 },
  degreeDir: { fontSize: Typography.body, color: Colors.textSecondary, marginTop: 4 },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 4,
  },
  infoLabel: { fontSize: Typography.small, color: Colors.textSecondary, textAlign: 'center' },
  infoValue: { fontSize: Typography.caption, fontWeight: Typography.bold, color: Colors.textPrimary, textAlign: 'center' },
  calibratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: Spacing.sm,
    backgroundColor: Colors.overlayLight,
    marginHorizontal: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  calibratingText: { fontSize: Typography.caption, color: Colors.primary },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
  },
  disclaimerText: { flex: 1, fontSize: Typography.small, color: Colors.textMuted, lineHeight: 18 },
});
