import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Heading, Text, Flex } from '@radix-ui/themes';
import { api } from '../lib/api-client';
import { Eye, Heart, Clock } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  readTime: number | null;
  views: number;
  likesCount: number;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface RelatedPostsProps {
  postId: string;
}

export function RelatedPosts({ postId }: RelatedPostsProps) {
  const { data, isLoading } = useQuery<{ posts: Post[] }>({
    queryKey: ['related-posts', postId],
    queryFn: () => api.get(`/api/posts/${postId}/related`),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Heading size="6">Related Posts</Heading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-surface p-6 rounded-2xl animate-pulse">
              <div className="shimmer w-full h-48 rounded-lg mb-4"></div>
              <div className="shimmer w-3/4 h-6 rounded mb-2"></div>
              <div className="shimmer w-full h-4 rounded"></div>
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
      <Heading size="6" className="text-gray-200">
        Related Posts
      </Heading>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            to="/posts/$id"
            params={{ id: post.id }}
            className="group block"
          >
            <article className="glass-surface rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
              {/* Cover Image */}
              {post.coverImageUrl && (
                <div className="relative w-full aspect-video overflow-hidden bg-gradient-to-br from-amber-500/10 to-blue-500/10">
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
              )}

              {/* Content */}
              <div className="p-6 space-y-3">
                <Heading size="4" className="group-hover:text-amber-400 transition-colors line-clamp-2">
                  {post.title}
                </Heading>

                {post.excerpt && (
                  <Text size="2" color="gray" className="line-clamp-2">
                    {post.excerpt}
                  </Text>
                )}

                {/* Meta */}
                <Flex gap="4" align="center" className="pt-2 text-gray-500 text-sm">
                  {post.readTime && (
                    <Flex gap="1" align="center">
                      <Clock size={14} />
                      <Text size="1">{post.readTime} min</Text>
                    </Flex>
                  )}
                  <Flex gap="1" align="center">
                    <Eye size={14} />
                    <Text size="1">{post.views}</Text>
                  </Flex>
                  <Flex gap="1" align="center">
                    <Heart size={14} />
                    <Text size="1">{post.likesCount}</Text>
                  </Flex>
                </Flex>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
