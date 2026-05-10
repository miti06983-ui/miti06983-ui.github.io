import React from 'react';
import { Play, MoreHorizontal, Heart } from 'lucide-react';
import { Track } from '../types';
import { usePlayerStore } from '../store/usePlayerStore';
import { formatTime } from '../utils';

interface PlaylistItemProps {
  track: Track;
  index: number;
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({ track, index }) => {
  const { currentTrack, isPlaying, setCurrentTrack, setIsPlaying, setCurrentTime, toggleLikeTrack } = usePlayerStore();
  const isCurrentTrack = currentTrack?.id === track.id;

  const handlePlay = () => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLikeTrack(track.id);
  };

  return (
    <div
      onClick={handlePlay}
      className={`group flex items-center gap-4 p-2 rounded-md hover:bg-white/10 cursor-pointer transition-colors ${
        isCurrentTrack ? 'bg-white/10' : ''
      }`}
    >
      <div className="w-6 text-center text-spotify-lightGray group-hover:hidden">
        {isCurrentTrack && isPlaying ? (
          <div className="flex items-end justify-center gap-0.5 h-4">
            <span className="w-1 bg-spotify-green animate-bounce h-2" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1 bg-spotify-green animate-bounce h-4" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1 bg-spotify-green animate-bounce h-3" style={{ animationDelay: '300ms' }}></span>
          </div>
        ) : (
          index + 1
        )}
      </div>
      <div className="hidden group-hover:flex w-6 items-center justify-center">
        <Play className="w-4 h-4 text-white fill-current" />
      </div>

      <div className="w-10 h-10 flex-shrink-0">
        {track.cover ? (
          <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-spotify-gray flex items-center justify-center">
            <div className="w-6 h-6 bg-spotify-lightGray rounded" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${isCurrentTrack ? 'text-spotify-green' : 'text-white'}`}>
          {track.title}
        </p>
        <p className="text-sm text-spotify-lightGray truncate">{track.artist}</p>
      </div>

      <div className="hidden md:block text-sm text-spotify-lightGray">{track.album}</div>

      <div className="flex items-center gap-2">
        <button 
          onClick={handleLike}
          className={`p-2 transition-opacity opacity-0 group-hover:opacity-100 ${
            track.isLiked ? 'opacity-100' : ''
          }`}
        >
          <Heart 
            className={`w-4 h-4 ${
              track.isLiked 
                ? 'text-spotify-green fill-spotify-green' 
                : 'text-spotify-lightGray hover:text-white'
            }`} 
          />
        </button>
        <span className="text-sm text-spotify-lightGray">{formatTime(track.duration)}</span>
        <button className="p-2 text-spotify-lightGray hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PlaylistItem;
