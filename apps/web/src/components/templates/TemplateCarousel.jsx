import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import TemplateCard from './TemplateCard.jsx';

export default function TemplateCarousel({ collection, onPreview, onUse }) {
  const scrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ left: false, right: false });

  const updateScrollState = useCallback(() => {
    const container = scrollRef.current;
    if (!container) {
      setScrollState({ left: false, right: false });
      return;
    }
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setScrollState({
      left: scrollLeft > 16,
      right: scrollLeft + clientWidth < scrollWidth - 16
    });
  }, []);

  const scrollByDirection = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    const offset = direction * container.clientWidth * 0.8;
    container.scrollBy({ left: offset, behavior: 'smooth' });
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return undefined;
    updateScrollState();
    container.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    return () => {
      container.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        aria-label={`${collection.title} templates (horizontal scroll)`}
      >
        {collection.templates.map((template) => (
          <div key={template.id} className="w-[85%] min-w-[280px] snap-start sm:w-[48%] xl:w-[32%]">
            <TemplateCard
              template={{ ...template, collectionTitle: collection.title }}
              onPreview={onPreview}
              onUse={onUse}
            />
          </div>
        ))}
      </div>
      {scrollState.left ? (
        <button
          type="button"
          className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border/60 bg-background/90 p-2 shadow-lg sm:inline-flex"
          onClick={() => scrollByDirection(-1)}
          aria-label={`Scroll ${collection.title} templates left`}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
      ) : null}
      {scrollState.right ? (
        <button
          type="button"
          className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border/60 bg-background/90 p-2 shadow-lg sm:inline-flex"
          onClick={() => scrollByDirection(1)}
          aria-label={`Scroll ${collection.title} templates right`}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      ) : null}
      <div className="mt-2 text-center text-xs text-muted-foreground sm:hidden">
        Swipe to explore more templates
      </div>
    </div>
  );
}

