'use client';

import Link from 'next/link';
import { ArticleCard } from './ArticleCard';
import { NewsArticle } from '@/lib/types';
import { useLanguage } from '@/components/providers/LanguageProvider';

export type SectionVariant = 'feature' | 'grid' | 'minimal-list' | 'side-by-side';

interface SectionProps {
  title?: string;
  category?: string;
  slug?: string;
  articles: NewsArticle[];
  variant?: SectionVariant;
  children?: React.ReactNode;
}

export function SectionBlock({ 
  title, 
  category, 
  slug, 
  articles = [], 
  variant = 'feature',
  children 
}: SectionProps) {
  const { language, t } = useLanguage();

  if (!articles || articles.length === 0) {
    return null;
  }

  const sectionSlug = slug || category || 'news';
  
  // Localized Title logic
  let displayTitle = title;
  if (category) {
    const translated = t(category);
    if (translated !== category) {
      displayTitle = translated;
    } else if (language === 'hi' && articles[0]?.category_hi) {
      displayTitle = articles[0].category_hi;
    }
  }
  
  if (!displayTitle) {
     displayTitle = category ? category.toUpperCase() : (language === 'hi' ? 'न्यूज़' : 'NEWS');
  }

  return (
    <section className="bg-background border-b border-border/40 py-10 first:pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Header */}
        <div className="flex items-center justify-between mb-8 pb-3 border-b-2 border-foreground/5 relative group">
          <h2 className="font-bold text-2xl uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors font-serif italic">
            {displayTitle}
          </h2>
          <Link
            href={`/category/${sectionSlug}`}
            className="text-[10px] font-extrabold text-primary hover:text-black uppercase tracking-[0.2em] transition-all bg-primary/5 px-3 py-1.5 rounded-sm"
          >
            {language === 'hi' ? 'सभी देखें →' : 'Full Coverage →'}
          </Link>
          <div className="absolute -bottom-[2px] left-0 w-16 border-b-2 border-primary transition-all group-hover:w-24"></div>
        </div>

        {/* Optional Sub-Injection (like StatesRow) */}
        {children && <div className="mb-10">{children}</div>}

        {/* Dynamic Layout Variants - Defensively Mapped */}
        <div className="w-full">
          {variant === 'feature' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8">
                {/* Safe First Article */}
                {articles.slice(0, 1).map((article) => (
                  <ArticleCard key={article.id} article={article} variant="featured" />
                ))}
              </div>
              <div className="lg:col-span-4 divide-y divide-border/50">
                {articles.slice(1, 5).map((article) => (
                  <ArticleCard key={article.id} article={article} variant="horizontal" />
                ))}
              </div>
            </div>
          )}

          {variant === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {articles.slice(0, 4).map((article) => (
                <ArticleCard key={article.id} article={article} variant="compact" />
              ))}
            </div>
          )}

          {variant === 'minimal-list' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 divide-x divide-border/50">
              {[0, 1, 2].map((colIdx) => (
                <div key={colIdx} className="space-y-6 first:pl-0 pl-10">
                  {articles.slice(colIdx * 2, (colIdx * 2) + 2).map((article) => (
                    <Link key={article.id} href={`/article/${article.slug}`} className="group block space-y-1.5">
                      <p className={`text-[10px] font-bold uppercase tracking-widest text-primary/70 ${language === 'hi' ? 'font-hindi' : ''}`}>
                         {language === 'hi' ? article.category_hi : article.category}
                      </p>
                      <h4 className={`font-serif text-lg font-bold leading-tight group-hover:text-primary transition-colors [text-wrap:balance] ${language === 'hi' ? 'font-hindi' : ''}`}>
                        {language === 'hi' ? (article.title_hi || article.title) : article.title}
                      </h4>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-widest">
                         {new Date(article.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </p>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}

          {variant === 'side-by-side' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 divide-x divide-border/50">
               <div className="pr-0 lg:pr-12">
                  {articles.slice(0, 1).map((article) => (
                    <ArticleCard key={article.id} article={article} variant="default" />
                  ))}
               </div>
               <div className="pl-0 lg:pl-12">
                  {articles.slice(1, 2).map((article) => (
                    <ArticleCard key={article.id} article={article} variant="default" />
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
