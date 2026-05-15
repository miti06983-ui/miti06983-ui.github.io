import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/client';

export interface AudioSettings {
  volume: number;
  equalizerPreset: string;
  customEqualizer: {
    bass: number;
    mid: number;
    treble: number;
  };
  autoPlay: boolean;
  crossfade: boolean;
  crossfadeDuration: number;
  normalizeVolume: boolean;
  monoAudio: boolean;
  spatialAudio: boolean;
}

export interface DisplaySettings {
  theme: 'dark' | 'light' | 'auto';
  compactMode: boolean;
  showAlbumArt: boolean;
  showLyrics: boolean;
  lyricsSource: 'local' | 'synced';
  animationSpeed: 'slow' | 'normal' | 'fast';
  reducedMotion: boolean;
  language: string;
  fontSize: 'small' | 'medium' | 'large';
}

export interface PlaybackSettings {
  shuffle: boolean;
  repeatMode: 'none' | 'all' | 'one';
  skipForwardAmount: number;
  skipBackwardAmount: number;
  gaplessPlayback: boolean;
  autoplaySimilar: boolean;
  resumeOnStartup: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  newTrackAlert: boolean;
  downloadComplete: boolean;
  socialUpdates: boolean;
  soundEffects: boolean;
}

export interface PrivacySettings {
  showActivity: boolean;
  showListeningStats: boolean;
  analyticsEnabled: boolean;
  historyTracking: boolean;
}

export interface StorageSettings {
  cacheSize: number;
  maxCacheAge: number;
  downloadQuality: 'low' | 'medium' | 'high' | 'very-high';
  autoDownload: boolean;
  downloadOnWifiOnly: boolean;
}

export interface NetworkSettings {
  streamingQuality: 'low' | 'medium' | 'high' | 'very-high' | 'lossless';
  proxyEnabled: boolean;
  proxyUrl: string;
  bandwidthLimit: number;
  preFetchLyrics: boolean;
  preloadAlbums: boolean;
}

export interface SettingsState {
  audio: AudioSettings;
  display: DisplaySettings;
  playback: PlaybackSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  storage: StorageSettings;
  network: NetworkSettings;

  setAudioSetting: <K extends keyof AudioSettings>(key: K, value: AudioSettings[K]) => void;
  setDisplaySetting: <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => void;
  setPlaybackSetting: <K extends keyof PlaybackSettings>(key: K, value: PlaybackSettings[K]) => void;
  setNotificationSetting: <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => void;
  setPrivacySetting: <K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) => void;
  setStorageSetting: <K extends keyof StorageSettings>(key: K, value: StorageSettings[K]) => void;
  setNetworkSetting: <K extends keyof NetworkSettings>(key: K, value: NetworkSettings[K]) => void;
  resetSettings: () => void;
  loadSettings: () => Promise<void>;
  syncSettings: () => Promise<void>;
}

const defaultSettings = {
  audio: {
    volume: 70,
    equalizerPreset: 'flat',
    customEqualizer: {
      bass: 50,
      mid: 50,
      treble: 50,
    },
    autoPlay: true,
    crossfade: false,
    crossfadeDuration: 2,
    normalizeVolume: false,
    monoAudio: false,
    spatialAudio: false,
  },
  display: {
    theme: 'dark',
    compactMode: false,
    showAlbumArt: true,
    showLyrics: true,
    lyricsSource: 'local',
    animationSpeed: 'normal',
    reducedMotion: false,
    language: 'en',
    fontSize: 'medium',
  },
  playback: {
    shuffle: false,
    repeatMode: 'none' as const,
    skipForwardAmount: 10,
    skipBackwardAmount: 10,
    gaplessPlayback: false,
    autoplaySimilar: true,
    resumeOnStartup: true,
  },
  notifications: {
    enabled: true,
    newTrackAlert: true,
    downloadComplete: true,
    socialUpdates: false,
    soundEffects: true,
  },
  privacy: {
    showActivity: true,
    showListeningStats: true,
    analyticsEnabled: true,
    historyTracking: true,
  },
  storage: {
    cacheSize: 500,
    maxCacheAge: 30,
    downloadQuality: 'high',
    autoDownload: false,
    downloadOnWifiOnly: true,
  },
  network: {
    streamingQuality: 'high',
    proxyEnabled: false,
    proxyUrl: '',
    bandwidthLimit: 0,
    preFetchLyrics: true,
    preloadAlbums: false,
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setAudioSetting: async (key, value) => {
        set((state) => ({ audio: { ...state.audio, [key]: value } }));
        await get().syncSettings();
      },

      setDisplaySetting: async (key, value) => {
        set((state) => ({ display: { ...state.display, [key]: value } }));
        await get().syncSettings();
      },

      setPlaybackSetting: async (key, value) => {
        set((state) => ({ playback: { ...state.playback, [key]: value } }));
        await get().syncSettings();
      },

      setNotificationSetting: async (key, value) => {
        set((state) => ({ notifications: { ...state.notifications, [key]: value } }));
        await get().syncSettings();
      },

      setPrivacySetting: async (key, value) => {
        set((state) => ({ privacy: { ...state.privacy, [key]: value } }));
        await get().syncSettings();
      },

      setStorageSetting: async (key, value) => {
        set((state) => ({ storage: { ...state.storage, [key]: value } }));
        await get().syncSettings();
      },

      setNetworkSetting: async (key, value) => {
        set((state) => ({ network: { ...state.network, [key]: value } }));
        await get().syncSettings();
      },

      resetSettings: async () => {
        try {
          const data = await apiClient.resetSettings();
          set({ ...data.settings });
        } catch (error) {
          set(defaultSettings);
        }
      },

      loadSettings: async () => {
        try {
          const data = await apiClient.getSettings();
          set({ ...data.settings });
        } catch (error) {
          console.error('Failed to load settings:', error);
        }
      },

      syncSettings: async () => {
        try {
          const state = get();
          await apiClient.updateSettings({
            audio: state.audio,
            display: state.display,
            playback: state.playback,
            notifications: state.notifications,
            privacy: state.privacy,
            storage: state.storage,
            network: state.network,
          });
        } catch (error) {
          console.error('Failed to sync settings:', error);
        }
      },
    }),
    {
      name: 'music-player-settings',
    }
  )
);
