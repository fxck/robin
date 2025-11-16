import { useEffect, useState } from 'react';
import { Text } from '@radix-ui/themes';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Extract headings from markdown content
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const extractedHeadings: Heading[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2];
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

      extractedHeadings.push({ id, text, level });
    }

    setHeadings(extractedHeadings);
  }, [content]);

  useEffect(() => {
    // Intersection Observer for active heading with improved settings
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry that's most visible
        let mostVisibleEntry = entries[0];
        let maxRatio = 0;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisibleEntry = entry;
          }
        });

        if (mostVisibleEntry && mostVisibleEntry.isIntersecting) {
          setActiveId(mostVisibleEntry.target.id);
        }
      },
      {
        // Track headings in the top 30% of viewport
        rootMargin: '-10% 0px -70% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
      }
    );

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      headings.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) {
          observer.observe(element);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [headings]);

  useEffect(() => {
    // Update scroll progress on scroll
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
      setScrollProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    // Set initial value
    updateScrollProgress();

    // Listen to scroll events
    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
    };
  }, []);

  if (headings.length === 0) {
    return null;
  }

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Set active immediately for instant feedback
      setActiveId(id);

      // Calculate position with offset for header/padding
      const top = element.getBoundingClientRect().top + window.scrollY - 120;

      // Smooth scroll to element
      window.scrollTo({
        top,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="hidden xl:block fixed right-8 top-32 w-64 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="glass-surface p-6 rounded-2xl">
        <Text size="2" weight="bold" className="block mb-4 text-gray-400 uppercase tracking-wide">
          On This Page
        </Text>

        <nav className="space-y-1">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => handleClick(heading.id)}
              className={`
                block w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm
                ${heading.level === 2 ? 'pl-3' : ''}
                ${heading.level === 3 ? 'pl-6' : ''}
                ${
                  activeId === heading.id
                    ? 'bg-amber-500/20 text-amber-400 font-medium border-l-2 border-amber-500 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/10 border-l-2 border-transparent hover:border-gray-600'
                }
                cursor-pointer
              `}
            >
              {heading.text}
            </button>
          ))}
        </nav>
      </div>

      {/* Scroll Progress */}
      <div className="glass-surface p-4 rounded-2xl mt-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
              style={{
                width: `${scrollProgress}%`,
              }}
            ></div>
          </div>
          <Text size="1" className="text-gray-400 font-mono">
            {Math.round(scrollProgress)}%
          </Text>
        </div>
      </div>
    </div>
  );
}
