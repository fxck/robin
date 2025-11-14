import { z } from 'zod';
import type { H3Event } from 'h3';

/**
 * Common validation schemas
 */

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const ulidSchema = z
  .string()
  .length(26, 'Invalid ULID')
  .regex(/^[0-9A-Z]{26}$/, 'Invalid ULID format');

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

/**
 * Utility to create validated route handlers
 */
export function createValidatedHandler<TBody extends z.ZodSchema, TQuery extends z.ZodSchema>(
  schemas: {
    body?: TBody;
    query?: TQuery;
  },
  handler: (event: H3Event, data: {
    body?: z.infer<TBody>;
    query?: z.infer<TQuery>;
  }) => Promise<unknown>
) {
  return defineEventHandler(async (event) => {
    const data: {
      body?: z.infer<TBody>;
      query?: z.infer<TQuery>;
    } = {};

    if (schemas.body) {
      data.body = await readValidatedBody(event, schemas.body.parse);
    }

    if (schemas.query) {
      data.query = await getValidatedQuery(event, schemas.query.parse);
    }

    return handler(event, data);
  });
}
