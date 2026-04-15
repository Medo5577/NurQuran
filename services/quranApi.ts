// Powered by OnSpace.AI
// Real Quran API integration - api.alquran.cloud/v1

const BASE_URL = 'https://api.alquran.cloud/v1';

export interface ApiSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface ApiVerse {
  number: number;
  audio: string;
  audioSecondary: string[];
  text: string;
  surah: ApiSurah;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | object;
}

export interface ApiTranslationVerse {
  number: number;
  text: string;
  numberInSurah: number;
}

export interface Edition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
  direction: string | null;
}

export interface SurahWithVerses {
  surah: ApiSurah;
  arabicVerses: ApiVerse[];
  translationVerses: ApiTranslationVerse[];
  transliterationVerses?: ApiTranslationVerse[];
}

// Cache for already fetched data
const cache = new Map<string, any>();

async function fetchWithCache<T>(url: string, cacheKey: string): Promise<T> {
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as T;
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error ${response.status}`);
  const json = await response.json();
  if (json.code !== 200) throw new Error(json.status || 'API Error');
  cache.set(cacheKey, json.data);
  return json.data as T;
}

/** Fetch all 114 surahs metadata */
export async function fetchAllSurahs(): Promise<ApiSurah[]> {
  return fetchWithCache<ApiSurah[]>(`${BASE_URL}/surah`, 'all_surahs');
}

/** Fetch a single surah with Arabic + translation */
export async function fetchSurahWithTranslation(
  surahNumber: number,
  translationEdition = 'en.sahih',
  transliterationEdition = 'en.transliteration'
): Promise<SurahWithVerses> {
  const cacheKey = `surah_${surahNumber}_${translationEdition}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const [arabicRes, translationRes, translitRes] = await Promise.all([
    fetch(`${BASE_URL}/surah/${surahNumber}/ar.alafasy`),
    fetch(`${BASE_URL}/surah/${surahNumber}/${translationEdition}`),
    fetch(`${BASE_URL}/surah/${surahNumber}/${transliterationEdition}`),
  ]);

  const [arabicJson, translationJson, translitJson] = await Promise.all([
    arabicRes.json(),
    translationRes.json(),
    translitRes.json(),
  ]);

  const result: SurahWithVerses = {
    surah: arabicJson.data,
    arabicVerses: arabicJson.data?.ayahs ?? [],
    translationVerses: translationJson.data?.ayahs ?? [],
    transliterationVerses: translitJson.data?.ayahs ?? [],
  };

  cache.set(cacheKey, result);
  return result;
}

/** Fetch available editions (translations / tafsirs) */
export async function fetchEditions(type: 'translation' | 'tafsir' = 'translation'): Promise<Edition[]> {
  return fetchWithCache<Edition[]>(
    `${BASE_URL}/edition/type/${type}`,
    `editions_${type}`
  );
}

/** Search within Quran */
export async function searchQuran(keyword: string, surah?: number): Promise<ApiVerse[]> {
  const url = surah
    ? `${BASE_URL}/search/${encodeURIComponent(keyword)}/surah/${surah}/en.sahih`
    : `${BASE_URL}/search/${encodeURIComponent(keyword)}/all/en.sahih`;
  const response = await fetch(url);
  const json = await response.json();
  return json.data?.matches ?? [];
}

/** Get a specific verse/ayah */
export async function fetchVerse(surah: number, verse: number, edition = 'ar.alafasy'): Promise<ApiVerse> {
  return fetchWithCache<ApiVerse>(
    `${BASE_URL}/ayah/${surah}:${verse}/${edition}`,
    `verse_${surah}_${verse}_${edition}`
  );
}
