import { pgTable, text, timestamp, integer, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { users } from './users';

export const posts = pgTable(
  'posts',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    content: text('content').notNull(),
    excerpt: text('excerpt'),
    coverImage: text('cover_image'), // S3 URL
    coverImageThumb: text('cover_image_thumb'), // Thumbnail URL
    status: text('status', { enum: ['draft', 'published'] })
      .notNull()
      .default('draft'),
    views: integer('views').notNull().default(0),
    likesCount: integer('likes_count').notNull().default(0),
    publishedAt: timestamp('published_at', { mode: 'date' }),
    deletedAt: timestamp('deleted_at', { mode: 'date' }), // Soft delete
    // Full-text search vector (populated via trigger or app)
    searchVector: text('search_vector'),
    // Optimistic locking
    version: integer('version').notNull().default(1),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => sql`now()`)
      .notNull(),
  },
  (table) => ({
    // Index for user's posts
    userIdIdx: index('posts_user_id_idx').on(table.userId),
    // Unique slug per user (allows different users to have same slug)
    slugIdx: uniqueIndex('posts_slug_idx').on(table.userId, table.slug),
    // Index for published posts (most common query)
    statusPublishedIdx: index('posts_status_published_idx').on(table.status, table.publishedAt),
    // Index for soft deletes
    deletedAtIdx: index('posts_deleted_at_idx').on(table.deletedAt),
    // Full-text search index (GIN index for tsvector)
    searchVectorIdx: index('posts_search_vector_idx').using(
      'gin',
      sql`to_tsvector('english', ${table.title} || ' ' || ${table.content})`
    ),
  })
);

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  likes: many(postLikes),
}));

export const postLikes = pgTable(
  'post_likes',
  {
    id: text('id').primaryKey(),
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    // Unique constraint: one like per user per post
    uniqueLike: uniqueIndex('post_likes_unique_idx').on(table.postId, table.userId),
    // Index for user's likes
    userIdIdx: index('post_likes_user_id_idx').on(table.userId),
    // Index for post's likes
    postIdIdx: index('post_likes_post_id_idx').on(table.postId),
  })
);

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
}));

// Type exports for use in application
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostLike = typeof postLikes.$inferSelect;
export type NewPostLike = typeof postLikes.$inferInsert;
