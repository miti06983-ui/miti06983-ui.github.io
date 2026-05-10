import React, { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import PlayerBar from './components/PlayerBar';
import { usePlayerStore } from './store/usePlayerStore';

const App: React.FC = () => {
  const {
    togglePlay,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleRepeat,
    toggleMute,
    setVolume,
    currentTrack
  } = usePlayerStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts if typing in an input
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
          setVolume(v => Math.min(1, v + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(v => Math.max(0, v - 0.1));
          break;
        case 'KeyL':
          if (currentTrack) {
            usePlayerStore.getState().toggleLikeTrack(currentTrack.id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextTrack, prevTrack, toggleShuffle, toggleRepeat, toggleMute, setVolume, currentTrack]);

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      <div className="flex-1 flex gap-2 p-2 pb-0 overflow-hidden">
        <Sidebar className="w-80 flex-shrink-0" />
        <MainContent className="flex-1" />
      </div>
      <PlayerBar className="flex-shrink-0" />
    </div>
  );
};

export default App;
