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
    // Intersection Observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 1.0,
      }
    );

    // Observe all headings
    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
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
      const top = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="hidden xl:block fixed right-8 top-32 w-64 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="glass-surface p-6 rounded-2xl">
        <Text size="2" weight="bold" className="block mb-4 text-gray-400 uppercase tracking-wide">
          On This Page
        </Text>

        <nav className="space-y-2">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => handleClick(heading.id)}
              className={`
                block w-full text-left py-1.5 px-3 rounded-lg transition-all text-sm
                ${heading.level === 2 ? 'pl-3' : ''}
                ${heading.level === 3 ? 'pl-6' : ''}
                ${
                  activeId === heading.id
                    ? 'bg-purple-500/20 text-purple-400 border-l-2 border-purple-500'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-white/5 border-l-2 border-transparent'
                }
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
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
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
