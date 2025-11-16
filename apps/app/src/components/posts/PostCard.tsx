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
        'post-card',
        'relative overflow-hidden rounded-xl',
        'bg-bg-elevated border border-white/[0.06]',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1',
        'hover:border-white/[0.12]',
        'hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]'
      )}>
        {/* Cover Image */}
        <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-bg-hover to-bg-overlay overflow-hidden">
          <Image
            src={post.coverImageThumb || post.coverImage}
            alt={post.title}
            placeholder="gradient"
            placeholderText={post.title}
            aspectRatio={16 / 9}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 relative z-10">
          {/* Title */}
          <Heading
            level={3}
            className="transition-colors duration-200"
          >
            {post.title}
          </Heading>

          {/* Excerpt */}
          {excerpt && (
            <Text
              size="base"
              color="secondary"
              className="line-clamp-2"
            >
              {excerpt}
            </Text>
          )}

          {/* Metadata */}
          <div className="pt-3 border-t border-white/[0.06]">
            <Flex align="center" justify="between">
              {/* Author */}
              <Flex align="center" gap="2">
                <Avatar
                  size="1"
                  src={post.author?.image || undefined}
                  fallback={post.author?.name?.[0] || 'A'}
                  radius="full"
                />
                <Text size="sm" color="secondary">
                  {post.author?.name}
                </Text>
              </Flex>

              {/* Stats */}
              <Flex align="center" gap="4">
                <Flex align="center" gap="3">
                  <Heart size={14} className="text-text-tertiary" />
                  <Text size="xs" color="tertiary">
                    {post.likesCount || 0}
                  </Text>
                </Flex>
                <Flex align="center" gap="3">
                  <Eye size={14} className="text-text-tertiary" />
                  <Text size="xs" color="tertiary">
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
