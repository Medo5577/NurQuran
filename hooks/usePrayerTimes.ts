// Powered by OnSpace.AI
import { useState, useEffect, useCallback } from 'react';
import { calculatePrayerTimes, DayPrayerTimes, getNextPrayer, MECCA_COORDS, CalculationMethodKey } from '@/services/prayerService';
import { Storage } from '@/services/storageService';

async function fetchCityName(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const json = await res.json();
    return json.address?.city ?? json.address?.town ?? json.address?.state ?? 'Unknown';
  } catch {
    return 'Unknown';
  }
}

export function usePrayerTimes() {
  const [prayerData, setPrayerData] = useState<DayPrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string>('Detecting...');
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'unknown'>('unknown');
  const [calculationMethod, setCalculationMethod] = useState<CalculationMethodKey>('UmmAlQura');

  const loadPrayerTimes = useCallback(async (lat: number, lng: number, method: CalculationMethodKey) => {
    try {
      const data = calculatePrayerTimes(lat, lng, method);
      setPrayerData(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Calculation error');
    }
  }, []);

  const detectLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    const settings = await Storage.getSettings();
    const method = (settings.calculationMethod as CalculationMethodKey) ?? 'UmmAlQura';
    setCalculationMethod(method);

    // Check cached location
    const cached = await Storage.getPrayerLocation();
    if (cached) {
      setCityName(cached.city ?? 'Unknown');
      await loadPrayerTimes(cached.lat, cached.lng, method);
      setLoading(false);
    }

    // Try geolocation
    try {
      // Dynamic import to avoid SSR issues
      const Location = await import('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationPermission('denied');
        if (!cached) {
          // Fallback to Mecca
          await loadPrayerTimes(MECCA_COORDS.latitude, MECCA_COORDS.longitude, method);
          setCityName('Mecca (Default)');
        }
        setLoading(false);
        return;
      }
      setLocationPermission('granted');
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      await loadPrayerTimes(latitude, longitude, method);
      const city = await fetchCityName(latitude, longitude);
      setCityName(city);
      await Storage.savePrayerLocation(latitude, longitude, city);
    } catch (e: any) {
      setLocationPermission('denied');
      if (!cached) {
        await loadPrayerTimes(MECCA_COORDS.latitude, MECCA_COORDS.longitude, method);
        setCityName('Mecca (Default)');
      }
    } finally {
      setLoading(false);
    }
  }, [loadPrayerTimes]);

  const changeMethod = useCallback(async (method: CalculationMethodKey) => {
    setCalculationMethod(method);
    await Storage.saveSettings({ calculationMethod: method });
    const cached = await Storage.getPrayerLocation();
    const lat = cached?.lat ?? MECCA_COORDS.latitude;
    const lng = cached?.lng ?? MECCA_COORDS.longitude;
    await loadPrayerTimes(lat, lng, method);
  }, [loadPrayerTimes]);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  const nextPrayerInfo = prayerData
    ? getNextPrayer(prayerData.prayers)
    : null;

  return {
    prayerData,
    loading,
    error,
    cityName,
    locationPermission,
    calculationMethod,
    nextPrayerInfo,
    refresh: detectLocation,
    changeMethod,
  };
}
