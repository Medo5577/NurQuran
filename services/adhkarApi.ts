// Powered by OnSpace.AI
// Adhkar from rn0x/Adhkar-json GitHub repository

const ADHKAR_URL = 'https://raw.githubusercontent.com/rn0x/Adhkar-json/main/adhkar.json';

export interface AdhkarItem {
  id: number;
  content: string;
  count: number;
  description: string;
  reference: string;
  audio?: string;
}

export interface AdhkarCategory {
  category: string;
  categoryId: string;
  items: AdhkarItem[];
}

let adhkarCache: AdhkarCategory[] | null = null;

export async function fetchAdhkar(): Promise<AdhkarCategory[]> {
  if (adhkarCache) return adhkarCache;
  try {
    const res = await fetch(ADHKAR_URL);
    if (!res.ok) throw new Error('Failed to fetch adhkar');
    const json = await res.json();
    // The JSON is an object where keys are category names
    if (Array.isArray(json)) {
      adhkarCache = json;
      return json;
    }
    // Handle object format
    const categories: AdhkarCategory[] = Object.entries(json).map(([key, value]: [string, any]) => ({
      category: value.category ?? key,
      categoryId: key,
      items: Array.isArray(value.array)
        ? value.array.map((item: any, idx: number) => ({
            id: idx + 1,
            content: item.content ?? item.text ?? '',
            count: Number(item.count) || 1,
            description: item.description ?? item.note ?? '',
            reference: item.reference ?? item.source ?? '',
            audio: item.audio,
          }))
        : [],
    }));
    adhkarCache = categories;
    return categories;
  } catch (e) {
    console.warn('Adhkar API failed, using fallback', e);
    return [];
  }
}

export function clearAdhkarCache() {
  adhkarCache = null;
}
