import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, Trash2, LogIn, UserPlus } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { UserMenu } from './Auth';
import FileUploader from './FileUploader';
import PlaylistItem from './PlaylistItem';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MainContentProps {
  className?: string;
  onLogin?: () => void;
  onRegister?: () => void;
  isAuthenticated?: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ 
  className,
  onLogin,
  onRegister,
  isAuthenticated = false
}) => {
  const { playlist, searchQuery, setSearchQuery, clearPlaylist } = usePlayerStore();

  const filteredPlaylist = useMemo(() => {
    if (!searchQuery.trim()) return playlist;
    
    const query = searchQuery.toLowerCase();
    return playlist.filter(track => 
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query) ||
      track.album.toLowerCase().includes(query)
    );
  }, [playlist, searchQuery]);

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
          
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onLogin}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-sm font-semibold hover:scale-105 transition-transform"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <button
                onClick={onRegister}
                className="flex items-center gap-2 px-4 py-2 bg-spotify-green text-black rounded-full text-sm font-semibold hover:scale-105 transition-transform"
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">My Library</h1>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-spotify-lightGray w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search songs, artists, albums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-spotify-gray text-white pl-10 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
            </div>
            <FileUploader />
          </div>
        </div>

        {playlist.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                {searchQuery ? `Search Results (${filteredPlaylist.length})` : `Playlist (${playlist.length} songs)`}
              </h2>
              {!searchQuery && (
                <button 
                  onClick={clearPlaylist}
                  className="flex items-center gap-2 text-spotify-lightGray hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Clear All</span>
                </button>
              )}
            </div>
            
            {filteredPlaylist.length > 0 ? (
              <div className="grid grid-cols-1 gap-1">
                <div className="grid grid-cols-[40px_40px_1fr_auto] md:grid-cols-[40px_40px_1fr_1fr_auto] gap-4 px-2 pb-2 text-sm text-spotify-lightGray border-b border-white/10">
                  <div className="text-center">#</div>
                  <div></div>
                  <div>Title</div>
                  <div className="hidden md:block">Album</div>
                  <div className="text-right">Duration</div>
                </div>
                
                {filteredPlaylist.map((track) => (
                  <PlaylistItem key={track.id} track={track} index={playlist.indexOf(track)} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-white text-xl font-semibold mb-2">No matching songs found</p>
                <p className="text-spotify-lightGray">Try a different search term</p>
              </div>
            )}
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
