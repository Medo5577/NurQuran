// Powered by OnSpace.AI
export interface Hadith {
  id: number;
  collection: string;
  bookNumber: number;
  hadithNumber: number;
  arabic: string;
  translation: string;
  narrator: string;
  grade: string;
  category: string;
}

export interface HadithCollection {
  id: string;
  name: string;
  nameArabic: string;
  author: string;
  totalHadiths: number;
  color: string;
}

export const HADITH_COLLECTIONS: HadithCollection[] = [
  { id: 'bukhari', name: 'Sahih Al-Bukhari', nameArabic: 'صحيح البخاري', author: 'Imam Al-Bukhari', totalHadiths: 7563, color: '#C9A84C' },
  { id: 'muslim', name: 'Sahih Muslim', nameArabic: 'صحيح مسلم', author: 'Imam Muslim', totalHadiths: 7453, color: '#2ECC71' },
  { id: 'tirmidhi', name: 'Jami At-Tirmidhi', nameArabic: 'جامع الترمذي', author: 'Imam At-Tirmidhi', totalHadiths: 3956, color: '#5294E0' },
  { id: 'abudawud', name: 'Sunan Abu Dawud', nameArabic: 'سنن أبي داود', author: 'Imam Abu Dawud', totalHadiths: 5274, color: '#E05252' },
  { id: 'nasai', name: "Sunan An-Nasa'i", nameArabic: 'سنن النسائي', author: "Imam An-Nasa'i", totalHadiths: 5761, color: '#7B68EE' },
  { id: '40nawawi', name: '40 Hadith Nawawi', nameArabic: 'الأربعون النووية', author: 'Imam An-Nawawi', totalHadiths: 42, color: '#1A8C6E' },
];

export const FORTY_NAWAWI: Hadith[] = [
  {
    id: 1,
    collection: '40nawawi',
    bookNumber: 1,
    hadithNumber: 1,
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    translation: 'Actions are judged by intentions, so each person will have what they intended.',
    narrator: 'Umar ibn Al-Khattab (RA)',
    grade: 'Sahih',
    category: 'Intention',
  },
  {
    id: 2,
    collection: '40nawawi',
    bookNumber: 1,
    hadithNumber: 2,
    arabic: 'الإِسْلَامُ أَنْ تَشْهَدَ أَنْ لاَ إِلَهَ إِلاَّ اللهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللهِ',
    translation: 'Islam is to testify that there is no deity worthy of worship except Allah and that Muhammad is the Messenger of Allah, to establish the prayers, to pay the Zakat, to fast in Ramadhan, and to make the pilgrimage to the House if you are able to do so.',
    narrator: 'Umar ibn Al-Khattab (RA)',
    grade: 'Sahih',
    category: 'Pillars of Islam',
  },
  {
    id: 3,
    collection: '40nawawi',
    bookNumber: 1,
    hadithNumber: 3,
    arabic: 'بُنِيَ الإِسْلَامُ عَلَى خَمْسٍ',
    translation: 'Islam has been built upon five things: on testifying that there is no god save Allah, and that Muhammad is His Messenger; on performing salah; on giving the zakah; on Hajj to the House; and on fasting during Ramadhan.',
    narrator: 'Ibn Umar (RA)',
    grade: 'Sahih',
    category: 'Pillars of Islam',
  },
  {
    id: 4,
    collection: '40nawawi',
    bookNumber: 1,
    hadithNumber: 5,
    arabic: 'مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ مِنْهُ فَهُوَ رَدٌّ',
    translation: 'Whoever introduces into this affair of ours something that does not belong to it will have it rejected.',
    narrator: 'Aisha (RA)',
    grade: 'Sahih',
    category: 'Innovation',
  },
  {
    id: 5,
    collection: '40nawawi',
    bookNumber: 1,
    hadithNumber: 6,
    arabic: 'إِنَّ الْحَلَالَ بَيِّنٌ وَإِنَّ الْحَرَامَ بَيِّنٌ وَبَيْنَهُمَا مُشْتَبِهَاتٌ',
    translation: 'The halal is clear and the haram is clear, and between them are doubtful matters that many people do not know about.',
    narrator: 'An-Numan ibn Bashir (RA)',
    grade: 'Sahih',
    category: 'Halal and Haram',
  },
];
