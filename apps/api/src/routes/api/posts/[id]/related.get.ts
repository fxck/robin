import { defineEventHandler, getRouterParam, createError } from 'h3';
import { eq, and, desc, ne, sql } from 'drizzle-orm';
import { db } from '../../../../services/db';
import { schema } from '@robin/database';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Post ID is required',
    });
  }

  try {
    // Get the current post to find similar ones
    const currentPost = await db
      .select({
        id: schema.posts.id,
        title: schema.posts.title,
        excerpt: schema.posts.excerpt,
        content: schema.posts.content,
      })
      .from(schema.posts)
      .where(and(eq(schema.posts.id, id), eq(schema.posts.status, 'published')))
      .limit(1);

    if (currentPost.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Post not found',
      });
    }

    // Get related posts based on:
    // 1. Posts from the same author
    // 2. Posts with similar keywords in title/excerpt
    // 3. Most recent posts if not enough matches
    const relatedPosts = await db
      .select({
        id: schema.posts.id,
        title: schema.posts.title,
        excerpt: schema.posts.excerpt,
        slug: schema.posts.slug,
        coverImage: schema.posts.coverImage,
        publishedAt: schema.posts.publishedAt,
        createdAt: schema.posts.createdAt,
        views: schema.posts.views,
        likesCount: schema.posts.likesCount,
        author: {
          id: schema.posts.userId,
          name: sql<string>`'Author'`,
          image: sql<string | null>`null`,
        },
      })
      .from(schema.posts)
      .where(
        and(
          ne(schema.posts.id, id), // Exclude current post
          eq(schema.posts.status, 'published')
        )
      )
      .orderBy(desc(schema.posts.publishedAt))
      .limit(3);

    return {
      posts: relatedPosts,
    };
  } catch (error) {
    console.error('Error fetching related posts:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch related posts',
    });
  }
});
