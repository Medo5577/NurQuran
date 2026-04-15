// Powered by OnSpace.AI
// Prayer times calculation using adhan library + geolocation

import { PrayerTimes, Coordinates, CalculationMethod, Qibla } from 'adhan';

export type CalculationMethodKey =
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Dubai'
  | 'MoonsightingCommittee'
  | 'NorthAmerica'
  | 'Kuwait'
  | 'Qatar'
  | 'Singapore'
  | 'Tehran'
  | 'Turkey'
  | 'Other';

export const CALCULATION_METHODS: { key: CalculationMethodKey; label: string; labelAr: string }[] = [
  { key: 'UmmAlQura', label: 'Umm Al-Qura (Mecca)', labelAr: 'أم القرى' },
  { key: 'MuslimWorldLeague', label: 'Muslim World League', labelAr: 'رابطة العالم الإسلامي' },
  { key: 'Egyptian', label: 'Egyptian General', labelAr: 'الهيئة المصرية' },
  { key: 'Karachi', label: 'University of Islamic Sciences, Karachi', labelAr: 'جامعة العلوم الإسلامية' },
  { key: 'NorthAmerica', label: 'Islamic Society of North America', labelAr: 'جمعية أمريكا الشمالية' },
  { key: 'Kuwait', label: 'Kuwait', labelAr: 'الكويت' },
  { key: 'Qatar', label: 'Qatar', labelAr: 'قطر' },
  { key: 'Dubai', label: 'Dubai', labelAr: 'دبي' },
  { key: 'Turkey', label: 'Turkey', labelAr: 'تركيا' },
  { key: 'Singapore', label: 'Singapore', labelAr: 'سنغافورة' },
  { key: 'Tehran', label: 'Tehran (Shia)', labelAr: 'طهران' },
  { key: 'MoonsightingCommittee', label: "Moonsighting Committee", labelAr: 'لجنة رؤية الهلال' },
];

export interface PrayerEntry {
  name: string;
  nameArabic: string;
  time: string;
  timestamp: number;
  icon: string;
  isNext?: boolean;
}

export interface DayPrayerTimes {
  prayers: PrayerEntry[];
  date: string;
  hijriDate: string;
  hijriMonth: string;
  hijriYear: number;
  cityName?: string;
  latitude: number;
  longitude: number;
  qiblaAngle: number;
}

function getMethod(key: CalculationMethodKey) {
  const map: Record<CalculationMethodKey, any> = {
    MuslimWorldLeague: CalculationMethod.MuslimWorldLeague(),
    Egyptian: CalculationMethod.Egyptian(),
    Karachi: CalculationMethod.Karachi(),
    UmmAlQura: CalculationMethod.UmmAlQura(),
    Dubai: CalculationMethod.Dubai(),
    MoonsightingCommittee: CalculationMethod.MoonsightingCommittee(),
    NorthAmerica: CalculationMethod.NorthAmerica(),
    Kuwait: CalculationMethod.Kuwait(),
    Qatar: CalculationMethod.Qatar(),
    Singapore: CalculationMethod.Singapore(),
    Tehran: CalculationMethod.Tehran(),
    Turkey: CalculationMethod.Turkey(),
    Other: CalculationMethod.Other(),
  };
  return map[key] ?? CalculationMethod.UmmAlQura();
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function toHijri(date: Date): { day: number; month: string; year: number } {
  // Approximate Hijri conversion (accurate within ±1 day)
  const jd = Math.floor(date.getTime() / 86400000) + 2440588;
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  const months = [
    'Muharram', 'Safar', "Rabi' Al-Awwal", "Rabi' Al-Akhir",
    'Jumada Al-Ula', 'Jumada Al-Akhirah', 'Rajab', "Sha'ban",
    'Ramadan', 'Shawwal', "Dhul Qi'dah", 'Dhul Hijjah',
  ];

  return { day, month: months[Math.max(0, month - 1)], year };
}

export function calculatePrayerTimes(
  latitude: number,
  longitude: number,
  methodKey: CalculationMethodKey = 'UmmAlQura',
  date: Date = new Date()
): DayPrayerTimes {
  const coords = new Coordinates(latitude, longitude);
  const params = getMethod(methodKey);
  const prayerTimes = new PrayerTimes(coords, date, params);
  const qiblaAngle = Qibla(coords);
  const hijri = toHijri(date);

  const prayerList: PrayerEntry[] = [
    { name: 'Fajr', nameArabic: 'الفجر', time: formatTime(prayerTimes.fajr), timestamp: prayerTimes.fajr.getTime(), icon: 'bedtime' },
    { name: 'Sunrise', nameArabic: 'الشروق', time: formatTime(prayerTimes.sunrise), timestamp: prayerTimes.sunrise.getTime(), icon: 'wb-sunny' },
    { name: 'Dhuhr', nameArabic: 'الظهر', time: formatTime(prayerTimes.dhuhr), timestamp: prayerTimes.dhuhr.getTime(), icon: 'wb-cloudy' },
    { name: 'Asr', nameArabic: 'العصر', time: formatTime(prayerTimes.asr), timestamp: prayerTimes.asr.getTime(), icon: 'cloud' },
    { name: 'Maghrib', nameArabic: 'المغرب', time: formatTime(prayerTimes.maghrib), timestamp: prayerTimes.maghrib.getTime(), icon: 'nights-stay' },
    { name: 'Isha', nameArabic: 'العشاء', time: formatTime(prayerTimes.isha), timestamp: prayerTimes.isha.getTime(), icon: 'star' },
  ];

  const now = Date.now();
  let nextPrayerIdx = prayerList.findIndex(p => p.timestamp > now);
  if (nextPrayerIdx === -1) nextPrayerIdx = 0;
  prayerList[nextPrayerIdx].isNext = true;

  return {
    prayers: prayerList,
    date: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    hijriDate: String(hijri.day),
    hijriMonth: hijri.month,
    hijriYear: hijri.year,
    latitude,
    longitude,
    qiblaAngle: Math.round(qiblaAngle),
  };
}

export function getNextPrayer(prayers: PrayerEntry[]): { prayer: PrayerEntry; timeLeft: string; minutesLeft: number } {
  const now = Date.now();
  let next = prayers.find(p => p.timestamp > now && p.name !== 'Sunrise');
  if (!next) next = prayers.find(p => p.name === 'Fajr') ?? prayers[0];

  const diff = Math.max(0, next.timestamp - now);
  const totalMin = Math.floor(diff / 60000);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  const timeLeft = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return { prayer: next, timeLeft, minutesLeft: totalMin };
}

// Fallback coords: Mecca
export const MECCA_COORDS = { latitude: 21.4225, longitude: 39.8262 };
export const MECCA_QIBLA = 0;

export const HIJRI_MONTHS = [
  'Muharram', 'Safar', "Rabi' Al-Awwal", "Rabi' Al-Akhir",
  'Jumada Al-Ula', 'Jumada Al-Akhirah', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhul Qi'dah", 'Dhul Hijjah',
];
