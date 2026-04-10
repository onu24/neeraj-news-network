'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: 0 | 100 | 200 | 300 | 400;
  baseClass?: 'reveal-base' | 'reveal-blur';
}

export function ScrollReveal({ 
  children, 
  className = '', 
  delay = 0,
  baseClass = 'reveal-base'
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Safety check for SSR or environments without IntersectionObserver
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Once visible, trigger animation and disconnect (only animate once)
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: '0px 0px -50px 0px', // Trigger slightly before it comes fully into view
        threshold: 0.1,
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Construct classstring based on state
  const visibilityClass = isVisible ? 'reveal-visible' : '';
  const delayClass = delay > 0 ? `reveal-delay-${delay}` : '';

  return (
    <div 
      ref={ref} 
      className={`${baseClass} ${visibilityClass} ${delayClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
