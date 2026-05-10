import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown, Music } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-spotify-gray hover:bg-spotify-lightGray/20 transition-all"
      >
        <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-black">
              {getInitials(user.username)}
            </span>
          )}
        </div>
        <span className="text-white text-sm font-medium hidden md:block">
          {user.username}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 text-white transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-spotify-gray rounded-xl shadow-2xl overflow-hidden border border-white/10 z-50">
          <div className="p-4 border-b border-white/10">
            <p className="text-white font-semibold">{user.username}</p>
            <p className="text-spotify-lightGray text-sm">{user.email}</p>
          </div>
          
          <div className="py-2">
            <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors">
              <User className="w-5 h-5 text-spotify-lightGray" />
              <span className="text-white">Profile</span>
            </button>
            <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors">
              <Settings className="w-5 h-5 text-spotify-lightGray" />
              <span className="text-white">Settings</span>
            </button>
            <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors">
              <Music className="w-5 h-5 text-spotify-lightGray" />
              <span className="text-white">Your Music</span>
            </button>
          </div>

          <div className="border-t border-white/10 py-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-500/20 transition-colors group"
            >
              <LogOut className="w-5 h-5 text-red-400" />
              <span className="text-red-400 group-hover:text-red-300">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
