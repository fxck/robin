import { toWebRequest, parseCookies } from 'h3';
import { auth } from '../../../services/auth';

// Note: defineEventHandler is auto-imported by Nitro
// toWebRequest and auth must be explicitly imported as they're specific dependencies
export default defineEventHandler(async (event) => {
  // Debug: Log cookies for get-session requests
  const path = event.path || event.node?.req?.url || '';
  if (path.includes('get-session')) {
    const cookies = parseCookies(event);
    console.log('[Auth Handler] get-session request:', {
      path,
      hasBetterAuthCookie: !!cookies['better-auth.session_token'],
      allCookies: Object.keys(cookies),
      cookieValue: cookies['better-auth.session_token']?.substring(0, 20) + '...',
    });
  }

  return auth.handler(toWebRequest(event));
});
