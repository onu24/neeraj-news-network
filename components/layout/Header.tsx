'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { SearchInput } from './SearchInput';
import { NotificationBell } from './NotificationBell';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { language, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      suppressHydrationWarning
      className={`sticky ${scrolled ? 'top-0' : 'top-[36px]'} md:top-0 z-40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled
          ? 'bg-background shadow-lg shadow-black/5 dark:shadow-white/5 border-b border-border/50'
          : 'bg-background border-b border-border'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled ? 'h-24 sm:h-24' : 'h-24 sm:h-32'
          }`}>

          {/* Logo Main Segment */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 group py-2">
            <div className="flex flex-col items-center relative text-center">
              <h1 className={`font-serif text-5xl sm:text-7xl font-black text-primary tracking-tight leading-none group-hover:scale-[1.02] transition-transform duration-300 ${language === 'hi' ? 'font-hindi-serif' : ''}`}>
                Drishyam
              </h1>
              <div className={`flex items-center gap-2 w-full justify-center transition-all duration-300 ${language === 'hi' ? '-mt-1.5' : 'mt-0.5'}`}>
                {language !== 'hi' && <span className="h-[1px] w-4 sm:w-6 bg-border/60" />}
                <p className={`text-[10px] sm:text-[12px] font-bold text-muted-foreground tracking-[0.25em] sm:tracking-[0.3em] uppercase whitespace-nowrap leading-none ${language === 'hi' ? 'font-hindi tracking-normal text-xs sm:text-sm text-primary font-black' : ''}`}>
                  {t('news_analysis')}
                </p>
                {language !== 'hi' && <span className="h-[1px] w-4 sm:w-6 bg-border/60" />}
              </div>
            </div>
          </Link>

          {/* Right Actions Segment */}
          <div className="flex items-center gap-3 lg:gap-6 flex-1 justify-end max-w-xl">
            <div className="hidden md:block w-full max-w-xs lg:max-w-md">
              <SearchInput />
            </div>

            <button
              aria-label="Search"
              suppressHydrationWarning
              className="md:hidden text-foreground/70 hover:text-primary transition-all p-2.5 bg-secondary/50 rounded-full active:scale-90"
            >
              <Search className="h-5 w-5" />
            </button>

            <NotificationBell />
          </div>
        </div>
      </div>
    </header>
  );
}
