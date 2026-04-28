'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
  slug: string;
}

export function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    // We use a small delay to ensure it's a real view and not just a bounce/pre-render
    const timer = setTimeout(() => {
      fetch(`/api/articles/${encodeURIComponent(slug)}/view`, {
        method: 'POST',
      }).catch((err) => console.error('[ViewTracker] Failed to log view:', err));
    }, 2000); // 2 second threshold

    return () => clearTimeout(timer);
  }, [slug]);

  return null; // This component doesn't render anything
}
