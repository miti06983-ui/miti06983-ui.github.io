import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

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
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      // Create default settings
      const newSettings = await query(
        `INSERT INTO user_settings (user_id, audio_settings, display_settings, playback_settings, 
          notification_settings, privacy_settings, storage_settings, network_settings)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          req.userId,
          JSON.stringify(defaultSettings.audio),
          JSON.stringify(defaultSettings.display),
          JSON.stringify(defaultSettings.playback),
          JSON.stringify(defaultSettings.notifications),
          JSON.stringify(defaultSettings.privacy),
          JSON.stringify(defaultSettings.storage),
          JSON.stringify(defaultSettings.network),
        ]
      );
      return res.json({ settings: formatSettings(newSettings.rows[0]) });
    }

    res.json({ settings: formatSettings(result.rows[0]) });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Update settings
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { audio, display, playback, notifications, privacy, storage, network } = req.body;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (audio !== undefined) {
      updates.push(`audio_settings = $${paramIndex}`);
      values.push(JSON.stringify(audio));
      paramIndex++;
    }
    if (display !== undefined) {
      updates.push(`display_settings = $${paramIndex}`);
      values.push(JSON.stringify(display));
      paramIndex++;
    }
    if (playback !== undefined) {
      updates.push(`playback_settings = $${paramIndex}`);
      values.push(JSON.stringify(playback));
      paramIndex++;
    }
    if (notifications !== undefined) {
      updates.push(`notification_settings = $${paramIndex}`);
      values.push(JSON.stringify(notifications));
      paramIndex++;
    }
    if (privacy !== undefined) {
      updates.push(`privacy_settings = $${paramIndex}`);
      values.push(JSON.stringify(privacy));
      paramIndex++;
    }
    if (storage !== undefined) {
      updates.push(`storage_settings = $${paramIndex}`);
      values.push(JSON.stringify(storage));
      paramIndex++;
    }
    if (network !== undefined) {
      updates.push(`network_settings = $${paramIndex}`);
      values.push(JSON.stringify(network));
      paramIndex++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.userId);

    const result = await query(
      `UPDATE user_settings 
       SET ${updates.join(', ')}
       WHERE user_id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      // Create settings if not exists
      const newSettings = await query(
        `INSERT INTO user_settings (user_id, audio_settings, display_settings, playback_settings, 
          notification_settings, privacy_settings, storage_settings, network_settings)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          req.userId,
          JSON.stringify(audio || defaultSettings.audio),
          JSON.stringify(display || defaultSettings.display),
          JSON.stringify(playback || defaultSettings.playback),
          JSON.stringify(notifications || defaultSettings.notifications),
          JSON.stringify(privacy || defaultSettings.privacy),
          JSON.stringify(storage || defaultSettings.storage),
          JSON.stringify(network || defaultSettings.network),
        ]
      );
      return res.json({ settings: formatSettings(newSettings.rows[0]) });
    }

    res.json({ settings: formatSettings(result.rows[0]) });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Reset settings to defaults
router.post('/reset', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `UPDATE user_settings 
       SET audio_settings = $1, display_settings = $2, playback_settings = $3, 
           notification_settings = $4, privacy_settings = $5, storage_settings = $6, 
           network_settings = $7, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $8
       RETURNING *`,
      [
        JSON.stringify(defaultSettings.audio),
        JSON.stringify(defaultSettings.display),
        JSON.stringify(defaultSettings.playback),
        JSON.stringify(defaultSettings.notifications),
        JSON.stringify(defaultSettings.privacy),
        JSON.stringify(defaultSettings.storage),
        JSON.stringify(defaultSettings.network),
        req.userId,
      ]
    );

    res.json({ settings: formatSettings(result.rows[0]) });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({ error: 'Failed to reset settings' });
  }
});

function formatSettings(row) {
  return {
    audio: row.audio_settings,
    display: row.display_settings,
    playback: row.playback_settings,
    notifications: row.notification_settings,
    privacy: row.privacy_settings,
    storage: row.storage_settings,
    network: row.network_settings,
  };
}

export default router;
