import React, { useMemo, useRef, useEffect } from 'react';
import { X, Music, Scroll } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LyricLine {
  time: number;
  text: string;
}

const LyricsPanel: React.FC = () => {
  const { currentTrack, showLyrics, toggleShowLyrics, currentTime } = usePlayerStore();
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Parse lyrics into timed lines
  const parsedLyrics = useMemo((): LyricLine[] => {
    if (!currentTrack?.lyrics) return [];
    
    const lrcRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/g;
    const lines: LyricLine[] = [];
    let match;
    
    const lyrics = currentTrack.lyrics;
    while ((match = lrcRegex.exec(lyrics)) !== null) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const milliseconds = parseInt(match[3].padEnd(3, '0'));
      const time = minutes * 60 + seconds + milliseconds / 1000;
      const text = match[4].trim();
      
      if (text) {
        lines.push({ time, text });
      }
    }
    
    // If no LRC format, just split into plain lines
    if (lines.length === 0 && lyrics) {
      const plainLines = lyrics.split('\n').filter(line => line.trim());
      return plainLines.map((text, index) => ({
        time: index * 5, // Fake timestamps for display
        text: text.trim()
      }));
    }
    
    return lines.sort((a, b) => a.time - b.time);
  }, [currentTrack?.lyrics]);

  // Find current active lyric line
  const activeIndex = useMemo(() => {
    if (parsedLyrics.length === 0) return -1;
    
    for (let i = parsedLyrics.length - 1; i >= 0; i--) {
      if (currentTime >= parsedLyrics[i].time) {
        return i;
      }
    }
    return -1;
  }, [parsedLyrics, currentTime]);

  // Scroll to active line
  useEffect(() => {
    if (activeLineRef.current && lyricsContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex]);

  if (!showLyrics) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded overflow-hidden">
            {currentTrack?.cover ? (
              <img src={currentTrack.cover} alt={currentTrack.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-spotify-gray flex items-center justify-center">
                <Music className="w-8 h-8 text-spotify-lightGray" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-white font-bold text-xl">{currentTrack?.title || 'No track'}</h2>
            <p className="text-spotify-lightGray">{currentTrack?.artist || 'Unknown artist'}</p>
          </div>
        </div>
        <button
          onClick={toggleShowLyrics}
          className="p-2 text-spotify-lightGray hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Lyrics Content */}
      <div 
        ref={lyricsContainerRef}
        className="flex-1 overflow-y-auto p-8"
      >
        {parsedLyrics.length > 0 ? (
          <div className="max-w-3xl mx-auto space-y-4">
            {parsedLyrics.map((line, index) => (
              <div
                key={index}
                ref={index === activeIndex ? activeLineRef : null}
                className={cn(
                  "text-center transition-all duration-300",
                  index === activeIndex
                    ? "text-spotify-green text-2xl font-semibold scale-105"
                    : "text-spotify-lightGray text-lg hover:text-white/70"
                )}
              >
                {line.text}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Scroll className="w-16 h-16 text-spotify-lightGray mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">No lyrics available</h3>
            <p className="text-spotify-lightGray">This track doesn't have embedded lyrics</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LyricsPanel;
