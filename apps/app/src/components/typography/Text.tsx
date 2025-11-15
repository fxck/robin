import { type ReactNode, type ElementType } from 'react';
import { cn } from '../../lib/utils';

interface TextProps {
  as?: ElementType;
  size?: 'lg' | 'base' | 'sm' | 'xs';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  variant?: 'serif' | 'sans' | 'mono';
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'inverse';
  children: ReactNode;
  className?: string;
}

export function Text({
  as: Component = 'span',
  size = 'base',
  weight = 'normal',
  variant = 'sans',
  color = 'primary',
  children,
  className,
}: TextProps) {
  return (
    <Component
      className={cn(
        // Font family
        variant === 'serif' && 'font-serif',
        variant === 'sans' && 'font-sans',
        variant === 'mono' && 'font-mono',

        // Size
        size === 'lg' && 'text-body-lg leading-body-lg',
        size === 'base' && 'text-body leading-body',
        size === 'sm' && 'text-body-sm leading-body-sm tracking-body-sm',
        size === 'xs' && 'text-caption leading-caption tracking-caption',

        // Weight
        weight === 'medium' && 'font-medium',
        weight === 'semibold' && 'font-semibold',
        weight === 'bold' && 'font-bold',

        // Color
        color === 'primary' && 'text-text-primary',
        color === 'secondary' && 'text-text-secondary',
        color === 'tertiary' && 'text-text-tertiary',
        color === 'accent' && 'text-accent-400',
        color === 'inverse' && 'text-text-inverse',

        className
      )}
    >
      {children}
    </Component>
  );
}
