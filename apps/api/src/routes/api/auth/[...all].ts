import { toWebRequest } from 'h3';
import { auth } from '../../../services/auth';

// Note: defineEventHandler is auto-imported by Nitro
// toWebRequest and auth must be explicitly imported as they're specific dependencies
export default defineEventHandler(async (event) => {
  return auth.handler(toWebRequest(event));
});
