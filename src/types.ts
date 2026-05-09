export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  file: File;
  url: string;
  cover?: string;
}

export interface PlayerState {
  currentTrack: Track | null;
  playlist: Track[];
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  repeatMode: 'none' | 'all' | 'one';
  shuffle: boolean;
}

export interface PlayerActions {
  setCurrentTrack: (track: Track | null) => void;
  setPlaylist: (playlist: Track[]) => void;
  addToPlaylist: (track: Track) => void;
  removeFromPlaylist: (trackId: string) => void;
  clearPlaylist: () => void;
  togglePlay: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
}
