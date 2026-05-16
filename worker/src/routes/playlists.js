import { Hono } from 'hono';
import { jwtVerify } from 'jose';

const playlists = new Hono();

const getSecret = (c) => {
  return new TextEncoder().encode(c.env.JWT_SECRET || 'dev-secret-key');
};

const authenticate = async (c, next) => {
  const authHeader = c.req.header('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Access token required' }, 401);
  }

  const token = authHeader.slice(7);
  try {
    const { payload } = await jwtVerify(token, getSecret(c));
    c.set('userId', payload.userId);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 403);
  }
};

// Get all playlists
playlists.get('/', authenticate, async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');

  const { results } = await db.prepare(
    `SELECT p.*, COUNT(pt.track_id) as track_count 
     FROM playlists p 
     LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id 
     WHERE p.user_id = ? 
     GROUP BY p.id 
     ORDER BY p.created_at DESC`
  ).bind(userId).all();

  return c.json({ playlists: results });
});

// Create playlist
playlists.post('/', authenticate, async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const { name, description, isPublic } = await c.req.json();

  const result = await db.prepare(
    'INSERT INTO playlists (id, user_id, name, description, is_public) VALUES (?, ?, ?, ?, ?) RETURNING *'
  ).bind(crypto.randomUUID(), userId, name, description, isPublic || false).first();

  return c.json({ playlist: result }, 201);
});

// Get playlist by ID with tracks
playlists.get('/:id', authenticate, async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const id = c.req.param('id');

  const playlist = await db.prepare(
    'SELECT * FROM playlists WHERE id = ? AND user_id = ?'
  ).bind(id, userId).first();

  if (!playlist) {
    return c.json({ error: 'Playlist not found' }, 404);
  }

  const { results: tracks } = await db.prepare(
    `SELECT t.*, pt.position 
     FROM tracks t 
     JOIN playlist_tracks pt ON t.id = pt.track_id 
     WHERE pt.playlist_id = ? 
     ORDER BY pt.position`
  ).bind(id).all();

  return c.json({ playlist, tracks });
});

// Update playlist
playlists.put('/:id', authenticate, async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const id = c.req.param('id');
  const { name, description, isPublic } = await c.req.json();

  const fields = [];
  const values = [];

  if (name !== undefined) { fields.push('name = ?'); values.push(name); }
  if (description !== undefined) { fields.push('description = ?'); values.push(description); }
  if (isPublic !== undefined) { fields.push('is_public = ?'); values.push(isPublic); }

  if (fields.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  fields.push('updated_at = datetime("now")');
  values.push(id, userId);

  const result = await db.prepare(
    `UPDATE playlists SET ${fields.join(', ')} WHERE id = ? AND user_id = ? RETURNING *`
  ).bind(...values).first();

  if (!result) {
    return c.json({ error: 'Playlist not found' }, 404);
  }

  return c.json({ playlist: result });
});

// Delete playlist
playlists.delete('/:id', authenticate, async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const id = c.req.param('id');

  const result = await db.prepare(
    'DELETE FROM playlists WHERE id = ? AND user_id = ? RETURNING *'
  ).bind(id, userId).first();

  if (!result) {
    return c.json({ error: 'Playlist not found' }, 404);
  }

  return c.json({ message: 'Playlist deleted successfully' });
});

// Add track to playlist
playlists.post('/:id/tracks', authenticate, async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const { trackId } = await c.req.json();

  // Get current max position
  const maxPos = await db.prepare(
    'SELECT MAX(position) as max_pos FROM playlist_tracks WHERE playlist_id = ?'
  ).bind(id).first();

  const position = (maxPos?.max_pos || 0) + 1;

  await db.prepare(
    'INSERT INTO playlist_tracks (id, playlist_id, track_id, position) VALUES (?, ?, ?, ?)'
  ).bind(crypto.randomUUID(), id, trackId, position).run();

  return c.json({ message: 'Track added to playlist' }, 201);
});

// Remove track from playlist
playlists.delete('/:id/tracks/:trackId', authenticate, async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const trackId = c.req.param('trackId');

  await db.prepare(
    'DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?'
  ).bind(id, trackId).run();

  return c.json({ message: 'Track removed from playlist' });
});

export default playlists;
