import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { Track } from '../types';
import { generateId, isValidAudioFile } from '../utils';

interface FileUploaderProps {
  className?: string;
}

interface LyricLine {
  time: number;
  text: string;
}

interface ParsedMetadata {
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  trackNumber?: number;
  genre?: string;
  duration?: number;
  cover?: string;
  lyrics?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ className }) => {
  const { setPlaylist, addToPlaylist, setCurrentTrack, playlist } = usePlayerStore();

  const parseLyrics = (lyricsText: string): string => {
    if (!lyricsText) return '';
    
    const lrcRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/g;
    const lines: LyricLine[] = [];
    let match;
    let hasTimestamps = false;
    
    while ((match = lrcRegex.exec(lyricsText)) !== null) {
      hasTimestamps = true;
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const milliseconds = parseInt(match[3].padEnd(3, '0'));
      const time = minutes * 60 + seconds + milliseconds / 1000;
      const text = match[4].trim();
      
      if (text) {
        lines.push({ time, text });
      }
    }
    
    if (hasTimestamps && lines.length > 0) {
      lines.sort((a, b) => a.time - b.time);
      return lines.map(line => `[${formatLyricTime(line.time)}] ${line.text}`).join('\n');
    }
    
    return lyricsText.trim();
  };

  const formatLyricTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const extractMetadata = async (file: File): Promise<ParsedMetadata> => {
    const result: ParsedMetadata = {};
    
    try {
      const { parseBlob } = await import('music-metadata-browser');
      const metadata = await parseBlob(file);
      
      if (metadata.common.title) result.title = metadata.common.title;
      if (metadata.common.artist) result.artist = metadata.common.artist;
      if (metadata.common.album) result.album = metadata.common.album;
      if (metadata.common.year) result.year = metadata.common.year.toString();
      if (metadata.common.track?.no) result.trackNumber = metadata.common.track.no;
      if (metadata.common.genre && metadata.common.genre.length > 0) {
        result.genre = metadata.common.genre.join(', ');
      }
      
      if (metadata.format.duration) result.duration = metadata.format.duration;
      
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        try {
          const pic = metadata.common.picture[0];
          const data = pic.data;
          const uint8Array = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
          const blob = new Blob([uint8Array], { type: pic.format || 'image/jpeg' });
          result.cover = URL.createObjectURL(blob);
        } catch (coverError) {
          console.error('Failed to extract cover:', coverError);
        }
      }
      
      if (metadata.common.lyrics && metadata.common.lyrics.length > 0) {
        const lyricsData = metadata.common.lyrics[0];
        if (typeof lyricsData === 'string') {
          result.lyrics = parseLyrics(lyricsData);
        } else if (typeof lyricsData === 'object' && lyricsData !== null) {
          const lyricsObj = lyricsData as any;
          result.lyrics = parseLyrics(lyricsObj.text || '');
        }
      }
      
      const native = (metadata as any).native;
      if (native && !result.lyrics) {
        const id3Tags = native['ID3'] || native['id3'] || [];
        for (const tag of id3Tags) {
          if (tag.id === 'USLT' || tag.id === 'SYLT' || tag.id === 'USLT: lyrics') {
            if (tag.value?.text) {
              result.lyrics = parseLyrics(tag.value.text);
              break;
            } else if (typeof tag.value === 'string') {
              result.lyrics = parseLyrics(tag.value);
              break;
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Metadata parsing error:', error);
    }
    
    return result;
  };

  const processFile = async (file: File): Promise<Track> => {
    const url = URL.createObjectURL(file);
    let title = file.name.replace(/\.[^/.]+$/, "");
    let artist = "Unknown Artist";
    let album = "Unknown Album";
    let year: string | undefined;
    let trackNumber: number | undefined;
    let genre: string | undefined;
    let duration = 0;
    let cover: string | undefined;
    let lyrics: string | undefined;

    const metadata = await extractMetadata(file);
    
    if (metadata.title) title = metadata.title;
    if (metadata.artist) artist = metadata.artist;
    if (metadata.album) album = metadata.album;
    if (metadata.year) year = metadata.year;
    if (metadata.trackNumber) trackNumber = metadata.trackNumber;
    if (metadata.genre) genre = metadata.genre;
    if (metadata.duration) duration = metadata.duration;
    if (metadata.cover) cover = metadata.cover;
    if (metadata.lyrics) lyrics = metadata.lyrics;

    if (duration === 0) {
      try {
        const tempAudio = new Audio();
        tempAudio.src = url;
        await new Promise<void>((resolve) => {
          tempAudio.onloadedmetadata = () => resolve();
          tempAudio.onerror = () => resolve();
          setTimeout(() => resolve(), 5000);
        });
        duration = tempAudio.duration || 0;
      } catch (error) {
        console.error('Failed to get duration:', error);
      }
    }

    return {
      id: generateId(),
      title,
      artist,
      album,
      year,
      trackNumber,
      genre,
      duration,
      file,
      url,
      cover,
      lyrics,
    };
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(isValidAudioFile);
    if (validFiles.length === 0) {
      alert("请选择有效的音频文件 (MP3, WAV, OGG, FLAC, M4A, AAC)");
      return;
    }

    const tracks = await Promise.all(validFiles.map(processFile));
    
    if (playlist.length === 0) {
      setPlaylist(tracks);
      setCurrentTrack(tracks[0]);
    } else {
      tracks.forEach(track => addToPlaylist(track));
    }
  }, [playlist, setPlaylist, setCurrentTrack, addToPlaylist]);

  return (
    <div className={className}>
      <input
        type="file"
        id="file-upload"
        multiple
        accept="audio/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      <label
        htmlFor="file-upload"
        className="flex items-center gap-3 bg-spotify-dark hover:bg-spotify-gray p-4 rounded-lg cursor-pointer transition-colors group"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-spotify-green to-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <Upload className="w-6 h-6 text-black" />
        </div>
        <div>
          <p className="text-white font-semibold">上传本地音乐</p>
          <p className="text-spotify-lightGray text-sm">支持 ID3 标签、专辑封面和歌词</p>
        </div>
      </label>
    </div>
  );
};

export default FileUploader;
