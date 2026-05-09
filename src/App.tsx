import React from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import PlayerBar from './components/PlayerBar';

const App: React.FC = () => {
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
