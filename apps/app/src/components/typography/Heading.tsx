import { type ReactNode, type CSSProperties } from 'react';
import { cn } from '../../lib/utils';

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div';
  variant?: 'display' | 'default';
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Heading({
  level,
  as,
  variant = 'default',
  children,
  className,
  style
}: HeadingProps) {
  const Component = as || (`h${level}` as const);

  return (
    <Component
      className={cn(
        'font-serif font-bold text-text-primary',
        level === 1 && 'text-h1 leading-h1 tracking-h1',
        level === 2 && 'text-h2 leading-h2 tracking-h2',
        level === 3 && 'text-h3 leading-h3 tracking-h3',
        level === 4 && 'text-xl leading-tight',
        level === 5 && 'text-lg leading-tight',
        level === 6 && 'text-base leading-tight',
        variant === 'display' && 'text-display leading-display tracking-display',
        className
      )}
      style={style}
    >
      {children}
    </Component>
  );
}
