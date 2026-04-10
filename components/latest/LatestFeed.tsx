'use client';

import { ArticleCard } from '@/components/homepage/ArticleCard';
import { AdContainer } from '@/components/AdContainer';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { NewsArticle } from '@/lib/types';

interface LatestFeedProps {
  articles: NewsArticle[];
}

export function LatestFeed({ articles }: LatestFeedProps) {
  const { language, t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      
      {/* Header */}
      <div className="mb-8 pb-4 border-b-2 border-primary/20">
        <h1 className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-bold flex items-center ${language === 'hi' ? 'font-hindi' : ''}`}>
          <Clock className="mr-3 h-8 w-8 text-primary" />
          {t('latest_updates')}
        </h1>
        <p className={`mt-3 text-lg text-muted-foreground ${language === 'hi' ? 'font-hindi' : ''}`}>
          {t('newsletter_intro')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
        
        {/* Main Chronological Feed (3 Columns on Large Screens) */}
        <div className="lg:col-span-3 space-y-6">
          {articles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('no_results')}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {articles.map((article, index) => (
                <div key={article.id} className="bg-background border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
                  <ArticleCard article={article} variant="compact" />
                  
                  {/* Optional In-Feed Ad every 5 items */}
                  {index > 0 && index % 5 === 0 && (
                    <div className="mt-6 mb-2 border-t border-border/50 pt-4">
                      <AdContainer slot={`latest_infeed_${index}`} format="fluid" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Right Sidebar for Ads & Trending */}
        <aside className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-border pt-8 lg:pt-0 lg:pl-8">
          <div className="sticky top-6 space-y-8">
            
            {/* Advertisement Container block */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4 border-l-2 border-primary pl-2">
                Sponsored
              </h4>
              <AdContainer 
                slot="latest_sidebar" 
                format="rectangle" 
                className="min-h-[300px] bg-secondary/30 flex items-center justify-center p-2" 
              />
            </div>

            {/* Trending Mini-widget */}
            <div className="bg-background border border-border p-5 rounded-sm shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                Trending Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Budget 2026', 'Elections', 'Sensex', 'IPL', 'ISRO'].map(tag => (
                  <Link 
                    key={tag} 
                    href={`/search?q=${tag}`} 
                    className="text-xs font-semibold bg-secondary/50 hover:bg-primary hover:text-white transition-colors px-3 py-1.5 rounded-sm"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </aside>
        
      </div>
    </div>
  );
}
