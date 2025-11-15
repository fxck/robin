import { type ReactNode, type CSSProperties } from 'react';
import { cn } from '../../lib/utils';

interface FlexProps {
  children: ReactNode;
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  gap?: '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12';
  className?: string;
  style?: CSSProperties;
}

export function Flex({
  children,
  direction = 'row',
  align = 'start',
  justify = 'start',
  wrap = 'nowrap',
  gap,
  className,
  style
}: FlexProps) {
  return (
    <div
      className={cn(
        'flex',
        direction === 'row' && 'flex-row',
        direction === 'col' && 'flex-col',
        direction === 'row-reverse' && 'flex-row-reverse',
        direction === 'col-reverse' && 'flex-col-reverse',

        align === 'start' && 'items-start',
        align === 'center' && 'items-center',
        align === 'end' && 'items-end',
        align === 'stretch' && 'items-stretch',
        align === 'baseline' && 'items-baseline',

        justify === 'start' && 'justify-start',
        justify === 'center' && 'justify-center',
        justify === 'end' && 'justify-end',
        justify === 'between' && 'justify-between',
        justify === 'around' && 'justify-around',
        justify === 'evenly' && 'justify-evenly',

        wrap === 'wrap' && 'flex-wrap',
        wrap === 'nowrap' && 'flex-nowrap',
        wrap === 'wrap-reverse' && 'flex-wrap-reverse',

        gap && `gap-${gap}`,

        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
