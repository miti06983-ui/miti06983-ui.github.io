import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import PlayerBar from './components/PlayerBar';
import LyricsPanel from './components/LyricsPanel';
import ImmersivePlayer from './components/ImmersivePlayer';
import { AuthModal } from './components/Auth';
import { SettingsModal } from './components/Settings';
import { usePlayerStore } from './store/usePlayerStore';
import { useAuthStore } from './store/useAuthStore';

const App: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register'>('login');
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    togglePlay,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleRepeat,
    toggleMute,
    setVolume,
    volume,
    currentTrack,
    toggleShowLyrics,
    toggleShowImmersive
  } = usePlayerStore();
  
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          if (e.shiftKey) {
            nextTrack();
          }
          break;
        case 'ArrowLeft':
          if (e.shiftKey) {
            prevTrack();
          }
          break;
        case 'KeyS':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleShuffle();
          }
          break;
        case 'KeyR':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleRepeat();
          }
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'KeyL':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleShowLyrics();
          } else if (currentTrack) {
            usePlayerStore.getState().toggleLikeTrack(currentTrack.id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextTrack, prevTrack, toggleShuffle, toggleRepeat, toggleMute, setVolume, volume, currentTrack, toggleShowLyrics, toggleShowImmersive]);

  const openLoginModal = () => {
    setAuthModalView('login');
    setShowAuthModal(true);
  };

  const openRegisterModal = () => {
    setAuthModalView('register');
    setShowAuthModal(true);
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      <div className="flex-1 flex gap-2 p-2 pb-0 overflow-hidden">
        <Sidebar className="w-80 flex-shrink-0" onOpenSettings={() => setShowSettings(true)} />
        <MainContent 
          className="flex-1"
          onLogin={openLoginModal}
          onRegister={openRegisterModal}
          isAuthenticated={isAuthenticated}
        />
      </div>
      <PlayerBar className="flex-shrink-0" />
      <LyricsPanel />
      <ImmersivePlayer />
      
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          initialView={authModalView}
        />
      )}

      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default App;
