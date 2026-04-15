// Powered by OnSpace.AI
export interface PrayerTime {
  name: string;
  nameArabic: string;
  time: string;
  icon: string;
}

export interface PrayerDay {
  date: string;
  hijriDate: string;
  hijriMonth: string;
  hijriYear: number;
  prayers: PrayerTime[];
}

// Mocked prayer times - will be replaced with AlAdhan API
export const getMockedPrayerTimes = (city: string = 'Mecca'): PrayerDay => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  return {
    date: dateStr,
    hijriDate: '15',
    hijriMonth: 'Shawwal',
    hijriYear: 1446,
    prayers: [
      { name: 'Fajr', nameArabic: 'الفجر', time: '05:12', icon: 'wb-twilight' },
      { name: 'Sunrise', nameArabic: 'الشروق', time: '06:41', icon: 'wb-sunny' },
      { name: 'Dhuhr', nameArabic: 'الظهر', time: '12:30', icon: 'light-mode' },
      { name: 'Asr', nameArabic: 'العصر', time: '15:45', icon: 'wb-cloudy' },
      { name: 'Maghrib', nameArabic: 'المغرب', time: '18:32', icon: 'wb-twilight' },
      { name: 'Isha', nameArabic: 'العشاء', time: '19:58', icon: 'nights-stay' },
    ],
  };
};

export const getNextPrayer = (prayers: PrayerTime[]): { prayer: PrayerTime; timeLeft: string } => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentTotal = currentHour * 60 + currentMin;

  for (const prayer of prayers) {
    if (prayer.name === 'Sunrise') continue;
    const [h, m] = prayer.time.split(':').map(Number);
    const prayerTotal = h * 60 + m;
    if (prayerTotal > currentTotal) {
      const diff = prayerTotal - currentTotal;
      const hrs = Math.floor(diff / 60);
      const mins = diff % 60;
      return {
        prayer,
        timeLeft: hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`,
      };
    }
  }
  
  // Next day Fajr
  return {
    prayer: prayers[0],
    timeLeft: 'Tomorrow',
  };
};

export const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
  'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah'
];
