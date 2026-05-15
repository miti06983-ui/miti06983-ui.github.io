import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800') },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  }
});

// Get all tracks for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM tracks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json({ tracks: result.rows });
  } catch (error) {
    console.error('Get tracks error:', error);
    res.status(500).json({ error: 'Failed to get tracks' });
  }
});

// Upload track
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, artist, album, year, trackNumber, genre, duration, lyrics } = req.body;

    const result = await query(
      `INSERT INTO tracks (user_id, title, artist, album, year, track_number, genre, duration, file_path, file_size, mime_type, lyrics)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        req.userId,
        title || req.file.originalname.replace(/\.[^/.]+$/, ''),
        artist,
        album,
        year,
        trackNumber,
        genre,
        duration,
        req.file.filename,
        req.file.size,
        req.file.mimetype,
        lyrics
      ]
    );

    res.status(201).json({ track: result.rows[0] });
  } catch (error) {
    console.error('Upload track error:', error);
    res.status(500).json({ error: 'Failed to upload track' });
  }
});

// Get track by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM tracks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }

    res.json({ track: result.rows[0] });
  } catch (error) {
    console.error('Get track error:', error);
    res.status(500).json({ error: 'Failed to get track' });
  }
});

// Update track
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, artist, album, year, trackNumber, genre, lyrics, isLiked } = req.body;

    const result = await query(
      `UPDATE tracks 
       SET title = COALESCE($1, title), 
           artist = COALESCE($2, artist), 
           album = COALESCE($3, album), 
           year = COALESCE($4, year), 
           track_number = COALESCE($5, track_number), 
           genre = COALESCE($6, genre), 
           lyrics = COALESCE($7, lyrics), 
           is_liked = COALESCE($8, is_liked)
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [title, artist, album, year, trackNumber, genre, lyrics, isLiked, req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }

    res.json({ track: result.rows[0] });
  } catch (error) {
    console.error('Update track error:', error);
    res.status(500).json({ error: 'Failed to update track' });
  }
});

// Delete track
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM tracks WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }

    res.json({ message: 'Track deleted successfully' });
  } catch (error) {
    console.error('Delete track error:', error);
    res.status(500).json({ error: 'Failed to delete track' });
  }
});

// Toggle like
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'UPDATE tracks SET is_liked = NOT is_liked WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }

    res.json({ track: result.rows[0] });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Increment play count
router.post('/:id/play', authenticateToken, async (req, res) => {
  try {
    await query(
      'UPDATE tracks SET play_count = play_count + 1 WHERE id = $1',
      [req.params.id]
    );

    // Add to listening history
    await query(
      'INSERT INTO listening_history (user_id, track_id, duration_played) VALUES ($1, $2, $3)',
      [req.userId, req.params.id, req.body.durationPlayed || 0]
    );

    res.json({ message: 'Play count updated' });
  } catch (error) {
    console.error('Update play count error:', error);
    res.status(500).json({ error: 'Failed to update play count' });
  }
});

export default router;
