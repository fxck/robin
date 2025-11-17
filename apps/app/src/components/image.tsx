import { useState, useEffect, CSSProperties } from 'react';
import { Box } from '@radix-ui/themes';
import {
  generateInitialsPlaceholder,
  generateIconPlaceholder,
  getSkeletonPlaceholder,
  generateAbstractBubblePlaceholder,
  generateTinyBlurPlaceholder,
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
  placeholder?: 'blur' | 'initials' | 'icon' | 'skeleton' | 'bubbles' | 'none';
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
 * Enhanced Image component with blur-up placeholders and loading states
 *
 * Features:
 * - Blur-up technique for existing images (tiny blurred preview → full image)
 * - Abstract blurry bubbles for non-existing images
 * - Initials-based avatars
 * - Icon placeholders
 * - Skeleton loading states
 * - Graceful error handling
 * - Extremely smooth transitions
 */
export function Image({
  src,
  alt,
  className,
  style,
  aspectRatio = 16 / 9,
  placeholder = 'blur',
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
      case 'blur':
        // If we have an image, show tiny blurred preview, otherwise show bubbles
        return src && !hasError
          ? generateTinyBlurPlaceholder(seed, aspectRatio)
          : generateAbstractBubblePlaceholder(seed, aspectRatio);
      case 'bubbles':
        return generateAbstractBubblePlaceholder(seed, aspectRatio);
      case 'initials':
        return generateInitialsPlaceholder(seed);
      case 'icon':
        return generateIconPlaceholder(placeholderIcon);
      case 'skeleton':
        return getSkeletonPlaceholder(aspectRatio);
      default:
        return generateTinyBlurPlaceholder(seed, aspectRatio);
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
        backgroundColor: '#1a1a1a',
        ...style,
      }}
    >
      {/* Blur-up Placeholder - shown underneath the image */}
      {placeholderUrl && (
        <Box
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${placeholderUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
            transform: 'scale(1.1)', // Scale up slightly to hide blur edges
            opacity: shouldShowPlaceholder || isLoading ? 1 : 0,
            transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      )}

      {/* Actual Image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            objectFit,
            display: 'block',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1,
          }}
        />
      )}
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
