import React from 'react';
import { Home, Search, Library, Music, Plus, LogIn, UserPlus } from 'lucide-react';
import { UserMenu } from './Auth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  className?: string;
  onLogin?: () => void;
  onRegister?: () => void;
  isAuthenticated?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  className, 
  onLogin, 
  onRegister, 
  isAuthenticated = false
}) => {
  return (
    <div className={cn("flex flex-col gap-2 h-full", className)}>
      <div className="bg-spotify-dark rounded-lg p-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center">
            <Music className="w-5 h-5 text-black" />
          </div>
          <span className="text-white font-bold text-xl">Music Player</span>
        </div>
        <nav className="flex flex-col gap-4">
          <a href="#" className="flex items-center gap-4 text-white font-semibold hover:text-white transition-colors">
            <Home className="w-6 h-6" />
            <span>Home</span>
          </a>
          <a href="#" className="flex items-center gap-4 text-spotify-lightGray font-semibold hover:text-white transition-colors">
            <Search className="w-6 h-6" />
            <span>Search</span>
          </a>
        </nav>
      </div>

      <div className="bg-spotify-dark rounded-lg p-4 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <button className="flex items-center gap-2 text-spotify-lightGray font-semibold hover:text-white transition-colors">
            <Library className="w-6 h-6" />
            <span>Your Library</span>
          </button>
          <button className="text-spotify-lightGray hover:text-white transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="text-center mb-4">
              <p className="text-white font-semibold mb-2">Sign in to access your library</p>
              <p className="text-spotify-lightGray text-sm">Create an account or sign in</p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button
                onClick={onLogin}
                className="flex items-center justify-center gap-2 bg-spotify-green text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </button>
              <button
                onClick={onRegister}
                className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
              >
                <UserPlus className="w-5 h-5" />
                Create Account
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserMenu />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2">
              <div className="bg-spotify-gray p-4 rounded-lg">
                <p className="text-white font-semibold mb-2">Create your first playlist</p>
                <p className="text-spotify-lightGray text-sm mb-4">It's easy, we'll help you</p>
                <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-semibold hover:scale-105 transition-transform">
                  Create playlist
                </button>
              </div>
              <div className="bg-spotify-gray p-4 rounded-lg">
                <p className="text-white font-semibold mb-2">Let's find some podcasts</p>
                <p className="text-spotify-lightGray text-sm mb-4">to follow</p>
                <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-semibold hover:scale-105 transition-transform">
                  Browse podcasts
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
