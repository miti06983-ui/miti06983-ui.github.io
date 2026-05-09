import React from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import FileUploader from './FileUploader';
import PlaylistItem from './PlaylistItem';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MainContentProps {
  className?: string;
}

const MainContent: React.FC<MainContentProps> = ({ className }) => {
  const { playlist, currentTrack } = usePlayerStore();

  return (
    <div className={cn("flex-1 bg-spotify-dark rounded-lg overflow-hidden flex flex-col", className)}>
      <header className="p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex gap-2">
          <button className="w-8 h-8 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black/90">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="w-8 h-8 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black/90">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-spotify-green text-black px-4 py-1.5 rounded-full text-sm font-semibold hover:scale-105 transition-transform">
            Explore
          </button>
          <button className="w-8 h-8 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black/90">
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">My Library</h1>
          <FileUploader className="mb-8" />
        </div>

        {playlist.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Playlist ({playlist.length} songs)</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-1">
              <div className="grid grid-cols-[40px_40px_1fr_auto] md:grid-cols-[40px_40px_1fr_1fr_auto] gap-4 px-2 pb-2 text-sm text-spotify-lightGray border-b border-white/10">
                <div className="text-center">#</div>
                <div></div>
                <div>Title</div>
                <div className="hidden md:block">Album</div>
                <div className="text-right">Duration</div>
              </div>
              
              {playlist.map((track, index) => (
                <PlaylistItem key={track.id} track={track} index={index} />
              ))}
            </div>
          </div>
        )}

        {playlist.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-24 h-24 bg-spotify-gray rounded-full flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-spotify-lightGray rounded" />
            </div>
            <p className="text-white text-xl font-semibold mb-2">No music added yet</p>
            <p className="text-spotify-lightGray">Click the button above to upload your local music files</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MainContent;
