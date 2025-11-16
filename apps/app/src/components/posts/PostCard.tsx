import { Link } from '@tanstack/react-router';
import { Heart, Eye } from 'lucide-react';
import type { PostListItem } from '@robin/types';
import { Image } from '../image';
import { Heading } from '../typography/Heading';
import { Text } from '../typography/Text';
import { Flex } from '../layout/Flex';
import { cn } from '../../lib/utils';
import { Avatar } from '@radix-ui/themes';

interface PostCardProps {
  post: PostListItem;
}

export function PostCard({ post }: PostCardProps) {
  const excerpt = post.excerpt || '';

  return (
    <Link
      to="/posts/$id"
      params={{ id: post.id }}
      className="block group no-underline"
    >
      <article className={cn(
        'post-card card-shine',
        'relative overflow-hidden rounded-2xl',
        'bg-bg-elevated border border-white/5',
        'transition-all duration-500 ease-out',
        'hover:-translate-y-2',
        'hover:border-amber-500/30',
        'hover:shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(245,158,11,0.1),0_0_50px_rgba(245,158,11,0.2)]',
        'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-amber-500/5 before:via-transparent before:to-blue-500/5 before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100'
      )}>
        {/* Cover Image */}
        <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-bg-hover to-bg-overlay">
          <Image
            src={post.coverImageThumb || post.coverImage}
            alt={post.title}
            placeholder="gradient"
            placeholderText={post.title}
            aspectRatio={16 / 9}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
          />
          {/* Gradient overlay: transparent to black */}
          <div className={cn(
            'absolute inset-0',
            'bg-gradient-to-b from-transparent to-black',
            'pointer-events-none'
          )} />
          {/* Extended gradient below cover: black to transparent */}
          <div className={cn(
            'absolute left-0 right-0 h-[100px] -bottom-[100px]',
            'bg-gradient-to-b from-black to-transparent',
            'pointer-events-none'
          )} />
          {/* Shimmer effect on image */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-x-[-100%] group-hover:translate-x-[100%] group-hover:transition-transform group-hover:duration-1000 pointer-events-none" />
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 relative z-10">
          {/* Title */}
          <Heading
            level={3}
            className={cn(
              'transition-all duration-300',
              'group-hover:text-amber-400',
              'group-hover:translate-x-1'
            )}
          >
            {post.title}
          </Heading>

          {/* Excerpt */}
          {excerpt && (
            <Text
              size="base"
              color="secondary"
              className="line-clamp-2 transition-colors duration-300 group-hover:text-gray-300"
            >
              {excerpt}
            </Text>
          )}

          {/* Metadata */}
          <div className="pt-3 border-t border-white/5 group-hover:border-white/10 transition-colors duration-300">
            <Flex align="center" justify="between">
              {/* Author */}
              <Flex align="center" gap="2">
                <div className="transition-transform duration-300 group-hover:scale-110">
                  <Avatar
                    size="1"
                    src={post.author?.image || undefined}
                    fallback={post.author?.name?.[0] || 'A'}
                    radius="full"
                  />
                </div>
                <Text size="sm" color="secondary" className="transition-colors duration-300 group-hover:text-gray-200">
                  {post.author?.name}
                </Text>
              </Flex>

              {/* Stats */}
              <Flex align="center" gap="4">
                <Flex align="center" gap="3">
                  <Heart size={14} className="text-text-tertiary transition-all duration-300 group-hover:text-amber-400 group-hover:scale-110" />
                  <Text size="xs" color="tertiary" className="transition-colors duration-300 group-hover:text-gray-300">
                    {post.likesCount || 0}
                  </Text>
                </Flex>
                <Flex align="center" gap="3">
                  <Eye size={14} className="text-text-tertiary transition-all duration-300 group-hover:text-amber-400 group-hover:scale-110" />
                  <Text size="xs" color="tertiary" className="transition-colors duration-300 group-hover:text-gray-300">
                    {post.views || 0}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </div>
        </div>
      </article>
    </Link>
  );
}
