import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { Track } from '../types';
import { generateId, isValidAudioFile } from '../utils';
import { parseBlob, type IPicture } from 'music-metadata-browser';

interface FileUploaderProps {
  className?: string;
}

interface LyricLine {
  time: number;
  text: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ className }) => {
  const { setPlaylist, addToPlaylist, setCurrentTrack, playlist } = usePlayerStore();

  // Parse LRC format lyrics
  const parseLyrics = (lyricsText: string): string => {
    if (!lyricsText) return '';
    
    // Check if it's LRC format with timestamps
    const lrcRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/g;
    const lines: LyricLine[] = [];
    let match;
    
    // Try to parse as LRC
    let hasTimestamps = false;
    const tempLyrics = lyricsText;
    
    while ((match = lrcRegex.exec(tempLyrics)) !== null) {
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
      // Sort by time
      lines.sort((a, b) => a.time - b.time);
      // Return formatted lyrics with timestamps
      return lines.map(line => `[${formatLyricTime(line.time)}] ${line.text}`).join('\n');
    }
    
    // If not LRC, return plain text
    return lyricsText.trim();
  };

  const formatLyricTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
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

    try {
      const metadata = await parseBlob(file);
      
      console.log('=== Metadata Debug ===');
      console.log('File:', file.name);
      console.log('Metadata:', JSON.stringify(metadata, null, 2));
      console.log('Common:', metadata.common);
      
      // Extract basic ID3 tags
      if (metadata.common.title) title = metadata.common.title;
      if (metadata.common.artist) artist = metadata.common.artist;
      if (metadata.common.album) album = metadata.common.album;
      if (metadata.common.year) year = metadata.common.year.toString();
      if (metadata.common.track?.no) trackNumber = metadata.common.track.no;
      if (metadata.common.genre && metadata.common.genre.length > 0) {
        genre = metadata.common.genre.join(', ');
      }
      
      if (metadata.format.duration) duration = metadata.format.duration;
      
      // Extract cover art from ID3 tags (APIC frame)
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const pic: IPicture = metadata.common.picture[0];
        const data = pic.data;
        const blob = new Blob([data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer)], { type: pic.format });
        cover = URL.createObjectURL(blob);
      }
      
      // Extract lyrics from various ID3 frames
      if (metadata.common.lyrics && metadata.common.lyrics.length > 0) {
        lyrics = parseLyrics(metadata.common.lyrics[0]);
      } else if (metadata.common.comment && metadata.common.comment.length > 0) {
        const lyricComment = metadata.common.comment.find(
          (comment: string) => 
            (comment.toLowerCase().includes('lyric') || 
            comment.toLowerCase().includes('歌词'))
        );
        if (lyricComment) {
          lyrics = parseLyrics(lyricComment);
        }
      }
      
      // Try to extract from unsynchronised lyrics (USLT frame)
      if (!lyrics && (metadata as any).native) {
        const nativeTags = (metadata as any).native;
        for (const tagType of Object.keys(nativeTags)) {
          const tags = nativeTags[tagType];
          for (const tag of tags) {
            if (tag.id === 'USLT' || tag.id === 'LYRICS' || tag.id === 'SYLT') {
              if (tag.value && tag.value.text) {
                lyrics = parseLyrics(tag.value.text);
                break;
              } else if (typeof tag.value === 'string') {
                lyrics = parseLyrics(tag.value);
                break;
              }
            }
          }
          if (lyrics) break;
        }
      }
      
    } catch (error) {
      console.error("Failed to parse metadata:", error);
      
      // Fallback to get duration if metadata parsing failed
      const tempAudio = new Audio();
      tempAudio.src = url;
      await new Promise(resolve => {
        tempAudio.addEventListener('loadedmetadata', resolve);
      });
      duration = tempAudio.duration;
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
      alert("Please select valid audio files (MP3, WAV, OGG, FLAC, M4A, AAC)");
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
          <p className="text-white font-semibold">Upload local music</p>
          <p className="text-spotify-lightGray text-sm">Supports ID3 tags, album art, and lyrics</p>
        </div>
      </label>
    </div>
  );
};

export default FileUploader;
