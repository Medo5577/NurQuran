// Powered by OnSpace.AI
export interface Dhikr {
  id: number;
  arabic: string;
  transliteration: string;
  translation: string;
  count: number;
  virtue: string;
  category: string;
}

export interface AzkarCategory {
  id: string;
  name: string;
  nameArabic: string;
  icon: string;
  color: string;
  count: number;
}

export const AZKAR_CATEGORIES: AzkarCategory[] = [
  { id: 'morning', name: 'Morning Azkar', nameArabic: 'أذكار الصباح', icon: 'wb-sunny', color: '#E8A84C', count: 15 },
  { id: 'evening', name: 'Evening Azkar', nameArabic: 'أذكار المساء', icon: 'nights-stay', color: '#5294E0', count: 15 },
  { id: 'sleep', name: 'Before Sleep', nameArabic: 'أذكار النوم', icon: 'bedtime', color: '#7B68EE', count: 8 },
  { id: 'prayer', name: 'After Prayer', nameArabic: 'أذكار بعد الصلاة', icon: 'mosque', color: '#2ECC71', count: 10 },
  { id: 'general', name: 'General Duas', nameArabic: 'الأدعية العامة', icon: 'favorite', color: '#E05252', count: 20 },
  { id: 'quran', name: 'Quran Duas', nameArabic: 'أدعية القرآن', icon: 'menu-book', color: '#C9A84C', count: 12 },
];

export const MORNING_AZKAR: Dhikr[] = [
  {
    id: 1,
    category: 'morning',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    transliteration: 'Asbahna wa-asbahal-mulku lillah, walhamdu lillah, la ilaha illallah wahdahu la sharika lah',
    translation: 'We have reached the morning and at this very time the sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without any partner.',
    count: 1,
    virtue: 'The Prophet (PBUH) used to say this every morning',
  },
  {
    id: 2,
    category: 'morning',
    arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
    transliteration: 'Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu, wa ilaykan-nushur',
    translation: 'O Allah, by Your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die and unto You is our resurrection.',
    count: 1,
    virtue: 'From the Sunnah of the Prophet (PBUH)',
  },
  {
    id: 3,
    category: 'morning',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'Subhanallahi wa bihamdih',
    translation: 'Glory is to Allah and praise is to Him.',
    count: 100,
    virtue: 'Whoever says this 100 times in the morning and evening, no one will come on the Day of Resurrection with anything better than him',
  },
  {
    id: 4,
    category: 'morning',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'La ilaha illallah wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa ala kulli shayin qadir',
    translation: 'None has the right to be worshipped except Allah, alone, without any partner. To Him belongs all sovereignty and praise, and He is over all things omnipotent.',
    count: 10,
    virtue: 'Equivalent to freeing four slaves from the descendants of Ismail',
  },
];

export const EVENING_AZKAR: Dhikr[] = [
  {
    id: 5,
    category: 'evening',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    transliteration: 'Amsayna wa amsal-mulku lillah, walhamdu lillah, la ilaha illallah wahdahu la sharika lah',
    translation: 'We have reached the evening and at this very time the sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without any partner.',
    count: 1,
    virtue: 'Evening counterpart of the morning supplication',
  },
  {
    id: 6,
    category: 'evening',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ',
    transliteration: 'Allahumma anta rabbi la ilaha illa ant, khalaqtani wa ana abduk',
    translation: 'O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am your servant.',
    count: 1,
    virtue: 'Sayyid al-Istighfar - the master of seeking forgiveness',
  },
];

export const TASBEEH_OPTIONS = [
  { id: 1, arabic: 'سُبْحَانَ اللَّهِ', transliteration: 'SubhanAllah', translation: 'Glory be to Allah', defaultCount: 33 },
  { id: 2, arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', translation: 'All praise is due to Allah', defaultCount: 33 },
  { id: 3, arabic: 'اللَّهُ أَكْبَرُ', transliteration: 'Allahu Akbar', translation: 'Allah is the Greatest', defaultCount: 34 },
  { id: 4, arabic: 'لَا إِلَهَ إِلَّا اللَّهُ', transliteration: 'La ilaha illallah', translation: 'There is no god but Allah', defaultCount: 100 },
  { id: 5, arabic: 'اسْتَغْفِرُ اللَّهَ', transliteration: 'Astaghfirullah', translation: 'I seek forgiveness from Allah', defaultCount: 100 },
  { id: 6, arabic: 'صَلِّ اللَّهُ عَلَيْهِ وَسَلَّمَ', transliteration: 'Salla Allahu alayhi wa sallam', translation: 'May Allah bless him and grant him peace', defaultCount: 100 },
];
