import { z } from 'zod';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  // Validate query parameters
  const query = await getValidatedQuery(event, querySchema.parse);

  // TODO: Replace with actual database query
  // This is a placeholder showing the pattern
  const users = [
    {
      id: '1',
      email: 'demo@example.com',
      name: 'Demo User',
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    data: users,
    pagination: {
      page: query.page,
      limit: query.limit,
      total: users.length,
      pages: Math.ceil(users.length / query.limit),
    },
  };
});
