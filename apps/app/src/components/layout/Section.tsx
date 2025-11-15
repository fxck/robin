import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface SectionProps {
  children: ReactNode;
  className?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function Section({
  children,
  className,
  spacing = 'lg'
}: SectionProps) {
  return (
    <section
      className={cn(
        spacing === 'sm' && 'py-8',
        spacing === 'md' && 'py-12',
        spacing === 'lg' && 'py-16 md:py-24',
        spacing === 'xl' && 'py-24 md:py-32',
        spacing === 'none' && 'py-0',
        className
      )}
    >
      {children}
    </section>
  );
}
