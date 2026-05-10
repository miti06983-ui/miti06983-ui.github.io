import React, { useRef, useEffect, useState } from 'react';
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
  Mic,
  ListMusic,
  Maximize2,
  Heart,
  Music2
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { formatTime } from '../utils';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PlayerBarProps {
  className?: string;
}

const PlayerBar: React.FC<PlayerBarProps> = ({ className }) => {
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
    toggleShowLyrics,
    toggleShowImmersive,
    showLyrics
  } = usePlayerStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!audioRef.current) return;

    if (currentTrack) {
      audioRef.current.src = currentTrack.url;
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentTrack?.id]);

  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        nextTrack();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [repeatMode, setCurrentTime, nextTrack]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleLike = () => {
    if (currentTrack) {
      toggleLikeTrack(currentTrack.id);
    }
  };

  return (
    <div className={cn("bg-spotify-black border-t border-white/10 px-4 py-3 flex items-center justify-between gap-4", className)}>
      <audio ref={audioRef} />
      
      <div className="flex items-center gap-4 w-[30%] min-w-[180px]">
        {currentTrack ? (
          <>
            {/* Album cover - clickable for immersive mode */}
            <button
              onClick={toggleShowImmersive}
              className="group relative"
            >
              {currentTrack.cover ? (
                <div className="w-14 h-14 rounded overflow-hidden">
                  <img 
                    src={currentTrack.cover} 
                    alt={currentTrack.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 bg-spotify-gray rounded flex items-center justify-center">
                  <div className="w-8 h-8 bg-spotify-lightGray rounded" />
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                <Maximize2 className="w-6 h-6 text-white" />
              </div>
            </button>
            
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate hover:underline cursor-pointer">
                {currentTrack.title}
              </p>
              <p className="text-spotify-lightGray text-xs truncate hover:underline cursor-pointer">
                {currentTrack.artist}
              </p>
            </div>
            
            <button 
              onClick={handleLike}
              className="text-spotify-lightGray hover:text-white ml-2"
            >
              <Heart 
                className={cn(
                  "w-4 h-4",
                  currentTrack.isLiked ? "text-spotify-green fill-spotify-green" : ""
                )} 
              />
            </button>
          </>
        ) : (
          <div className="w-14 h-14 bg-spotify-gray rounded" />
        )}
      </div>

      <div className="flex flex-col items-center gap-2 flex-1 max-w-[722px]">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleShuffle}
            className={cn(
              "text-spotify-lightGray hover:text-white transition-colors",
              shuffle && "text-spotify-green"
            )}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button 
            onClick={prevTrack}
            className="text-spotify-lightGray hover:text-white transition-colors"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-black fill-current" />
            ) : (
              <Play className="w-4 h-4 text-black fill-current ml-0.5" />
            )}
          </button>
          <button 
            onClick={nextTrack}
            className="text-spotify-lightGray hover:text-white transition-colors"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          <button 
            onClick={toggleRepeat}
            className={cn(
              "text-spotify-lightGray hover:text-white transition-colors",
              repeatMode !== 'none' && "text-spotify-green"
            )}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>
        </div>
        
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-spotify-lightGray w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 group relative h-1.5 flex items-center">
            <div className="absolute inset-0 bg-spotify-lightGray/30 rounded-full" />
            <div 
              className="absolute left-0 top-0 bottom-0 bg-white rounded-full group-hover:bg-spotify-green"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
          </div>
          <span className="text-xs text-spotify-lightGray w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 w-[30%] justify-end">
        <button 
          onClick={toggleShowLyrics}
          className={cn(
            "text-spotify-lightGray hover:text-white transition-colors",
            showLyrics && "text-spotify-green"
          )}
          title="Show lyrics"
        >
          <Music2 className="w-4 h-4" />
        </button>
        <button className="text-spotify-lightGray hover:text-white">
          <Mic className="w-4 h-4" />
        </button>
        <button className="text-spotify-lightGray hover:text-white">
          <ListMusic className="w-4 h-4" />
        </button>
        <button className="text-spotify-lightGray hover:text-white">
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 group">
          <button onClick={toggleMute} className="text-spotify-lightGray hover:text-white">
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <div className="w-24 relative h-1.5 flex items-center">
            <div className="absolute inset-0 bg-spotify-lightGray/30 rounded-full" />
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
    </div>
  );
};

export default PlayerBar;
