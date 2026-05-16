import { Hono } from 'hono';
import { jwtVerify } from 'jose';

const tracks = new Hono();

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

// Get all tracks
tracks.get('/', authenticate, async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');

  const { results } = await db.prepare(
    'SELECT * FROM tracks WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(userId).all();

  return c.json({ tracks: results });
});

// Upload track (metadata only - files stored in R2 in production)
tracks.post('/upload', authenticate, async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const { title, artist, album, year, trackNumber, genre, duration, lyrics } = await c.req.json();

  const result = await db.prepare(
    `INSERT INTO tracks (id, user_id, title, artist, album, year, track_number, genre, duration, lyrics)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     RETURNING *`
  ).bind(
    crypto.randomUUID(), userId, title, artist, album, year, trackNumber, genre, duration, lyrics
  ).first();

  return c.json({ track: result }, 201);
});

// Get track by ID
tracks.get('/:id', authenticate, async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const id = c.req.param('id');

  const track = await db.prepare(
    'SELECT * FROM tracks WHERE id = ? AND user_id = ?'
  ).bind(id, userId).first();

  if (!track) {
    return c.json({ error: 'Track not found' }, 404);
  }

  return c.json({ track });
});

// Update track
tracks.put('/:id', authenticate, async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const id = c.req.param('id');
  const updates = await c.req.json();

  const fields = [];
  const values = [];
  
  if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
  if (updates.artist !== undefined) { fields.push('artist = ?'); values.push(updates.artist); }
  if (updates.album !== undefined) { fields.push('album = ?'); values.push(updates.album); }
  if (updates.year !== undefined) { fields.push('year = ?'); values.push(updates.year); }
  if (updates.trackNumber !== undefined) { fields.push('track_number = ?'); values.push(updates.trackNumber); }
  if (updates.genre !== undefined) { fields.push('genre = ?'); values.push(updates.genre); }
  if (updates.lyrics !== undefined) { fields.push('lyrics = ?'); values.push(updates.lyrics); }
  if (updates.isLiked !== undefined) { fields.push('is_liked = ?'); values.push(updates.isLiked); }

  if (fields.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  values.push(id, userId);

  const result = await db.prepare(
    `UPDATE tracks SET ${fields.join(', ')} WHERE id = ? AND user_id = ? RETURNING *`
  ).bind(...values).first();

  if (!result) {
    return c.json({ error: 'Track not found' }, 404);
  }

  return c.json({ track: result });
});

// Delete track
tracks.delete('/:id', authenticate, async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const id = c.req.param('id');

  const result = await db.prepare(
    'DELETE FROM tracks WHERE id = ? AND user_id = ? RETURNING *'
  ).bind(id, userId).first();

  if (!result) {
    return c.json({ error: 'Track not found' }, 404);
  }

  return c.json({ message: 'Track deleted successfully' });
});

// Toggle like
tracks.post('/:id/like', authenticate, async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const id = c.req.param('id');

  const result = await db.prepare(
    'UPDATE tracks SET is_liked = NOT is_liked WHERE id = ? AND user_id = ? RETURNING *'
  ).bind(id, userId).first();

  if (!result) {
    return c.json({ error: 'Track not found' }, 404);
  }

  return c.json({ track: result });
});

// Record play
tracks.post('/:id/play', authenticate, async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const id = c.req.param('id');
  const { durationPlayed } = await c.req.json();

  await db.prepare(
    'UPDATE tracks SET play_count = play_count + 1 WHERE id = ?'
  ).bind(id).run();

  await db.prepare(
    'INSERT INTO listening_history (id, user_id, track_id, duration_played) VALUES (?, ?, ?, ?)'
  ).bind(crypto.randomUUID(), userId, id, durationPlayed || 0).run();

  return c.json({ message: 'Play count updated' });
});

export default tracks;
