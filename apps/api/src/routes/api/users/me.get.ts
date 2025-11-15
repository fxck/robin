import { log } from '~/utils/logger';

// Note: defineEventHandler, requireAuth, getHeaders are auto-imported by Nitro
export default defineEventHandler(async (event) => {
  // Use the requireAuth utility (auto-imported from utils)
  const user = await requireAuth(event);

  log.debug('Current user fetched', {
    userId: user.id,
    requestId: event.context.requestId,
  });

  // Return user information (requireAuth already validates session)
  return {
    user,
  };
});
