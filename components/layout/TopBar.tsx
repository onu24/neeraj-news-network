'use client';

import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-secondary/50 border-b border-border py-1.5 px-3 sm:px-4 text-[11px] sm:text-xs font-medium text-muted-foreground w-full z-50 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-end sm:justify-between gap-3">
        {/* Date */}
        <div className="tracking-wide hidden sm:block">{mounted ? dateStr : ''}</div>

        {/* Right side controls */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          {/* Language Switcher */}
          <div className="flex items-center gap-2 bg-background/70 border border-border rounded-full px-2.5 py-1">
            <button
              onClick={() => setLanguage('en')}
              suppressHydrationWarning
              className={`hover:text-foreground transition-colors leading-none ${
                language === 'en' ? 'text-foreground font-bold underline decoration-primary underline-offset-4' : ''
              }`}
            >
              EN
            </button>
            <span className="text-border">|</span>
            <button
              onClick={() => setLanguage('hi')}
              suppressHydrationWarning
              className={`font-hindi hover:text-foreground transition-colors leading-none ${
                language === 'hi' ? 'text-foreground font-bold underline decoration-primary underline-offset-4' : 'font-medium'
              }`}
            >
              {'\u0939\u093f\u0902\u0926\u0940'}
            </button>
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-border bg-background/70 hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
