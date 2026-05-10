import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { parseMp3Header } from 'mp3-parser';
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
      console.log('🎵 Parsing file:', file.name);
      
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      // 尝试解析 MP3 头部
      try {
        const header = parseMp3Header(uint8Array);
        if (header) {
          console.log('✅ MP3 header parsed:', header);
          if (header.bitrate) {
            console.log('✓ Bitrate:', header.bitrate);
          }
        }
      } catch (err) {
        console.log('MP3 header parse failed, trying ID3...');
      }
      
      // 手动解析 ID3v2 标签
      if (uint8Array[0] === 0x49 && uint8Array[1] === 0x44 && uint8Array[2] === 0x33) {
        console.log('📋 Found ID3v2 tag');
        
        const version = uint8Array[3];
        const flags = uint8Array[5];
        const size = ((uint8Array[6] & 0x7f) << 21) | 
                     ((uint8Array[7] & 0x7f) << 14) | 
                     ((uint8Array[8] & 0x7f) << 7) | 
                     (uint8Array[9] & 0x7f);
        
        console.log('ID3v2 version:', version, 'size:', size);
        
        let offset = 10;
        const endOffset = offset + size;
        
        while (offset < endOffset - 10) {
          const frameId = String.fromCharCode(
            uint8Array[offset],
            uint8Array[offset + 1],
            uint8Array[offset + 2],
            uint8Array[offset + 3]
          );
          
          if (frameId[0] === '\0') break;
          
          const frameSize = (uint8Array[offset + 4] << 24) | 
                           (uint8Array[offset + 5] << 16) | 
                           (uint8Array[offset + 6] << 8) | 
                           uint8Array[offset + 7];
          
          console.log(`Found frame: ${frameId} (size: ${frameSize})`);
          
          const frameData = uint8Array.slice(offset + 10, offset + 10 + frameSize);
          
          // TIT2 = Title
          if (frameId === 'TIT2') {
            result.title = readText(frameData);
            console.log('✓ Title:', result.title);
          }
          // TPE1 = Artist
          else if (frameId === 'TPE1') {
            result.artist = readText(frameData);
            console.log('✓ Artist:', result.artist);
          }
          // TALB = Album
          else if (frameId === 'TALB') {
            result.album = readText(frameData);
            console.log('✓ Album:', result.album);
          }
          // TYER = Year
          else if (frameId === 'TYER' || frameId === 'TDRC') {
            result.year = readText(frameData);
            console.log('✓ Year:', result.year);
          }
          // TRCK = Track
          else if (frameId === 'TRCK') {
            const trackStr = readText(frameData);
            result.trackNumber = parseInt(trackStr);
            console.log('✓ Track:', result.trackNumber);
          }
          // TCON = Genre
          else if (frameId === 'TCON') {
            result.genre = readText(frameData);
            console.log('✓ Genre:', result.genre);
          }
          // APIC = Picture
          else if (frameId === 'APIC') {
            try {
              const coverUrl = extractCover(frameData);
              if (coverUrl) {
                result.cover = coverUrl;
                console.log('✓ Cover extracted');
              }
            } catch (err) {
              console.error('Failed to extract cover:', err);
            }
          }
          // USLT = Unsynchronized lyrics
          else if (frameId === 'USLT') {
            result.lyrics = parseLyrics(readText(frameData));
            console.log('✓ Lyrics found');
          }
          
          offset += 10 + frameSize;
        }
      } else {
        console.log('No ID3v2 tag found, checking for ID3v1...');
        
        // ID3v1 标签在文件末尾
        if (buffer.byteLength > 128) {
          const view = new DataView(buffer, buffer.byteLength - 128, 128);
          if (view.getUint8(0) === 0x54 && view.getUint8(1) === 0x41 && view.getUint8(2) === 0x47) {
            console.log('Found ID3v1 tag');
            
            result.title = readString(view, 3, 30).trim();
            result.artist = readString(view, 33, 30).trim();
            result.album = readString(view, 63, 30).trim();
            result.year = readString(view, 93, 4).trim();
            
            console.log('✓ ID3v1 title:', result.title);
            console.log('✓ ID3v1 artist:', result.artist);
            console.log('✓ ID3v1 album:', result.album);
          }
        }
      }
      
      console.log('📤 Final result:', result);
    } catch (error) {
      console.error('❌ Metadata parsing error:', error);
    }
    
    return result;
  };

  const readText = (data: Uint8Array): string => {
    let encoding = data[0];
    let text = '';
    
    if (encoding === 0 || encoding === 3) {
      // ISO-8859-1 or UTF-8
      text = new TextDecoder('utf-8').decode(data.slice(1));
    } else if (encoding === 1) {
      // UTF-16
      text = new TextDecoder('utf-16le').decode(data.slice(1));
    } else {
      text = new TextDecoder('utf-8').decode(data);
    }
    
    return text.replace(/\0+$/, '').trim();
  };

  const readString = (view: DataView, offset: number, length: number): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      const char = view.getUint8(offset + i);
      if (char === 0) break;
      result += String.fromCharCode(char);
    }
    return result;
  };

  const extractCover = (data: Uint8Array): string | null => {
    try {
      let textOffset = 0;
      const encoding = data[0];
      
      // 跳过文本编码、mimetype 和 0 分隔符
      for (let i = 1; i < data.length; i++) {
        if (data[i] === 0) {
          textOffset = i + 1;
          break;
        }
      }
      
      // 跳过图片类型和描述
      for (let i = textOffset; i < data.length; i++) {
        if (data[i] === 0) {
          textOffset = i + 1;
          break;
        }
      }
      
      const imageData = data.slice(textOffset);
      const base64 = arrayBufferToBase64(imageData.buffer);
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      return null;
    }
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
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
    if (metadata.cover) cover = metadata.cover;
    if (metadata.lyrics) lyrics = metadata.lyrics;

    // 获取时长
    try {
      const tempAudio = new Audio();
      tempAudio.src = url;
      await new Promise<void>((resolve) => {
        tempAudio.onloadedmetadata = () => {
          duration = tempAudio.duration;
          resolve();
        };
        tempAudio.onerror = () => resolve();
        setTimeout(() => resolve(), 5000);
      });
    } catch (error) {
      console.error('Failed to get duration:', error);
    }

    console.log('✅ Track created:', { title, artist, album, duration });
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

    console.log('📁 Processing', validFiles.length, 'files');
    const tracks = await Promise.all(validFiles.map(processFile));
    console.log('✅ All tracks processed');
    
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
