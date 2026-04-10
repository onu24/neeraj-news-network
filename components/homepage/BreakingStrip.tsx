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
  
  // Use articles from props
  const items = articles;

  const getDisplayTitle = (news: NewsArticle) => {
    return (language === 'hi' && news.title_hi) ? news.title_hi : (news.headline || news.title);
  };

  return (
    <div className="bg-background border-b-2 border-primary overflow-hidden relative flex h-10 w-full">
      <div className="bg-primary text-primary-foreground font-bold px-3 md:px-6 py-2.5 text-xs tracking-wider uppercase flex items-center whitespace-nowrap z-10 shadow-[4px_0_8px_rgba(0,0,0,0.1)] shrink-0">
        <span className="mr-2 h-2 w-2 rounded-full bg-white animate-pulse"></span>
        {t('breaking')}
      </div>

      <div className="flex-1 overflow-hidden relative flex items-center bg-secondary/30">
        <div
          ref={scrollRef}
          className="flex animate-ticker-seamless whitespace-nowrap w-max hover:[animation-play-state:paused] items-center"
        >
          {/* First set */}
          {items.map((news, index) => (
            <div key={news.id} className="flex items-center">
              {index > 0 && (
                <span className="text-primary/40 mx-1">•</span>
              )}
              <Link
                href={`/article/${news.slug}`}
                className={`text-sm font-medium text-foreground hover:text-primary transition-colors px-5 ${language === 'hi' ? 'font-hindi' : ''}`}
              >
                {getDisplayTitle(news)}
              </Link>
            </div>
          ))}

          {/* Spacer bullet between sets */}
          <span className="text-primary/40 mx-1">•</span>

          {/* Cloned second set for seamless wrap-around */}
          {items.map((news, index) => (
            <div key={`clone-${news.id}`} className="flex items-center">
              {index > 0 && (
                <span className="text-primary/40 mx-1">•</span>
              )}
              <Link
                href={`/article/${news.slug}`}
                className={`text-sm font-medium text-foreground hover:text-primary transition-colors px-5 ${language === 'hi' ? 'font-hindi' : ''}`}
              >
                {getDisplayTitle(news)}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
