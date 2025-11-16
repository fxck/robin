import { db } from '../../../../../services/db';
import { users, accounts, sessions } from '@robin/database';
import { eq } from 'drizzle-orm';

// Exchange Google authorization code for tokens and create user session
export default defineEventHandler(async (event) => {
  const body = await readBody<{ code: string; state: string; redirectUri: string }>(event);
  const { code, state, redirectUri } = body;

  if (!code || !state) {
    throw createError({
      statusCode: 400,
      message: 'Missing code or state',
    });
  }

  // Validate state from Redis
  const redis = getRedis();
  if (redis) {
    const storedCallbackUrl = await redis.get(`oauth:state:${state}`);
    if (!storedCallbackUrl) {
      throw createError({
        statusCode: 400,
        message: 'Invalid or expired state',
      });
    }
    // Delete used state
    await redis.del(`oauth:state:${state}`);
  }

  // Exchange code for tokens
  const googleClientId = process.env['GOOGLE_CLIENT_ID'];
  const googleClientSecret = process.env['GOOGLE_CLIENT_SECRET'];

  if (!googleClientId || !googleClientSecret) {
    throw createError({
      statusCode: 500,
      message: 'Google OAuth is not configured',
    });
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: googleClientId,
      client_secret: googleClientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    console.error('Google token exchange failed:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to exchange authorization code',
    });
  }

  const tokens = await tokenResponse.json();
  const { access_token, id_token, refresh_token, expires_in } = tokens;

  // Decode ID token to get user info (basic verification)
  const idTokenPayload = JSON.parse(
    Buffer.from(id_token.split('.')[1], 'base64').toString()
  );

  const { sub: googleId, email, name, picture } = idTokenPayload;

  // Find or create user
  let user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    // Create new user
    const [newUser] = await db.insert(users).values({
      email,
      name: name || email.split('@')[0],
      image: picture || null,
      emailVerified: true, // Google verified the email
    }).returning();
    user = newUser;
  }

  // Find or create account
  const existingAccount = await db.query.accounts.findFirst({
    where: eq(accounts.accountId, googleId),
  });

  if (!existingAccount) {
    await db.insert(accounts).values({
      userId: user.id,
      accountId: googleId,
      providerId: 'google',
      accessToken: access_token,
      refreshToken: refresh_token || null,
      idToken: id_token,
      accessTokenExpiresAt: new Date(Date.now() + expires_in * 1000),
    });
  } else {
    // Update existing account tokens
    await db.update(accounts)
      .set({
        accessToken: access_token,
        refreshToken: refresh_token || null,
        idToken: id_token,
        accessTokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, existingAccount.id));
  }

  // Create session
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(sessions).values({
    userId: user.id,
    token: sessionToken,
    expiresAt,
  });

  // Set session cookie with SameSite=none for cross-domain
  setCookie(event, 'better-auth.session_token', sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified,
    },
    session: {
      token: sessionToken,
      expiresAt,
    },
  };
});
