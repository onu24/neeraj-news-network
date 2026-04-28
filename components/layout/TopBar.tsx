'use client';

import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { motion, AnimatePresence } from 'framer-motion';

export function TopBar() {
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={`bg-secondary/50 border-b border-border py-1.5 px-3 sm:px-4 text-[11px] sm:text-xs font-medium text-muted-foreground w-full z-50 sticky top-0 md:relative backdrop-blur-md transition-transform duration-500 ease-in-out ${scrolled ? 'translate-y-[-100%] md:translate-y-0' : 'translate-y-0'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-end sm:justify-between gap-3">
        {/* Date */}
        <div className="tracking-wide hidden sm:block font-serif italic">{mounted ? dateStr : ''}</div>

        {/* Right side controls */}
        <div className="flex items-center gap-4 sm:gap-6 ml-auto">
          {/* Language Switcher - Premium Layout-ID Style */}
          <div className="relative flex items-center bg-secondary dark:bg-zinc-900 border border-border/40 rounded-full p-1 shadow-inner">
            <button
              onClick={() => setLanguage('en')}
              suppressHydrationWarning
              className={`relative h-6 px-3 flex items-center justify-center transition-colors duration-300 ${
                language === 'en' ? 'text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {language === 'en' && (
                <motion.div
                  layoutId="lang-active"
                  className="absolute inset-0 bg-primary rounded-full shadow-lg shadow-primary/30 z-0"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 text-[10px] font-black tracking-tighter">EN</span>
            </button>

            <button
              onClick={() => setLanguage('hi')}
              suppressHydrationWarning
              className={`relative h-6 px-4 flex items-center justify-center transition-colors duration-300 ${
                language === 'hi' ? 'text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {language === 'hi' && (
                <motion.div
                  layoutId="lang-active"
                  className="absolute inset-0 bg-primary rounded-full shadow-lg shadow-primary/30 z-0"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 text-[12px] font-hindi font-bold">हिन्दी</span>
            </button>
          </div>

          {/* Auth Links */}
          <div className="flex items-center gap-4 border-l border-border/40 pl-4">
            <a 
              href="/admin/login" 
              className="hover:text-primary transition-colors font-bold uppercase tracking-widest text-[9px] sm:text-[10px]"
            >
              Admin Portal
            </a>
          </div>

          {/* Theme Toggle */}
          <div className="relative h-8 w-8">
            <AnimatePresence mode="wait" initial={false}>
              {mounted && (
                <motion.button
                  key={theme}
                  initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  suppressHydrationWarning
                  className="absolute inset-0 inline-flex items-center justify-center rounded-full border border-border/50 bg-secondary/80 dark:bg-zinc-900/80 backdrop-blur-md hover:text-primary hover:border-primary/30 transition-all shadow-sm active:scale-90"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

