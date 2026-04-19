// Powered by OnSpace.AI
// Azan notification service using expo-notifications

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PrayerEntry } from './prayerService';

const NOTIF_SETTINGS_KEY = '@azan_notifications';

export interface AzanNotificationSettings {
  enabled: boolean;
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  sound: 'azan' | 'beep' | 'silent';
}

const DEFAULT_SETTINGS: AzanNotificationSettings = {
  enabled: true,
  fajr: true,
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true,
  sound: 'beep',
};

// ─── Setup ──────────────────────────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Settings ───────────────────────────────────────────────────────────────
export async function getNotificationSettings(): Promise<AzanNotificationSettings> {
  try {
    const raw = await AsyncStorage.getItem(NOTIF_SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveNotificationSettings(settings: Partial<AzanNotificationSettings>): Promise<void> {
  const current = await getNotificationSettings();
  const updated = { ...current, ...settings };
  await AsyncStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(updated));
}

// ─── Schedule Prayers ────────────────────────────────────────────────────────
const PRAYER_ICONS: Record<string, string> = {
  Fajr: '🌙',
  Dhuhr: '☀️',
  Asr: '🌤️',
  Maghrib: '🌅',
  Isha: '⭐',
};

const PRAYER_KEYS: Record<string, keyof AzanNotificationSettings> = {
  Fajr: 'fajr',
  Dhuhr: 'dhuhr',
  Asr: 'asr',
  Maghrib: 'maghrib',
  Isha: 'isha',
};

export async function scheduleAzanNotifications(prayers: PrayerEntry[]): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.enabled) return;

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  // Cancel existing prayer notifications
  await cancelAllAzanNotifications();

  const now = Date.now();

  for (const prayer of prayers) {
    if (prayer.name === 'Sunrise') continue;

    const key = PRAYER_KEYS[prayer.name];
    if (key && !settings[key]) continue;

    // Only schedule future prayers
    if (prayer.timestamp <= now) continue;

    const icon = PRAYER_ICONS[prayer.name] ?? '🕌';
    const arabicNames: Record<string, string> = {
      Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء',
    };

    await Notifications.scheduleNotificationAsync({
      identifier: `azan_${prayer.name.toLowerCase()}`,
      content: {
        title: `${icon} حان وقت ${arabicNames[prayer.name] ?? prayer.name}`,
        body: `It is time for ${prayer.name} prayer — ${prayer.time}`,
        data: { prayerName: prayer.name },
        sound: settings.sound !== 'silent',
        color: '#C9A84C',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(prayer.timestamp),
      },
    });
  }
}

export async function cancelAllAzanNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const azanIds = scheduled
    .filter(n => n.identifier.startsWith('azan_'))
    .map(n => n.identifier);
  for (const id of azanIds) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}

// ─── Immediate test notification ─────────────────────────────────────────────
export async function sendTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🕌 Azan Notifications Active',
      body: 'You will receive prayer time reminders daily.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}
