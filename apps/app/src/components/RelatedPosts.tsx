import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import { PostCard } from './posts/PostCard';
import { Heading } from './typography/Heading';
import type { PostListItem } from '@robin/types';

interface RelatedPostsProps {
  postId: string;
}

export function RelatedPosts({ postId }: RelatedPostsProps) {
  const { data, isLoading } = useQuery<{ posts: PostListItem[] }>({
    queryKey: ['related-posts', postId],
    queryFn: () => api.get(`/posts/${postId}/related`),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 py-16 border-t border-white/10">
        <Heading level={2}>Related Posts</Heading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 rounded-2xl shimmer overflow-hidden" />
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
