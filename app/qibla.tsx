// Powered by OnSpace.AI
// Qibla finder with real compass via expo-sensors + adhan Qibla calculation

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { Qibla, Coordinates } from 'adhan';
import { Storage } from '@/services/storageService';
import { MECCA_COORDS } from '@/services/prayerService';

export default function QiblaScreen() {
  const router = useRouter();
  const compassAnim = useRef(new Animated.Value(0)).current;
  const needleAnim = useRef(new Animated.Value(0)).current;

  const [heading, setHeading] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState(0);
  const [cityName, setCityName] = useState('Detecting...');
  const [distance, setDistance] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [sensorActive, setSensorActive] = useState(false);
  const [latitude, setLatitude] = useState(MECCA_COORDS.latitude);
  const [longitude, setLongitude] = useState(MECCA_COORDS.longitude);
  const subscriptionRef = useRef<any>(null);

  // Calculate Qibla from coordinates
  const computeQibla = useCallback((lat: number, lng: number) => {
    const coords = new Coordinates(lat, lng);
    const angle = Qibla(coords);
    setQiblaAngle(Math.round(angle));
    // Calculate distance to Mecca (Haversine)
    const R = 6371;
    const dLat = ((MECCA_COORDS.latitude - lat) * Math.PI) / 180;
    const dLng = ((MECCA_COORDS.longitude - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((MECCA_COORDS.latitude * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    setDistance(Math.round(dist));
  }, []);

  // Setup magnetometer + location
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // Load cached location first
      const cached = await Storage.getPrayerLocation();
      if (cached && mounted) {
        setLatitude(cached.lat);
        setLongitude(cached.lng);
        setCityName(cached.city ?? 'Your Location');
        computeQibla(cached.lat, cached.lng);
      }

      // Request live location
      try {
        const Location = await import('expo-location');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted' && mounted) {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const { latitude: lat, longitude: lng } = loc.coords;
          setLatitude(lat);
          setLongitude(lng);
          computeQibla(lat, lng);
          // Get city name
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const json = await res.json();
          const city = json.address?.city ?? json.address?.town ?? json.address?.state ?? 'Your Location';
          if (mounted) setCityName(city);
          await Storage.savePrayerLocation(lat, lng, city);
        } else {
          if (mounted) setPermissionDenied(true);
        }
      } catch {
        if (mounted) setPermissionDenied(true);
      }

      // Start magnetometer
      try {
        const { Magnetometer } = await import('expo-sensors');
        await Magnetometer.setUpdateInterval(200);
        subscriptionRef.current = Magnetometer.addListener(data => {
          if (!mounted) return;
          let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
          if (angle < 0) angle += 360;
          setHeading(Math.round(angle));
          setSensorActive(true);
        });
      } catch {
        // Sensor not available (simulator/web), animate demo
        setSensorActive(false);
      }
    };

    init();
    return () => {
      mounted = false;
      subscriptionRef.current?.remove?.();
    };
  }, [computeQibla]);

  // Animate needle to Qibla relative to compass heading
  useEffect(() => {
    const relativeAngle = qiblaAngle - heading;
    Animated.timing(needleAnim, {
      toValue: relativeAngle,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [qiblaAngle, heading]);

  // Demo animation when sensor not active
  useEffect(() => {
    if (sensorActive) return;
    Animated.timing(needleAnim, {
      toValue: qiblaAngle,
      duration: 800,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
  }, [qiblaAngle, sensorActive]);

  const needleRotate = needleAnim.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
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
        <View style={{ width: 32 }} />
      </View>

      {/* Compass Area */}
      <View style={styles.compassArea}>
        <View style={styles.compassRing}>
          {/* Cardinal Labels */}
          {(['N', 'E', 'S', 'W'] as const).map((dir, i) => {
            const angle = i * 90;
            const rad = (angle - 90) * (Math.PI / 180);
            const r = 128;
            return (
              <Text key={dir} style={[styles.cardinal, {
                left: 157 + r * Math.cos(rad) - 10,
                top: 157 + r * Math.sin(rad) - 10,
                color: dir === 'N' ? Colors.error : Colors.textSecondary,
              }]}>{dir}</Text>
            );
          })}

          {/* Needle */}
          <Animated.View style={[styles.needleWrap, { transform: [{ rotate: needleRotate }] }]}>
            <View style={styles.needleTip}>
              <MaterialIcons name="mosque" size={18} color={Colors.background} />
            </View>
            <View style={styles.needle} />
            <View style={styles.needleTail} />
          </Animated.View>

          {/* Center */}
          <View style={styles.centerDot} />
        </View>

        {/* Degree Info */}
        <View style={styles.degreeInfo}>
          <Text style={styles.degreeNum}>{qiblaAngle}°</Text>
          <Text style={styles.degreeLabel}>{cardinalDir(qiblaAngle)} — Direction to Mecca</Text>
          {sensorActive ? (
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live Compass</Text>
            </View>
          ) : (
            <Text style={styles.demoText}>Demo mode — real compass on device</Text>
          )}
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <MaterialIcons name="location-on" size={20} color={Colors.primary} />
          <Text style={styles.infoLabel}>Location</Text>
          <Text style={styles.infoValue} numberOfLines={2}>{cityName}</Text>
        </View>
        <View style={styles.infoCard}>
          <MaterialIcons name="explore" size={20} color={Colors.primary} />
          <Text style={styles.infoLabel}>Qibla</Text>
          <Text style={styles.infoValue}>{qiblaAngle}° {cardinalDir(qiblaAngle)}</Text>
        </View>
        <View style={styles.infoCard}>
          <MaterialIcons name="flight" size={20} color={Colors.primary} />
          <Text style={styles.infoLabel}>Distance</Text>
          <Text style={styles.infoValue}>{distance > 0 ? `${distance.toLocaleString()} km` : '...'}</Text>
        </View>
      </View>

      {permissionDenied ? (
        <View style={styles.permissionBanner}>
          <MaterialIcons name="location-off" size={14} color={Colors.warning} />
          <Text style={styles.permissionText}>
            Location permission denied. Showing Qibla from approximate location.
          </Text>
        </View>
      ) : null}

      <View style={styles.disclaimer}>
        <MaterialIcons name="info-outline" size={14} color={Colors.textMuted} />
        <Text style={styles.disclaimerText}>
          Qibla calculated using Adhan library. Hold device flat for accurate compass readings.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontSize: Typography.h4, fontWeight: Typography.bold, color: Colors.textPrimary },
  titleAr: { fontSize: Typography.caption, color: Colors.primary, marginTop: 2 },
  compassArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  compassRing: {
    width: 315, height: 315, borderRadius: 157.5,
    borderWidth: 2, borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25, shadowRadius: 20, elevation: 10,
  },
  cardinal: {
    position: 'absolute', fontSize: Typography.body,
    fontWeight: Typography.bold, width: 20, textAlign: 'center',
  },
  needleWrap: {
    width: 4, height: 210, alignItems: 'center', position: 'absolute',
  },
  needleTip: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  needle: { width: 3, flex: 1, backgroundColor: Colors.primary, borderRadius: 2 },
  needleTail: { width: 3, height: 72, backgroundColor: Colors.textMuted, borderRadius: 2, marginTop: 4 },
  centerDot: {
    position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.primary,
  },
  degreeInfo: { marginTop: Spacing.lg, alignItems: 'center' },
  degreeNum: { fontSize: 48, fontWeight: Typography.bold, color: Colors.primary, lineHeight: 56 },
  degreeLabel: { fontSize: Typography.body, color: Colors.textSecondary, marginTop: 4 },
  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  liveText: { fontSize: Typography.caption, color: Colors.success, fontWeight: Typography.bold },
  demoText: { fontSize: Typography.caption, color: Colors.textMuted, marginTop: 6, fontStyle: 'italic' },
  infoRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm,
  },
  infoCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.sm, alignItems: 'center', borderWidth: 1,
    borderColor: Colors.surfaceBorder, gap: 4,
  },
  infoLabel: { fontSize: Typography.small, color: Colors.textSecondary, textAlign: 'center' },
  infoValue: { fontSize: Typography.caption, fontWeight: Typography.bold, color: Colors.textPrimary, textAlign: 'center' },
  permissionBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm, padding: Spacing.sm,
    backgroundColor: Colors.warning + '15', borderRadius: Radius.sm,
  },
  permissionText: { flex: 1, fontSize: Typography.small, color: Colors.textSecondary, lineHeight: 18 },
  disclaimer: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    marginHorizontal: Spacing.md, marginBottom: Spacing.lg, padding: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.sm,
  },
  disclaimerText: { flex: 1, fontSize: Typography.small, color: Colors.textMuted, lineHeight: 18 },
});
