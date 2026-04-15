// Powered by OnSpace.AI
// Audio playback service using expo-av

import { Audio, AVPlaybackStatus } from 'expo-av';

export interface AudioState {
  isLoaded: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  positionMs: number;
  durationMs: number;
  uri: string | null;
  error: string | null;
}

export type AudioStatusCallback = (state: AudioState) => void;

class AudioPlayerService {
  private sound: Audio.Sound | null = null;
  private currentUri: string | null = null;
  private callbacks: Set<AudioStatusCallback> = new Set();
  private state: AudioState = {
    isLoaded: false,
    isPlaying: false,
    isBuffering: false,
    positionMs: 0,
    durationMs: 0,
    uri: null,
    error: null,
  };

  constructor() {
    this.configureAudio();
  }

  private async configureAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (e) {
      console.warn('Audio config failed', e);
    }
  }

  subscribe(cb: AudioStatusCallback) {
    this.callbacks.add(cb);
    cb(this.state);
    return () => this.callbacks.delete(cb);
  }

  private notify(partial: Partial<AudioState>) {
    this.state = { ...this.state, ...partial };
    this.callbacks.forEach(cb => cb(this.state));
  }

  private onPlaybackStatus(status: AVPlaybackStatus) {
    if (!status.isLoaded) {
      this.notify({
        isLoaded: false,
        isPlaying: false,
        error: status.error ?? null,
      });
      return;
    }
    this.notify({
      isLoaded: true,
      isPlaying: status.isPlaying,
      isBuffering: status.isBuffering,
      positionMs: status.positionMillis,
      durationMs: status.durationMillis ?? 0,
      error: null,
    });
  }

  async loadAndPlay(uri: string): Promise<void> {
    try {
      // Stop existing
      if (this.sound) {
        await this.sound.stopAsync().catch(() => {});
        await this.sound.unloadAsync().catch(() => {});
        this.sound = null;
      }

      this.currentUri = uri;
      this.notify({ isLoaded: false, isPlaying: false, isBuffering: true, uri, error: null, positionMs: 0, durationMs: 0 });

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, progressUpdateIntervalMillis: 500 },
        this.onPlaybackStatus.bind(this)
      );
      this.sound = sound;
    } catch (e: any) {
      this.notify({ isLoaded: false, isPlaying: false, isBuffering: false, error: e?.message ?? 'Failed to load audio' });
    }
  }

  async play(): Promise<void> {
    try {
      await this.sound?.playAsync();
    } catch (e) {
      console.warn('Play failed', e);
    }
  }

  async pause(): Promise<void> {
    try {
      await this.sound?.pauseAsync();
    } catch (e) {
      console.warn('Pause failed', e);
    }
  }

  async togglePlayPause(): Promise<void> {
    if (this.state.isPlaying) {
      await this.pause();
    } else {
      await this.play();
    }
  }

  async seekTo(positionMs: number): Promise<void> {
    try {
      await this.sound?.setPositionAsync(positionMs);
    } catch (e) {
      console.warn('Seek failed', e);
    }
  }

  async setVolume(volume: number): Promise<void> {
    try {
      await this.sound?.setVolumeAsync(Math.max(0, Math.min(1, volume)));
    } catch (e) {
      console.warn('Volume set failed', e);
    }
  }

  async stop(): Promise<void> {
    try {
      await this.sound?.stopAsync();
      await this.sound?.unloadAsync();
      this.sound = null;
      this.currentUri = null;
      this.notify({ isLoaded: false, isPlaying: false, isBuffering: false, uri: null, positionMs: 0, durationMs: 0 });
    } catch (e) {
      console.warn('Stop failed', e);
    }
  }

  getState(): AudioState {
    return this.state;
  }

  isCurrentUri(uri: string): boolean {
    return this.currentUri === uri;
  }
}

// Singleton
export const audioPlayer = new AudioPlayerService();

export function formatAudioTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}
