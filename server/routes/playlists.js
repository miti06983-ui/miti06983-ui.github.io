import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all playlists for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, COUNT(pt.track_id) as track_count 
       FROM playlists p 
       LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id 
       WHERE p.user_id = $1 
       GROUP BY p.id 
       ORDER BY p.created_at DESC`,
      [req.userId]
    );
    res.json({ playlists: result.rows });
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({ error: 'Failed to get playlists' });
  }
});

// Create playlist
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    const result = await query(
      'INSERT INTO playlists (user_id, name, description, is_public) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, name, description, isPublic || false]
    );

    res.status(201).json({ playlist: result.rows[0] });
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Get playlist by ID with tracks
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const playlistResult = await query(
      'SELECT * FROM playlists WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );

    if (playlistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const tracksResult = await query(
      `SELECT t.*, pt.position 
       FROM tracks t 
       JOIN playlist_tracks pt ON t.id = pt.track_id 
       WHERE pt.playlist_id = $1 
       ORDER BY pt.position`,
      [req.params.id]
    );

    res.json({
      playlist: playlistResult.rows[0],
      tracks: tracksResult.rows
    });
  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({ error: 'Failed to get playlist' });
  }
});

// Update playlist
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    const result = await query(
      `UPDATE playlists 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           is_public = COALESCE($3, is_public),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [name, description, isPublic, req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    res.json({ playlist: result.rows[0] });
  } catch (error) {
    console.error('Update playlist error:', error);
    res.status(500).json({ error: 'Failed to update playlist' });
  }
});

// Delete playlist
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM playlists WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

// Add track to playlist
router.post('/:id/tracks', authenticateToken, async (req, res) => {
  try {
    const { trackId } = req.body;

    // Get current max position
    const positionResult = await query(
      'SELECT MAX(position) as max_pos FROM playlist_tracks WHERE playlist_id = $1',
      [req.params.id]
    );

    const position = (positionResult.rows[0].max_pos || 0) + 1;

    await query(
      'INSERT INTO playlist_tracks (playlist_id, track_id, position) VALUES ($1, $2, $3)',
      [req.params.id, trackId, position]
    );

    res.status(201).json({ message: 'Track added to playlist' });
  } catch (error) {
    console.error('Add track to playlist error:', error);
    res.status(500).json({ error: 'Failed to add track to playlist' });
  }
});

// Remove track from playlist
router.delete('/:id/tracks/:trackId', authenticateToken, async (req, res) => {
  try {
    await query(
      'DELETE FROM playlist_tracks WHERE playlist_id = $1 AND track_id = $2',
      [req.params.id, req.params.trackId]
    );

    res.json({ message: 'Track removed from playlist' });
  } catch (error) {
    console.error('Remove track from playlist error:', error);
    res.status(500).json({ error: 'Failed to remove track from playlist' });
  }
});

export default router;
