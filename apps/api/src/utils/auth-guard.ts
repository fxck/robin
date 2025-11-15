import { auth } from '../services/auth';
import type { H3Event } from 'h3';
import { log } from './logger';

/**
 * Auth guard utility to protect routes
 * Usage: const user = await requireAuth(event);
 */
export async function requireAuth(event: H3Event) {
  const session = await auth.api.getSession({ headers: getHeaders(event) });

  if (!session) {
    log.warn('Unauthorized access attempt', {
      type: 'auth_required',
      path: event.path,
      method: event.method,
      requestId: event.context.requestId,
    });

    throw createError({
      statusCode: 401,
      message: 'Authentication required',
    });
  }

  log.debug('User authenticated', {
    userId: session.user.id,
    path: event.path,
    requestId: event.context.requestId,
  });

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
