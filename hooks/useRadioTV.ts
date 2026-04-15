// Powered by OnSpace.AI
import { useState, useEffect, useCallback } from 'react';
import { fetchRadioStations, fetchLiveTVStations, RadioStation, LiveTVStation } from '@/services/mp3quranApi';

export function useRadioTV() {
  const [radioStations, setRadioStations] = useState<RadioStation[]>([]);
  const [tvStations, setTvStations] = useState<LiveTVStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [radios, tv] = await Promise.all([
        fetchRadioStations('en'),
        fetchLiveTVStations('en'),
      ]);
      setRadioStations(radios);
      setTvStations(tv);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load radio/TV');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { radioStations, tvStations, loading, error, reload: load };
}
