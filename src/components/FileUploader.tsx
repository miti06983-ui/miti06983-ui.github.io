import React, { useCallback } from 'react';
import { Upload, FolderOpen } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { Track } from '../types';
import { generateId, isValidAudioFile } from '../utils';
import { parseBlob } from 'music-metadata-browser';

interface FileUploaderProps {
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ className }) => {
  const { setPlaylist, addToPlaylist, setCurrentTrack, playlist } = usePlayerStore();

  const processFile = async (file: File): Promise<Track> => {
    const url = URL.createObjectURL(file);
    let title = file.name.replace(/\.[^/.]+$/, "");
    let artist = "未知艺术家";
    let album = "未知专辑";
    let duration = 0;
    let cover: string | undefined;

    try {
      const metadata = await parseBlob(file);
      
      if (metadata.common.title) title = metadata.common.title;
      if (metadata.common.artist) artist = metadata.common.artist;
      if (metadata.common.album) album = metadata.common.album;
      if (metadata.format.duration) duration = metadata.format.duration;
      
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const pic = metadata.common.picture[0];
        const blob = new Blob([pic.data], { type: pic.format });
        cover = URL.createObjectURL(blob);
      }
    } catch (error) {
      console.error("解析元数据失败:", error);
      
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
      duration,
      file,
      url,
      cover,
    };
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(isValidAudioFile);
    if (validFiles.length === 0) {
      alert("请选择有效的音频文件 (mp3, wav, ogg, flac, m4a, aac)");
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
          <p className="text-spotify-lightGray text-sm">点击选择文件或将文件拖放到此处</p>
        </div>
      </label>
    </div>
  );
};

export default FileUploader;
