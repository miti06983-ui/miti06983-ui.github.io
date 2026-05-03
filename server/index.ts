import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import { scanLibrary, getTrackList, getTrackById, getTrackCover } from './scanner';
import { fetchLyrics } from './lyrics';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// 启动时扫描一次
scanLibrary().then(() => {
  console.log('Initial library scan complete.');
});

// 1. 获取所有扫描到的歌曲
app.get('/api/tracks', (req, res) => {
  res.json(getTrackList());
});

// 2. 重新扫描
app.post('/api/scan', async (req, res) => {
  const tracks = await scanLibrary();
  res.json({ message: 'Scan complete', count: tracks.length });
});

// 3. 歌曲流服务
app.get('/api/stream/:id', (req, res) => {
  const track = getTrackById(req.params.id);
  if (!track) return res.status(404).json({ error: 'Track not found' });

  const stat = fs.statSync(track.path);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(track.path, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'audio/mpeg',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg',
    };
    res.writeHead(200, head);
    fs.createReadStream(track.path).pipe(res);
  }
});

// 4. 封面提取
app.get('/api/cover/:id', async (req, res) => {
  const cover = await getTrackCover(req.params.id);
  if (!cover) {
    return res.status(404).send('Cover not found');
  }
  res.setHeader('Content-Type', cover.format);
  res.send(cover.data);
});

// 5. 歌词接口
app.get('/api/lyrics', async (req, res) => {
  const { title, artist } = req.query;
  const lyrics = await fetchLyrics(title as string, artist as string);
  res.json({ lyrics });
});

// 6. 标签自动修复
app.post('/api/repair/:id', async (req, res) => {
  const { updateTrackMetadata, getTrackById } = await import('./scanner');
  const track = getTrackById(req.params.id);
  if (!track) return res.status(404).json({ error: 'Track not found' });

  try {
    const fetch = (await import('node-fetch')).default;
    // Clean up filename for searching (remove .mp3 and common junk)
    const query = track.fileName.replace(/\.(mp3|flac|wav|m4a)$/i, '').replace(/[_-]/g, ' ');
    
    console.log(`Repairing track ${track.id}: searching for "${query}"`);
    
    const searchUrl = `https://music.163.com/api/search/get/web?s=${encodeURIComponent(query)}&type=1&limit=5`;
    const response = await fetch(searchUrl);
    const data: any = await response.json();

    if (data.result && data.result.songs && data.result.songs.length > 0) {
      const bestMatch = data.result.songs[0];
      
      const updates = {
        title: bestMatch.name,
        artist: bestMatch.artists.map((a: any) => a.name).join(', '),
        album: bestMatch.album.name,
        externalCoverUrl: bestMatch.album.picUrl,
        hasCover: true
      };

      const updatedTrack = updateTrackMetadata(track.id, updates);
      res.json({ success: true, track: updatedTrack });
    } else {
      res.status(404).json({ error: 'No match found' });
    }
  } catch (err) {
    console.error('Repair failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Big Backend is running on http://localhost:${port}`);
});
