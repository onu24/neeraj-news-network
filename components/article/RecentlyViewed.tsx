'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NewsArticle } from '@/lib/types';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface RecentlyViewedProps {
  currentArticle?: NewsArticle;
}

export function RecentlyViewed({ currentArticle }: RecentlyViewedProps) {
  const [history, setHistory] = useState<NewsArticle[]>([]);
  const { language, t } = useLanguage();

  useEffect(() => {
    if (!currentArticle) return;

    const storageKey = 'drishyam_reading_history';
    const rawHistory = localStorage.getItem(storageKey);
    let historyData: NewsArticle[] = rawHistory ? JSON.parse(rawHistory) : [];

    // Add current article to history, remove duplicates, limit to 6
    const updatedHistory = [
      currentArticle,
      ...historyData.filter(a => a.id !== currentArticle.id)
    ].slice(0, 6);

    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
    
    // Set history excluding current article for display
    setHistory(updatedHistory.filter(a => a.id !== currentArticle.id).slice(0, 4));
  }, [currentArticle]);

  if (history.length === 0) return null;

  return (
    <div className="py-10 border-t border-zinc-100 mt-10">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-3">
        <span className="w-6 h-[2px] bg-primary" />
        {t('recently_viewed') || (language === 'hi' ? 'हाल ही में देखा गया' : 'Recently Viewed')}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {history.map((article) => {
          const title = (language === 'hi' && article.title_hi) ? article.title_hi : article.title;
          return (
            <Link 
              key={article.id} 
              href={`/article/${article.slug}`}
              className="group block"
            >
              <div className="relative aspect-video mb-2 overflow-hidden bg-zinc-100 rounded-sm">
                {article.coverImage && (
                  <Image
                    src={article.coverImage}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
              <h4 className={`text-xs font-bold line-clamp-2 group-hover:text-primary transition-colors ${language === 'hi' ? 'font-hindi' : 'font-serif'}`}>
                {title}
              </h4>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
