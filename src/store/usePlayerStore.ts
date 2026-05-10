import { create } from 'zustand';
import { Track, PlayerState, PlayerActions } from '../types';

interface PlayerStore extends PlayerState, PlayerActions {}

const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  playlist: [],
  isPlaying: false,
  currentTime: 0,
  volume: 0.7,
  isMuted: false,
  repeatMode: 'none',
  shuffle: false,
  searchQuery: '',

  setCurrentTrack: (track: Track | null) => set({ currentTrack: track }),
  
  setPlaylist: (playlist: Track[]) => set({ playlist }),
  
  addToPlaylist: (track: Track) => set((state) => ({ 
    playlist: [...state.playlist, { ...track, isLiked: false }] 
  })),
  
  removeFromPlaylist: (trackId: string) => set((state) => ({
    playlist: state.playlist.filter(t => t.id !== trackId)
  })),
  
  clearPlaylist: () => set({ playlist: [], currentTrack: null, isPlaying: false, searchQuery: '' }),
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
  
  setCurrentTime: (time: number) => set({ currentTime: time }),
  
  setVolume: (volume: number) => set({ volume, isMuted: volume === 0 }),
  
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  
  toggleRepeat: () => set((state) => {
    const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(state.repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    return { repeatMode: modes[nextIndex] };
  }),
  
  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
  
  nextTrack: () => set((state) => {
    if (state.playlist.length === 0) return {};
    
    const currentIndex = state.currentTrack 
      ? state.playlist.findIndex(t => t.id === state.currentTrack.id)
      : -1;
    
    let nextIndex;
    if (state.shuffle) {
      nextIndex = Math.floor(Math.random() * state.playlist.length);
    } else {
      nextIndex = (currentIndex + 1) % state.playlist.length;
    }
    
    if (nextIndex === 0 && currentIndex === state.playlist.length - 1 && state.repeatMode === 'none') {
      return { isPlaying: false };
    }
    
    return { 
      currentTrack: state.playlist[nextIndex],
      currentTime: 0
    };
  }),
  
  prevTrack: () => set((state) => {
    if (state.playlist.length === 0) return {};
    
    const currentIndex = state.currentTrack 
      ? state.playlist.findIndex(t => t.id === state.currentTrack.id)
      : -1;
    
    let prevIndex;
    if (state.shuffle) {
      prevIndex = Math.floor(Math.random() * state.playlist.length);
    } else {
      prevIndex = currentIndex <= 0 ? state.playlist.length - 1 : currentIndex - 1;
    }
    
    return { 
      currentTrack: state.playlist[prevIndex],
      currentTime: 0
    };
  }),

  toggleLikeTrack: (trackId: string) => set((state) => ({
    playlist: state.playlist.map(track => 
      track.id === trackId 
        ? { ...track, isLiked: !track.isLiked }
        : track
    ),
    currentTrack: state.currentTrack?.id === trackId 
      ? { ...state.currentTrack, isLiked: !state.currentTrack.isLiked }
      : state.currentTrack
  })),

  setSearchQuery: (query: string) => set({ searchQuery: query }),
}));
