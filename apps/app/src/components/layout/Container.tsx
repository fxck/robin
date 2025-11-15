import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ContainerProps {
  size?: 'full' | 'wide' | 'standard' | 'reading' | 'narrow';
  children: ReactNode;
  className?: string;
}

export function Container({
  size = 'standard',
  children,
  className
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto px-5 md:px-8',
        size === 'wide' && 'max-w-[1400px]',
        size === 'standard' && 'max-w-[1200px]',
        size === 'reading' && 'max-w-reading',
        size === 'narrow' && 'max-w-narrow',
        size === 'full' && 'max-w-none',
        className
      )}
    >
      {children}
    </div>
  );
}
