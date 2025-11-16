import { useEffect, useState } from 'react';
import { Text } from '@radix-ui/themes';

interface Heading {
  id: string;
  text: string;
  level: number;
  element: HTMLElement;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Extract headings from the ACTUAL rendered DOM
    const extractHeadingsFromDOM = () => {
      const articleContent = document.getElementById('article-content');
      if (!articleContent) return;

      const headingElements = articleContent.querySelectorAll('h1, h2, h3');
      const extractedHeadings: Heading[] = [];

      headingElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        const id = htmlElement.id;
        const text = htmlElement.textContent || '';
        const level = parseInt(element.tagName.substring(1));

        if (id && text) {
          extractedHeadings.push({
            id,
            text,
            level,
            element: htmlElement,
          });
        }
      });

      setHeadings(extractedHeadings);
    };

    // Wait for ReactMarkdown to render
    const timeoutId = setTimeout(extractHeadingsFromDOM, 500);
    return () => clearTimeout(timeoutId);
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    // Set first heading as active initially
    if (!activeId && headings.length > 0) {
      setActiveId(headings[0].id);
    }

    // Intersection Observer for active heading tracking
    const observer = new IntersectionObserver(
      (entries) => {
        // Sort entries by their position in viewport
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);

        if (visibleEntries.length === 0) return;

        // Find the topmost visible heading
        let topMostEntry = visibleEntries[0];
        let minTop = Infinity;

        visibleEntries.forEach((entry) => {
          const rect = entry.boundingClientRect;
          if (rect.top < minTop && rect.top >= 0) {
            minTop = rect.top;
            topMostEntry = entry;
          }
        });

        if (topMostEntry) {
          setActiveId(topMostEntry.target.id);
        }
      },
      {
        // Track headings when they enter the top 20% of viewport
        rootMargin: '-20% 0px -75% 0px',
        threshold: [0, 0.1, 0.5, 1.0],
      }
    );

    // Observe all heading elements directly
    headings.forEach(({ element }) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [headings, activeId]);

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

  const handleClick = (heading: Heading) => {
    // Set active immediately for instant feedback
    setActiveId(heading.id);

    // Use the direct element reference for reliable scrolling
    const yOffset = -100; // Offset for fixed header/spacing
    const y = heading.element.getBoundingClientRect().top + window.pageYOffset + yOffset;

    window.scrollTo({
      top: y,
      behavior: 'smooth'
    });
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
              onClick={() => handleClick(heading)}
              className={`
                block w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm
                ${heading.level === 1 ? 'pl-2 font-semibold' : ''}
                ${heading.level === 2 ? 'pl-4' : ''}
                ${heading.level === 3 ? 'pl-6 text-xs' : ''}
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
