// Powered by OnSpace.AI
// Real Hadith API integration — hadith.gading.dev

import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://hadith.gading.dev';
const CACHE_KEY = '@hadith_cache_';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface HadithItem {
  number: number;
  arab: string;
  id: string; // Indonesian/English translation
}

export interface HadithCollection {
  name: string;
  id: string;
  available: number;
  requested: number;
  hadiths: HadithItem[];
}

export interface HadithMeta {
  id: string;
  name: string;
  nameArabic: string;
  total: number;
  color: string;
  author: string;
  about: string;
}

export const HADITH_COLLECTIONS_META: HadithMeta[] = [
  {
    id: 'bukhari',
    name: 'Sahih Bukhari',
    nameArabic: 'صحيح البخاري',
    total: 7563,
    color: '#C9A84C',
    author: 'Imam Muhammad ibn Ismail al-Bukhari',
    about: 'The most authentic collection of Hadith, compiled by Imam Bukhari with rigorous standards.',
  },
  {
    id: 'muslim',
    name: 'Sahih Muslim',
    nameArabic: 'صحيح مسلم',
    total: 5362,
    color: '#5294E0',
    author: 'Imam Muslim ibn al-Hajjaj',
    about: 'Second most authentic Hadith collection, distinguished for its methodology.',
  },
  {
    id: 'abu-dawud',
    name: 'Sunan Abu Dawud',
    nameArabic: 'سنن أبي داود',
    total: 5274,
    color: '#2ECC71',
    author: 'Imam Abu Dawud al-Sijistani',
    about: 'A major Hadith collection focusing on legal traditions of the Prophet.',
  },
  {
    id: 'tirmidzi',
    name: 'Jami At-Tirmidhi',
    nameArabic: 'جامع الترمذي',
    total: 3956,
    color: '#E05252',
    author: 'Imam Muhammad ibn Isa at-Tirmidhi',
    about: 'Known for grading Hadiths and juristic commentary.',
  },
  {
    id: 'nasai',
    name: 'Sunan An-Nasai',
    nameArabic: 'سنن النسائي',
    total: 5761,
    color: '#E8A84C',
    author: 'Imam Ahmad ibn Shuayb an-Nasai',
    about: 'One of the Kutub al-Sittah, particularly focused on prayer-related traditions.',
  },
  {
    id: 'ibnu-majah',
    name: 'Sunan Ibn Majah',
    nameArabic: 'سنن ابن ماجه',
    total: 4341,
    color: '#7B68EE',
    author: 'Imam Muhammad ibn Yazid Ibn Majah',
    about: 'One of the six canonical Hadith collections.',
  },
];

// ─── Fetch with cache ─────────────────────────────────────────────────────────
async function fetchWithCache(
  collectionId: string,
  page: number,
  limit: number
): Promise<HadithCollection | null> {
  const cacheKey = `${CACHE_KEY}${collectionId}_${page}_${limit}`;

  // Check cache
  try {
    const raw = await AsyncStorage.getItem(cacheKey);
    if (raw) {
      const { data, cachedAt } = JSON.parse(raw);
      if (Date.now() - cachedAt < CACHE_TTL) {
        return data;
      }
    }
  } catch {}

  // Fetch from API
  try {
    const url = `${BASE_URL}/books/${collectionId}?range=${(page - 1) * limit + 1}-${page * limit}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (!json.data) throw new Error('Invalid response');

    const data: HadithCollection = json.data;

    // Cache it
    await AsyncStorage.setItem(cacheKey, JSON.stringify({ data, cachedAt: Date.now() }));

    return data;
  } catch (e) {
    console.warn('Hadith API error:', e);
    return null;
  }
}

export async function fetchHadithPage(
  collectionId: string,
  page: number = 1,
  limit: number = 20
): Promise<HadithCollection | null> {
  return fetchWithCache(collectionId, page, limit);
}

export async function fetchHadithById(
  collectionId: string,
  number: number
): Promise<HadithItem | null> {
  try {
    const res = await fetch(`${BASE_URL}/books/${collectionId}/${number}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.hadiths?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function searchHadith(
  collectionId: string,
  query: string,
  limit = 50
): Promise<HadithItem[]> {
  // Fetch first 2 pages and filter locally
  const [page1, page2] = await Promise.allSettled([
    fetchHadithPage(collectionId, 1, limit),
    fetchHadithPage(collectionId, 2, limit),
  ]);

  const all: HadithItem[] = [];
  if (page1.status === 'fulfilled' && page1.value) all.push(...page1.value.hadiths);
  if (page2.status === 'fulfilled' && page2.value) all.push(...page2.value.hadiths);

  const q = query.toLowerCase();
  return all.filter(h =>
    h.id.toLowerCase().includes(q) ||
    h.arab.includes(query) ||
    String(h.number).includes(q)
  );
}
