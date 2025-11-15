import { useState, useEffect, CSSProperties } from 'react';
import { Box } from '@radix-ui/themes';
import { ImageIcon } from 'lucide-react';
import {
  generateGradientPlaceholder,
  generateInitialsPlaceholder,
  generateIconPlaceholder,
  getSkeletonPlaceholder,
} from '../utils/image-placeholder';

export interface ImageProps {
  /** Image source URL */
  src?: string | null;
  /** Alt text for accessibility */
  alt: string;
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Aspect ratio for placeholder (e.g., 16/9, 1, 4/3) */
  aspectRatio?: number;
  /** Placeholder type */
  placeholder?: 'gradient' | 'initials' | 'icon' | 'skeleton' | 'none';
  /** Text for initials placeholder (e.g., user name, post title) */
  placeholderText?: string;
  /** Icon type for icon placeholder */
  placeholderIcon?: 'image' | 'user' | 'file';
  /** Callback when image loads successfully */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
  /** Object fit style */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

/**
 * Enhanced Image component with automatic placeholders and loading states
 *
 * Features:
 * - Automatic gradient placeholders
 * - Initials-based avatars
 * - Icon placeholders
 * - Skeleton loading states
 * - Graceful error handling
 * - Smooth fade-in transitions
 */
export function Image({
  src,
  alt,
  className,
  style,
  aspectRatio = 16 / 9,
  placeholder = 'gradient',
  placeholderText,
  placeholderIcon = 'image',
  onLoad,
  onError,
  objectFit = 'cover',
}: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);

  // Reset state when src changes
  useEffect(() => {
    if (src) {
      setIsLoading(true);
      setHasError(false);
      setImageSrc(src);
    } else {
      setIsLoading(false);
      setHasError(true);
      setImageSrc(undefined);
    }
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Generate placeholder based on type
  const getPlaceholder = (): string => {
    if (placeholder === 'none') return '';

    const seed = placeholderText || alt || 'default';

    switch (placeholder) {
      case 'initials':
        return generateInitialsPlaceholder(seed);
      case 'icon':
        return generateIconPlaceholder(placeholderIcon);
      case 'skeleton':
        return getSkeletonPlaceholder(aspectRatio);
      case 'gradient':
      default:
        return ''; // Will use CSS gradient background
    }
  };

  const placeholderUrl = getPlaceholder();
  const shouldShowPlaceholder = !imageSrc || isLoading || hasError;

  return (
    <Box
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'var(--gray-3)',
        ...style,
      }}
    >
      {/* Placeholder */}
      {shouldShowPlaceholder && (
        <Box
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              placeholder === 'gradient'
                ? generateGradientPlaceholder(placeholderText || alt || 'default')
                : placeholderUrl
                ? `url(${placeholderUrl})`
                : 'var(--gray-4)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Icon overlay for gradient placeholders without content */}
          {placeholder === 'gradient' && !placeholderUrl && (
            <ImageIcon
              size={48}
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
              }}
            />
          )}

          {/* Loading shimmer animation */}
          {isLoading && !hasError && (
            <Box
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                animation: 'shimmer 2s infinite',
              }}
            />
          )}
        </Box>
      )}

      {/* Actual Image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit,
            display: 'block',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      )}

      {/* Inject shimmer animation keyframes */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </Box>
  );
}

/**
 * Avatar component - specialized Image for user avatars
 */
export interface AvatarProps extends Omit<ImageProps, 'placeholder' | 'aspectRatio'> {
  /** User name for initials */
  name?: string;
  /** Avatar size */
  size?: 'small' | 'medium' | 'large' | number;
}

export function Avatar({ name, size = 'medium', style, ...props }: AvatarProps) {
  const sizeMap = {
    small: 32,
    medium: 48,
    large: 64,
  };

  const sizeValue = typeof size === 'number' ? size : sizeMap[size];

  return (
    <Image
      {...props}
      placeholder="initials"
      placeholderText={name || props.alt}
      aspectRatio={1}
      objectFit="cover"
      style={{
        width: sizeValue,
        height: sizeValue,
        borderRadius: '50%',
        ...style,
      }}
    />
  );
}
