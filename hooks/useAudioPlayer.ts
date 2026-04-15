// Powered by OnSpace.AI
import { useState, useEffect, useCallback } from 'react';
import { audioPlayer, AudioState, formatAudioTime } from '@/services/audioService';
import { getSurahAudioUrl, fetchReciters, Reciter } from '@/services/mp3quranApi';
import { Storage } from '@/services/storageService';

export const DEFAULT_RECITERS = [
  { id: 7, name: 'Mishary Rashid Alafasy', nameAr: 'مشاري راشد العفاسي', server: 'https://server8.mp3quran.net/afs/' },
  { id: 5, name: 'Abdul Basit Abdul Samad', nameAr: 'عبد الباسط عبد الصمد', server: 'https://server7.mp3quran.net/basit/Murattal/' },
  { id: 6, name: 'Mahmoud Khalil Al-Husary', nameAr: 'محمود خليل الحصري', server: 'https://server13.mp3quran.net/husr/' },
  { id: 3, name: 'Mohamed Siddiq El-Minshawi', nameAr: 'محمد صديق المنشاوي', server: 'https://server10.mp3quran.net/minsh/' },
  { id: 1, name: 'Abdul Rahman Al-Sudais', nameAr: 'عبدالرحمن السديس', server: 'https://server11.mp3quran.net/sds/' },
  { id: 4, name: 'Saad Al-Ghamdi', nameAr: 'سعد الغامدي', server: 'https://server7.mp3quran.net/s_gmd/' },
  { id: 8, name: 'Yasser Al-Dosari', nameAr: 'ياسر الدوسري', server: 'https://server11.mp3quran.net/yasser/' },
];

export function useAudioPlayer() {
  const [audioState, setAudioState] = useState<AudioState>(audioPlayer.getState());
  const [selectedReciterId, setSelectedReciterId] = useState(DEFAULT_RECITERS[0].id);
  const [currentSurahId, setCurrentSurahId] = useState<number | null>(null);

  useEffect(() => {
    const unsub = audioPlayer.subscribe(setAudioState);
    return unsub;
  }, []);

  useEffect(() => {
    // Load saved reciter
    Storage.getSettings().then(s => {
      const found = DEFAULT_RECITERS.find(r => r.id === s.audioReciterId);
      if (found) setSelectedReciterId(found.id);
    });
  }, []);

  const selectedReciter = DEFAULT_RECITERS.find(r => r.id === selectedReciterId) ?? DEFAULT_RECITERS[0];

  const playSurah = useCallback(async (surahId: number) => {
    const url = getSurahAudioUrl(selectedReciter.server, surahId);
    setCurrentSurahId(surahId);
    await audioPlayer.loadAndPlay(url);
  }, [selectedReciter]);

  const playUrl = useCallback(async (url: string) => {
    setCurrentSurahId(null);
    await audioPlayer.loadAndPlay(url);
  }, []);

  const selectReciter = useCallback(async (id: number) => {
    setSelectedReciterId(id);
    await Storage.saveSettings({ audioReciterId: id });
    // Replay current surah with new reciter
    if (currentSurahId !== null) {
      const reciter = DEFAULT_RECITERS.find(r => r.id === id) ?? DEFAULT_RECITERS[0];
      const url = getSurahAudioUrl(reciter.server, currentSurahId);
      await audioPlayer.loadAndPlay(url);
    }
  }, [currentSurahId]);

  const progressRatio = audioState.durationMs > 0
    ? audioState.positionMs / audioState.durationMs
    : 0;

  return {
    audioState,
    isPlaying: audioState.isPlaying,
    isLoading: audioState.isBuffering && !audioState.isLoaded,
    isLoaded: audioState.isLoaded,
    currentSurahId,
    progressRatio,
    positionText: formatAudioTime(audioState.positionMs),
    durationText: formatAudioTime(audioState.durationMs),
    selectedReciter,
    reciters: DEFAULT_RECITERS,
    playSurah,
    playUrl,
    togglePlayPause: audioPlayer.togglePlayPause.bind(audioPlayer),
    seekTo: audioPlayer.seekTo.bind(audioPlayer),
    stop: audioPlayer.stop.bind(audioPlayer),
    selectReciter,
  };
}
