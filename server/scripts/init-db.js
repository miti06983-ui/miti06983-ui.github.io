import { query } from '../config/database.js';

const initDatabase = async () => {
  try {
    console.log('Initializing database...');

    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    // Tracks table
    await query(`
      CREATE TABLE IF NOT EXISTS tracks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255),
        album VARCHAR(255),
        year VARCHAR(10),
        track_number INTEGER,
        genre VARCHAR(100),
        duration INTEGER,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        mime_type VARCHAR(50),
        cover_url TEXT,
        lyrics TEXT,
        is_liked BOOLEAN DEFAULT FALSE,
        play_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tracks table created');

    // Playlists table
    await query(`
      CREATE TABLE IF NOT EXISTS playlists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        cover_url TEXT,
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Playlists table created');

    // Playlist tracks junction table
    await query(`
      CREATE TABLE IF NOT EXISTS playlist_tracks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
        track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
        position INTEGER NOT NULL,
        added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(playlist_id, track_id)
      )
    `);
    console.log('✓ Playlist tracks table created');

    // User settings table
    await query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        audio_settings JSONB DEFAULT '{}',
        display_settings JSONB DEFAULT '{}',
        playback_settings JSONB DEFAULT '{}',
        notification_settings JSONB DEFAULT '{}',
        privacy_settings JSONB DEFAULT '{}',
        storage_settings JSONB DEFAULT '{}',
        network_settings JSONB DEFAULT '{}',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ User settings table created');

    // Listening history table
    await query(`
      CREATE TABLE IF NOT EXISTS listening_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
        played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        duration_played INTEGER DEFAULT 0
      )
    `);
    console.log('✓ Listening history table created');

    // Create indexes
    await query('CREATE INDEX IF NOT EXISTS idx_tracks_user_id ON tracks(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_tracks_title ON tracks(title)');
    await query('CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_history_user_id ON listening_history(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_history_played_at ON listening_history(played_at)');
    console.log('✓ Indexes created');

    console.log('\nDatabase initialization completed successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase();
