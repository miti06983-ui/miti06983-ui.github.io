import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import authRoutes from './routes/auth.js';
import tracksRoutes from './routes/tracks.js';
import playlistsRoutes from './routes/playlists.js';
import settingsRoutes from './routes/settings.js';

const app = new Hono();

// CORS
app.use('*', cors({
  origin: (origin) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      /^https:\/\/.*\.github\.io$/,
    ];
    
    for (const allowed of allowedOrigins) {
      if (allowed instanceof RegExp) {
        if (allowed.test(origin)) return origin;
      } else if (allowed === origin) {
        return origin;
      }
    }
    
    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.route('/api/auth', authRoutes);
app.route('/api/tracks', tracksRoutes);
app.route('/api/playlists', playlistsRoutes);
app.route('/api/settings', settingsRoutes);

// 404
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
