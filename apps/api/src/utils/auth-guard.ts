import { auth } from '../services/auth';
import type { H3Event } from 'h3';

/**
 * Auth guard utility to protect routes
 * Usage: const user = await requireAuth(event);
 */
export async function requireAuth(event: H3Event) {
  const session = await auth.api.getSession({ headers: getHeaders(event) });

  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required',
    });
  }

  return session.user;
}

/**
 * Optional auth - returns user if authenticated, null otherwise
 * Usage: const user = await optionalAuth(event);
 */
export async function optionalAuth(event: H3Event) {
  try {
    const session = await auth.api.getSession({ headers: getHeaders(event) });
    return session?.user || null;
  } catch {
    return null;
  }
}
