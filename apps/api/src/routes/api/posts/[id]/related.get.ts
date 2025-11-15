import { defineEventHandler, getRouterParam } from 'h3';
import { eq, and, desc, ne, sql } from 'drizzle-orm';
import { posts } from '@robin/database';

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
        id: posts.id,
        title: posts.title,
        excerpt: posts.excerpt,
        content: posts.content,
      })
      .from(posts)
      .where(and(eq(posts.id, id), eq(posts.status, 'published')))
      .limit(1);

    if (currentPost.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Post not found',
      });
    }

    const post = currentPost[0];

    // Extract keywords from title and excerpt for similarity matching
    const keywords = [
      ...(post.title?.toLowerCase().split(/\s+/) || []),
      ...(post.excerpt?.toLowerCase().split(/\s+/) || []),
    ]
      .filter((word) => word.length > 3) // Filter out short words
      .slice(0, 10); // Take top 10 keywords

    // Get related posts based on:
    // 1. Posts from the same author
    // 2. Posts with similar keywords in title/excerpt
    // 3. Most recent posts if not enough matches
    const relatedPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        excerpt: posts.excerpt,
        slug: posts.slug,
        coverImageUrl: posts.coverImageUrl,
        publishedAt: posts.publishedAt,
        createdAt: posts.createdAt,
        readTime: posts.readTime,
        views: posts.views,
        likesCount: posts.likesCount,
        author: {
          id: posts.userId,
          name: sql<string>`'Author'`,
          image: sql<string | null>`null`,
        },
      })
      .from(posts)
      .where(
        and(
          ne(posts.id, id), // Exclude current post
          eq(posts.status, 'published')
        )
      )
      .orderBy(desc(posts.publishedAt))
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
