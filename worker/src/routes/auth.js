import { Hono } from 'hono';
import { SignJWT, jwtVerify } from 'jose';

const auth = new Hono();

// Helper to get JWT secret
const getSecret = (c) => {
  return new TextEncoder().encode(c.env.JWT_SECRET || 'dev-secret-key');
};

// Register
auth.post('/register', async (c) => {
  const { email, username, password } = await c.req.json();
  const db = c.env.DB;

  // Check if user exists
  const existing = await db.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(email).first();

  if (existing) {
    return c.json({ error: 'Email already registered' }, 409);
  }

  // Hash password (simple hash for demo, use bcrypt in production)
  const passwordHash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(password)
  ).then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));

  // Create user
  const result = await db.prepare(
    'INSERT INTO users (id, email, username, password_hash) VALUES (?, ?, ?, ?) RETURNING id, email, username, created_at'
  ).bind(crypto.randomUUID(), email, username, passwordHash).first();

  // Generate JWT
  const token = await new SignJWT({ userId: result.id, email: result.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret(c));

  // Create default settings
  await db.prepare(
    'INSERT INTO user_settings (user_id) VALUES (?)'
  ).bind(result.id).run();

  return c.json({
    message: 'User registered successfully',
    user: result,
    token
  }, 201);
});

// Login
auth.post('/login', async (c) => {
  const { email, password } = await c.req.json();
  const db = c.env.DB;

  // Find user
  const user = await db.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email).first();

  if (!user) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  // Verify password
  const passwordHash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(password)
  ).then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));

  if (passwordHash !== user.password_hash) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  // Generate JWT
  const token = await new SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret(c));

  return c.json({
    message: 'Login successful',
    user: { id: user.id, email: user.email, username: user.username },
    token
  });
});

// Get current user
auth.get('/me', async (c) => {
  const authHeader = c.req.header('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Access token required' }, 401);
  }

  const token = authHeader.slice(7);
  const db = c.env.DB;

  try {
    const { payload } = await jwtVerify(token, getSecret(c));
    const user = await db.prepare(
      'SELECT id, email, username, avatar_url, created_at FROM users WHERE id = ?'
    ).bind(payload.userId).first();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user });
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 403);
  }
});

// Update profile
auth.put('/profile', async (c) => {
  const authHeader = c.req.header('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Access token required' }, 401);
  }

  const token = authHeader.slice(7);
  const { username } = await c.req.json();
  const db = c.env.DB;

  try {
    const { payload } = await jwtVerify(token, getSecret(c));
    const result = await db.prepare(
      'UPDATE users SET username = ?, updated_at = datetime("now") WHERE id = ? RETURNING id, email, username'
    ).bind(username, payload.userId).first();

    return c.json({ user: result });
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 403);
  }
});

export default auth;
