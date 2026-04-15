// Powered by OnSpace.AI
import { useState, useEffect, useCallback } from 'react';
import { fetchAdhkar, AdhkarCategory, AdhkarItem } from '@/services/adhkarApi';

// Static fallback categories if API fails
const FALLBACK_CATEGORIES: AdhkarCategory[] = [
  {
    category: 'Morning Adhkar',
    categoryId: 'morning',
    items: [
      {
        id: 1,
        content: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
        count: 1,
        description: 'We have entered a new morning and the whole Kingdom of Allah has also entered a new morning.',
        reference: 'Abu Dawud 4/317',
      },
      {
        id: 2,
        content: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
        count: 1,
        description: 'O Allah, by Your leave we have reached the morning and by Your leave we have reached the evening.',
        reference: 'At-Tirmidhi 5/466',
      },
      {
        id: 3,
        content: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
        count: 100,
        description: 'Glory be to Allah and praise Him.',
        reference: 'Muslim 4/2071',
      },
    ],
  },
  {
    category: 'Evening Adhkar',
    categoryId: 'evening',
    items: [
      {
        id: 4,
        content: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ للهِ، وَالْحَمْدُ للهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
        count: 1,
        description: 'We have entered a new evening and the whole Kingdom of Allah has also entered a new evening.',
        reference: 'Abu Dawud 4/317',
      },
    ],
  },
  {
    category: 'Before Sleep',
    categoryId: 'sleep',
    items: [
      {
        id: 5,
        content: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
        count: 1,
        description: 'In Your name O Allah, I live and die.',
        reference: 'Al-Bukhari 11/113',
      },
    ],
  },
];

export function useAdhkar() {
  const [categories, setCategories] = useState<AdhkarCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdhkar();
      if (data && data.length > 0) {
        setCategories(data);
        if (!selectedCategory && data.length > 0) {
          setSelectedCategory(data[0].categoryId);
        }
      } else {
        setCategories(FALLBACK_CATEGORIES);
        setSelectedCategory(FALLBACK_CATEGORIES[0].categoryId);
      }
    } catch (e: any) {
      setError(e?.message);
      setCategories(FALLBACK_CATEGORIES);
      setSelectedCategory(FALLBACK_CATEGORIES[0].categoryId);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const activeCategory = categories.find(c => c.categoryId === selectedCategory) ?? categories[0];

  return {
    categories,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
    activeCategory,
    reload: load,
  };
}
