import { toWebRequest } from 'h3';
import { auth } from '../../../services/auth';

// Note: defineEventHandler is auto-imported by Nitro
// toWebRequest and auth must be explicitly imported as they're specific dependencies
export default defineEventHandler(async (event) => {
  const response = await auth.handler(toWebRequest(event));

  // Log set-cookie headers for debugging
  const cookies = response.headers.get('set-cookie');
  if (cookies) {
    console.log('[Auth Handler] Setting cookies:', cookies);
  } else {
    console.log('[Auth Handler] No cookies set for:', event.path);
  }

  return response;
});
