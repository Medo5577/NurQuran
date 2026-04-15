// Powered by OnSpace.AI
export interface Surah {
  id: number;
  name: string;
  nameArabic: string;
  nameTransliteration: string;
  verses: number;
  revelation: 'Meccan' | 'Medinan';
  meaning: string;
}

export interface Verse {
  id: number;
  surahId: number;
  verseNumber: number;
  arabic: string;
  translation: string;
  transliteration: string;
}

export const SURAHS: Surah[] = [
  { id: 1, name: 'Al-Fatihah', nameArabic: 'الفاتحة', nameTransliteration: 'Al-Fatihah', verses: 7, revelation: 'Meccan', meaning: 'The Opening' },
  { id: 2, name: 'Al-Baqarah', nameArabic: 'البقرة', nameTransliteration: 'Al-Baqarah', verses: 286, revelation: 'Medinan', meaning: 'The Cow' },
  { id: 3, name: "Ali 'Imran", nameArabic: 'آل عمران', nameTransliteration: "Ali 'Imran", verses: 200, revelation: 'Medinan', meaning: 'Family of Imran' },
  { id: 4, name: 'An-Nisa', nameArabic: 'النساء', nameTransliteration: "An-Nisa'", verses: 176, revelation: 'Medinan', meaning: 'The Women' },
  { id: 5, name: 'Al-Maidah', nameArabic: 'المائدة', nameTransliteration: 'Al-Maidah', verses: 120, revelation: 'Medinan', meaning: 'The Table Spread' },
  { id: 6, name: "Al-An'am", nameArabic: 'الأنعام', nameTransliteration: "Al-An'am", verses: 165, revelation: 'Meccan', meaning: 'The Cattle' },
  { id: 7, name: "Al-A'raf", nameArabic: 'الأعراف', nameTransliteration: "Al-A'raf", verses: 206, revelation: 'Meccan', meaning: 'The Heights' },
  { id: 8, name: 'Al-Anfal', nameArabic: 'الأنفال', nameTransliteration: 'Al-Anfal', verses: 75, revelation: 'Medinan', meaning: 'The Spoils of War' },
  { id: 9, name: 'At-Tawbah', nameArabic: 'التوبة', nameTransliteration: 'At-Tawbah', verses: 129, revelation: 'Medinan', meaning: 'The Repentance' },
  { id: 10, name: 'Yunus', nameArabic: 'يونس', nameTransliteration: 'Yunus', verses: 109, revelation: 'Meccan', meaning: 'Jonah' },
  { id: 11, name: 'Hud', nameArabic: 'هود', nameTransliteration: 'Hud', verses: 123, revelation: 'Meccan', meaning: 'Hud' },
  { id: 12, name: 'Yusuf', nameArabic: 'يوسف', nameTransliteration: 'Yusuf', verses: 111, revelation: 'Meccan', meaning: 'Joseph' },
  { id: 36, name: 'Ya-Sin', nameArabic: 'يس', nameTransliteration: 'Ya-Sin', verses: 83, revelation: 'Meccan', meaning: 'Ya Sin' },
  { id: 55, name: 'Ar-Rahman', nameArabic: 'الرحمن', nameTransliteration: 'Ar-Rahman', verses: 78, revelation: 'Medinan', meaning: 'The Beneficent' },
  { id: 56, name: "Al-Waqi'ah", nameArabic: 'الواقعة', nameTransliteration: "Al-Waqi'ah", verses: 96, revelation: 'Meccan', meaning: 'The Inevitable' },
  { id: 67, name: 'Al-Mulk', nameArabic: 'الملك', nameTransliteration: 'Al-Mulk', verses: 30, revelation: 'Meccan', meaning: 'The Sovereignty' },
  { id: 112, name: 'Al-Ikhlas', nameArabic: 'الإخلاص', nameTransliteration: 'Al-Ikhlas', verses: 4, revelation: 'Meccan', meaning: 'The Sincerity' },
  { id: 113, name: 'Al-Falaq', nameArabic: 'الفلق', nameTransliteration: 'Al-Falaq', verses: 5, revelation: 'Meccan', meaning: 'The Daybreak' },
  { id: 114, name: 'An-Nas', nameArabic: 'الناس', nameTransliteration: 'An-Nas', verses: 6, revelation: 'Meccan', meaning: 'Mankind' },
];

export const AL_FATIHA_VERSES: Verse[] = [
  { id: 1, surahId: 1, verseNumber: 1, arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.', transliteration: 'Bismillahi r-rahmani r-rahim' },
  { id: 2, surahId: 1, verseNumber: 2, arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: '[All] praise is [due] to Allah, Lord of the worlds -', transliteration: 'Alhamdu lillahi rabbi l-alamin' },
  { id: 3, surahId: 1, verseNumber: 3, arabic: 'الرَّحْمَٰنِ الرَّحِيمِ', translation: 'The Entirely Merciful, the Especially Merciful,', transliteration: 'Ar-rahmani r-rahim' },
  { id: 4, surahId: 1, verseNumber: 4, arabic: 'مَالِكِ يَوْمِ الدِّينِ', translation: 'Sovereign of the Day of Recompense.', transliteration: 'Maliki yawmi d-din' },
  { id: 5, surahId: 1, verseNumber: 5, arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', translation: 'It is You we worship and You we ask for help.', transliteration: 'Iyyaka nabudu wa-iyyaka nastain' },
  { id: 6, surahId: 1, verseNumber: 6, arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', translation: 'Guide us to the straight path -', transliteration: 'Ihdina s-sirata l-mustaqim' },
  { id: 7, surahId: 1, verseNumber: 7, arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', translation: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.', transliteration: 'Sirata l-ladhina anamta alayhim ghayri l-maghdubi alayhim wa-la d-dallin' },
];
