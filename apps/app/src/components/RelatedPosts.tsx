import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import { PostCard } from './posts/PostCard';
import { Heading } from './typography/Heading';
import type { PostListItem } from '@robin/types';

interface RelatedPostsProps {
  postId: string;
}

export function RelatedPosts({ postId }: RelatedPostsProps) {
  const { data, isLoading, isError } = useQuery<{ posts: PostListItem[] }>({
    queryKey: ['related-posts', postId],
    queryFn: () => api.get(`/posts/${postId}/related`),
    retry: 1,
  });

  // Don't show anything if there's an error
  if (isError) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-6 py-16 border-t border-white/10">
        <Heading level={2}>Related Posts</Heading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-xl bg-bg-elevated border border-white/[0.06]"
            >
              {/* Cover Image Skeleton */}
              <div className="w-full aspect-[16/9] shimmer" />

              {/* Content Skeleton */}
              <div className="p-6 flex flex-col gap-4">
                {/* Title Skeleton */}
                <div className="h-6 shimmer rounded" />

                {/* Excerpt Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 shimmer rounded" />
                  <div className="h-4 shimmer rounded w-3/4" />
                </div>

                {/* Metadata Skeleton */}
                <div className="pt-3 border-t border-white/[0.06] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full shimmer" />
                    <div className="h-4 w-20 shimmer rounded" />
                  </div>
                  <div className="flex gap-4">
                    <div className="h-4 w-8 shimmer rounded" />
                    <div className="h-4 w-8 shimmer rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const posts = data?.posts || [];

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 py-16 border-t border-white/10">
      <Heading level={2}>Related Posts</Heading>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
