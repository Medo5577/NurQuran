// Powered by OnSpace.AI
// mp3quran.net API v3 - Reciters, Radio, Live TV, Videos

const MP3_BASE = 'https://mp3quran.net/api/v3';

export interface Reciter {
  id: number;
  name: string;
  letter: string;
  moshaf: MoshafItem[];
}

export interface MoshafItem {
  id: number;
  name: string;
  moshaf_type: number;
  server: string;
  surah_list: string;
  surah_total: number;
  quality: string;
}

export interface RadioStation {
  id: number;
  name: string;
  url: string;
}

export interface LiveTVStation {
  id: number;
  name: string;
  url: string;
  img: string;
}

export interface VideoType {
  id: number;
  name: string;
}

export interface VideoItem {
  id: number;
  title: string;
  reciter_name: string;
  url: string;
  thumbnail: string;
  surah?: string;
  type_id: number;
}

export interface AdhkarAudio {
  id: number;
  name: string;
  url: string;
  rewayah?: string;
}

const mp3Cache = new Map<string, any>();

async function mp3Fetch<T>(path: string, cacheKey: string): Promise<T> {
  if (mp3Cache.has(cacheKey)) return mp3Cache.get(cacheKey) as T;
  const res = await fetch(`${MP3_BASE}/${path}`);
  if (!res.ok) throw new Error(`mp3quran API error ${res.status}`);
  const json = await res.json();
  mp3Cache.set(cacheKey, json);
  return json as T;
}

/** Fetch all reciters */
export async function fetchReciters(language = 'ar'): Promise<Reciter[]> {
  const data = await mp3Fetch<{ reciters: Reciter[] }>(`reciters?language=${language}`, `reciters_${language}`);
  return data.reciters ?? [];
}

/** Get audio URL for a specific surah by reciter server */
export function getSurahAudioUrl(server: string, surahNumber: number): string {
  const paddedSurah = String(surahNumber).padStart(3, '0');
  return `${server}${paddedSurah}.mp3`;
}

/** Fetch radio stations */
export async function fetchRadioStations(language = 'ar'): Promise<RadioStation[]> {
  const data = await mp3Fetch<{ radios: RadioStation[] }>(`radios?language=${language}`, `radios_${language}`);
  return data.radios ?? [];
}

/** Fetch live TV stations */
export async function fetchLiveTVStations(language = 'ar'): Promise<LiveTVStation[]> {
  const data = await mp3Fetch<{ live_tv: LiveTVStation[] }>(`live-tv?language=${language}`, `live_tv_${language}`);
  return data.live_tv ?? [];
}

/** Fetch video types/categories */
export async function fetchVideoTypes(language = 'ar'): Promise<VideoType[]> {
  const data = await mp3Fetch<{ video_types: VideoType[] }>(`video_types?language=${language}`, `video_types_${language}`);
  return data.video_types ?? [];
}

/** Fetch videos optionally filtered by type */
export async function fetchVideos(language = 'ar', typeId?: number): Promise<VideoItem[]> {
  const q = typeId ? `language=${language}&type_id=${typeId}` : `language=${language}`;
  const data = await mp3Fetch<{ video: VideoItem[] }>(`videos?${q}`, `videos_${language}_${typeId ?? 'all'}`);
  return data.video ?? [];
}

/** Fetch adhkar audio list */
export async function fetchAdhkarAudio(language = 'ar'): Promise<AdhkarAudio[]> {
  try {
    const data = await mp3Fetch<{ adhkar: AdhkarAudio[] }>(`adhkar?language=${language}`, `adhkar_${language}`);
    return data.adhkar ?? [];
  } catch {
    return [];
  }
}
