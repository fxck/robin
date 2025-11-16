// Custom Google OAuth initiation that redirects back to FRONTEND
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const frontendCallbackUrl = query.callbackUrl as string || 'http://localhost:5173/auth/callback/google';

  const googleClientId = process.env['GOOGLE_CLIENT_ID'];

  if (!googleClientId) {
    throw createError({
      statusCode: 500,
      message: 'Google OAuth is not configured',
    });
  }

  // Generate state for CSRF protection
  const state = crypto.randomUUID();

  // Store state in Redis with short TTL (10 minutes)
  const redis = getRedis();
  if (redis) {
    await redis.set(`oauth:state:${state}`, frontendCallbackUrl, 'EX', 600);
  }

  // Build Google OAuth URL that redirects to FRONTEND
  const scope = 'openid email profile';
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', googleClientId);
  googleAuthUrl.searchParams.set('redirect_uri', frontendCallbackUrl); // Frontend URL!
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', scope);
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'consent');

  return sendRedirect(event, googleAuthUrl.toString());
});
