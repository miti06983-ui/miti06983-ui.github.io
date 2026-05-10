import React, { useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Volume2, 
  VolumeX,
  Heart,
  X,
  Minimize2,
  Music
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { formatTime } from '../utils';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ImmersivePlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    volume,
    isMuted,
    repeatMode,
    shuffle,
    setIsPlaying,
    setCurrentTime,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    nextTrack,
    prevTrack,
    toggleLikeTrack,
    toggleShowImmersive,
    showImmersive
  } = usePlayerStore();

  // Keyboard shortcuts for immersive mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showImmersive) return;
      
      switch (e.code) {
        case 'Escape':
          toggleShowImmersive();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showImmersive, toggleShowImmersive]);

  if (!showImmersive || !currentTrack) return null;

  const handleLike = () => {
    toggleLikeTrack(currentTrack.id);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background with blurred album art */}
      <div className="absolute inset-0">
        {currentTrack.cover ? (
          <div className="relative w-full h-full">
            <img 
              src={currentTrack.cover} 
              alt="" 
              className="w-full h-full object-cover scale-110"
            />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-3xl" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-spotify-dark via-spotify-darkGray to-black" />
        )}
      </div>

      {/* Close button */}
      <button
        onClick={toggleShowImmersive}
        className="absolute top-6 right-6 p-3 text-white/70 hover:text-white transition-colors z-10"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center max-w-4xl w-full mx-auto">
        {/* Album art with animation */}
        <div className={cn(
          "mb-8 transition-all duration-700 ease-out",
          isPlaying ? "animate-none" : "animate-pulse"
        )}>
          <div className={cn(
            "w-80 h-80 sm:w-96 sm:h-96 rounded-lg shadow-2xl overflow-hidden transition-transform duration-500",
            isPlaying ? "hover:scale-105" : "hover:scale-105"
          )}>
            {currentTrack.cover ? (
              <img 
                src={currentTrack.cover} 
                alt={currentTrack.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-spotify-gray flex items-center justify-center">
                <Music className="w-32 h-32 text-spotify-lightGray" />
              </div>
            )}
          </div>
        </div>

        {/* Track info */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            {currentTrack.title}
          </h1>
          <p className="text-xl sm:text-2xl text-spotify-lightGray">
            {currentTrack.artist}
          </p>
          {currentTrack.album && (
            <p className="text-sm text-spotify-lightGray/70 mt-1">
              {currentTrack.album}
              {currentTrack.year && ` • ${currentTrack.year}`}
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-2xl mb-6">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-sm text-spotify-lightGray w-12 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 group relative h-2 flex items-center">
              <div className="absolute inset-0 bg-white/20 rounded-full" />
              <div 
                className="absolute left-0 top-0 bottom-0 bg-white rounded-full group-hover:bg-spotify-green"
                style={{ width: `${(currentTime / (currentTrack.duration || 1)) * 100}%` }}
              />
              <input
                type="range"
                min={0}
                max={currentTrack.duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              />
            </div>
            <span className="text-sm text-spotify-lightGray w-12">
              {formatTime(currentTrack.duration)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          {/* Shuffle */}
          <button 
            onClick={toggleShuffle}
            className={cn(
              "p-3 text-spotify-lightGray hover:text-white transition-all duration-200",
              shuffle && "text-spotify-green"
            )}
          >
            <Shuffle className="w-6 h-6" />
          </button>

          {/* Previous */}
          <button 
            onClick={prevTrack}
            className="p-3 text-white hover:scale-110 transition-all duration-200"
          >
            <SkipBack className="w-8 h-8 fill-current" />
          </button>

          {/* Play/Pause */}
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-all duration-200 shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-black fill-current" />
            ) : (
              <Play className="w-8 h-8 text-black fill-current ml-1" />
            )}
          </button>

          {/* Next */}
          <button 
            onClick={nextTrack}
            className="p-3 text-white hover:scale-110 transition-all duration-200"
          >
            <SkipForward className="w-8 h-8 fill-current" />
          </button>

          {/* Repeat */}
          <button 
            onClick={toggleRepeat}
            className={cn(
              "p-3 text-spotify-lightGray hover:text-white transition-all duration-200",
              repeatMode !== 'none' && "text-spotify-green"
            )}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-6 h-6" />
            ) : (
              <Repeat className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Like and volume controls */}
        <div className="flex items-center gap-8">
          {/* Like button */}
          <button 
            onClick={handleLike}
            className="p-2 transition-all duration-200 hover:scale-110"
          >
            <Heart 
              className={cn(
                "w-6 h-6",
                currentTrack.isLiked 
                  ? "text-spotify-green fill-spotify-green" 
                  : "text-spotify-lightGray hover:text-white"
              )} 
            />
          </button>

          {/* Volume control */}
          <div className="flex items-center gap-3">
            <button onClick={toggleMute} className="text-spotify-lightGray hover:text-white">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <div className="w-32 relative h-1.5 flex items-center group">
              <div className="absolute inset-0 bg-white/20 rounded-full" />
              <div 
                className="absolute left-0 top-0 bottom-0 bg-white rounded-full group-hover:bg-spotify-green"
                style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
              />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              />
            </div>
          </div>
        </div>

        {/* Minimize hint */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-spotify-lightGray text-sm animate-bounce">
          <div className="flex items-center gap-2">
            <Minimize2 className="w-4 h-4" />
            <span>Press ESC to minimize</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImmersivePlayer;
