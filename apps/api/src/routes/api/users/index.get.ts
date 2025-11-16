import { z } from 'zod';
import { db } from '~/services/db';
import { schema } from '@robin/database';
import { desc, count, like, or } from 'drizzle-orm';
import { log } from '~/utils/logger';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  // Validate query parameters
  const query = await getValidatedQuery(event, querySchema.parse);

  log.debug('Fetching users list', {
    page: query.page,
    limit: query.limit,
    search: query.search,
    requestId: event.context.requestId,
  });

  const offset = (query.page - 1) * query.limit;

  // Build where clause for search
  const whereClause = query.search
    ? or(
        like(schema.users.name, `%${query.search}%`),
        like(schema.users.email, `%${query.search}%`)
      )
    : undefined;

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(schema.users)
    .where(whereClause);

  // Get users with pagination
  const users = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      image: schema.users.image,
      emailVerified: schema.users.emailVerified,
      createdAt: schema.users.createdAt,
      updatedAt: schema.users.updatedAt,
    })
    .from(schema.users)
    .where(whereClause)
    .orderBy(desc(schema.users.createdAt))
    .limit(query.limit)
    .offset(offset);

  log.debug('Users list fetched', {
    count: users.length,
    total,
    requestId: event.context.requestId,
  });

  return {
    data: users,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit),
    },
  };
});
