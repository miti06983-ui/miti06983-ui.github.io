import { Hono } from 'hono';
import { jwtVerify } from 'jose';

const settings = new Hono();

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

const defaultSettings = {
  audio: {
    volume: 70,
    equalizerPreset: 'flat',
    customEqualizer: { bass: 50, mid: 50, treble: 50 },
    autoPlay: true,
    crossfade: false,
    crossfadeDuration: 2,
    normalizeVolume: false,
    monoAudio: false,
    spatialAudio: false,
  },
  display: {
    theme: 'dark',
    compactMode: false,
    showAlbumArt: true,
    showLyrics: true,
    lyricsSource: 'local',
    animationSpeed: 'normal',
    reducedMotion: false,
    language: 'en',
    fontSize: 'medium',
  },
  playback: {
    shuffle: false,
    repeatMode: 'none',
    skipForwardAmount: 10,
    skipBackwardAmount: 10,
    gaplessPlayback: false,
    autoplaySimilar: true,
    resumeOnStartup: true,
  },
  notifications: {
    enabled: true,
    newTrackAlert: true,
    downloadComplete: true,
    socialUpdates: false,
    soundEffects: true,
  },
  privacy: {
    showActivity: true,
    showListeningStats: true,
    analyticsEnabled: true,
    historyTracking: true,
  },
  storage: {
    cacheSize: 500,
    maxCacheAge: 30,
    downloadQuality: 'high',
    autoDownload: false,
    downloadOnWifiOnly: true,
  },
  network: {
    streamingQuality: 'high',
    proxyEnabled: false,
    proxyUrl: '',
    bandwidthLimit: 0,
    preFetchLyrics: true,
    preloadAlbums: false,
  },
};

// Get user settings
settings.get('/', authenticate, async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');

  const row = await db.prepare(
    'SELECT * FROM user_settings WHERE user_id = ?'
  ).bind(userId).first();

  if (!row) {
    // Create default settings
    await db.prepare(
      `INSERT INTO user_settings (user_id, audio_settings, display_settings, playback_settings, 
        notification_settings, privacy_settings, storage_settings, network_settings)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      userId,
      JSON.stringify(defaultSettings.audio),
      JSON.stringify(defaultSettings.display),
      JSON.stringify(defaultSettings.playback),
      JSON.stringify(defaultSettings.notifications),
      JSON.stringify(defaultSettings.privacy),
      JSON.stringify(defaultSettings.storage),
      JSON.stringify(defaultSettings.network)
    ).run();

    return c.json({ settings: defaultSettings });
  }

  return c.json({
    settings: {
      audio: JSON.parse(row.audio_settings),
      display: JSON.parse(row.display_settings),
      playback: JSON.parse(row.playback_settings),
      notifications: JSON.parse(row.notification_settings),
      privacy: JSON.parse(row.privacy_settings),
      storage: JSON.parse(row.storage_settings),
      network: JSON.parse(row.network_settings),
    }
  });
});

// Update settings
settings.put('/', authenticate, async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const body = await c.req.json();

  const fields = [];
  const values = [];

  if (body.audio !== undefined) { fields.push('audio_settings = ?'); values.push(JSON.stringify(body.audio)); }
  if (body.display !== undefined) { fields.push('display_settings = ?'); values.push(JSON.stringify(body.display)); }
  if (body.playback !== undefined) { fields.push('playback_settings = ?'); values.push(JSON.stringify(body.playback)); }
  if (body.notifications !== undefined) { fields.push('notification_settings = ?'); values.push(JSON.stringify(body.notifications)); }
  if (body.privacy !== undefined) { fields.push('privacy_settings = ?'); values.push(JSON.stringify(body.privacy)); }
  if (body.storage !== undefined) { fields.push('storage_settings = ?'); values.push(JSON.stringify(body.storage)); }
  if (body.network !== undefined) { fields.push('network_settings = ?'); values.push(JSON.stringify(body.network)); }

  if (fields.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  fields.push('updated_at = datetime("now")');
  values.push(userId);

  await db.prepare(
    `UPDATE user_settings SET ${fields.join(', ')} WHERE user_id = ?`
  ).bind(...values).run();

  return c.json({ message: 'Settings updated' });
});

// Reset settings to defaults
settings.post('/reset', authenticate, async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');

  await db.prepare(
    `UPDATE user_settings 
     SET audio_settings = ?, display_settings = ?, playback_settings = ?, 
         notification_settings = ?, privacy_settings = ?, storage_settings = ?, 
         network_settings = ?, updated_at = datetime("now")
     WHERE user_id = ?`
  ).bind(
    JSON.stringify(defaultSettings.audio),
    JSON.stringify(defaultSettings.display),
    JSON.stringify(defaultSettings.playback),
    JSON.stringify(defaultSettings.notifications),
    JSON.stringify(defaultSettings.privacy),
    JSON.stringify(defaultSettings.storage),
    JSON.stringify(defaultSettings.network),
    userId
  ).run();

  return c.json({ settings: defaultSettings });
});

export default settings;
