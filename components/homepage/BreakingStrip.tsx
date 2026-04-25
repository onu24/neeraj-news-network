'use client';

import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';

import { NewsArticle } from '@/lib/types';

interface BreakingStripProps {
  articles: NewsArticle[];
}

import { useLanguage } from '@/components/providers/LanguageProvider';

export function BreakingStrip({ articles }: BreakingStripProps) {
  const { language, t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const items = articles;

  const getDisplayTitle = (news: NewsArticle) => {
    return (language === 'hi' && news.title_hi) ? news.title_hi : (news.headline || news.title);
  };

  return (
    <div className={`bg-background dark:bg-zinc-950 border-b border-primary/20 overflow-hidden sticky md:relative z-30 flex h-10 md:h-12 w-full shadow-sm group/ticker transition-all duration-500 ${
      scrolled ? 'top-[96px] md:top-auto' : 'top-[132px] md:top-auto'
    }`}>
      {/* Dynamic Breaking Badge */}
      <div className="relative bg-gradient-to-br from-primary via-[#d41f16] to-[#af1912] text-white font-black px-4 md:px-10 py-2 md:py-2.5 text-[9px] md:text-[11px] tracking-[0.2em] md:tracking-[0.25em] uppercase flex items-center whitespace-nowrap z-30 shadow-[10px_0_25px_-5px_rgba(0,0,0,0.3)] shrink-0 italic overflow-hidden">
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/ticker:animate-[shimmer_2s_infinite] pointer-events-none" />
        
        <span className="mr-3 md:mr-4 flex h-2 md:h-2.5 w-2 md:w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 md:h-2.5 w-2 md:w-2.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
        </span>
        {t('breaking')}
      </div>

      <div className="flex-1 overflow-hidden relative flex items-center bg-secondary/10 backdrop-blur-sm">
        {/* Edge Fade Masks */}
        <div className="absolute inset-y-0 left-0 w-8 md:w-12 bg-gradient-to-r from-secondary/20 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />

        <div
          ref={scrollRef}
          className="flex animate-ticker-seamless whitespace-nowrap w-max hover:[animation-play-state:paused] items-center py-1"
        >
          {/* Loop items 3 times for super seamless feel */}
          {[...Array(3)].map((_, loopIdx) => (
            <div key={`loop-${loopIdx}`} className="flex items-center">
              {items.map((news) => (
                <div key={`${loopIdx}-${news.id}`} className="flex items-center">
                  <span className="text-primary/30 mx-1 md:mx-2 text-[10px] md:text-xs font-bold">//</span>
                  <Link
                    href={`/article/${news.slug}`}
                    className={`group/item flex items-center gap-1.5 md:gap-2 text-[11px] md:text-[13px] font-bold text-foreground/80 hover:text-primary transition-all px-2 md:px-4 ${language === 'hi' ? 'font-hindi text-sm md:text-base' : 'font-sans'}`}
                  >
                    <span className="hidden md:inline opacity-0 group-hover/item:opacity-100 transition-opacity text-primary -ml-4 mr-2">▶</span>
                    {getDisplayTitle(news)}
                    <span className="ml-1 md:ml-2 text-[8px] md:text-[9px] font-black bg-primary/10 text-primary px-1 md:px-1.5 py-0.5 rounded-sm opacity-60 group-hover/item:opacity-100 transition-all uppercase tracking-tighter">New</span>
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
