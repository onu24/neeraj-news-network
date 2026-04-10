'use client';

import Link from 'next/link';
import Image from 'next/image';
import { NewsArticle } from '@/lib/types';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface ExplainerGridProps {
  articles: NewsArticle[];
}

export function ExplainerGrid({ articles }: ExplainerGridProps) {
  const { language, t } = useLanguage();
  
  if (articles.length === 0) return null;

  return (
    <section className="bg-secondary/20 border-b border-border py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-foreground/10 relative">
          <h2 className={`font-bold text-2xl tracking-tight text-foreground flex items-center ${language === 'hi' ? 'font-hindi' : ''}`}>
            {t('explainers')}
          </h2>
          <Link
            href="/category/explainers"
            className="text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-widest transition-colors"
          >
            {language === 'hi' ? 'सभी एक्सप्लेनर्स →' : 'All Explainers →'}
          </Link>
          <div className="absolute -bottom-[2px] left-0 w-12 border-b-2 border-primary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((item) => (
            <Link
              key={item.id}
              href={`/article/${item.slug}`}
              className="group block bg-background border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="h-40 bg-muted relative overflow-hidden">
                {item.coverImage ? (
                  <Image
                    src={item.coverImage}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-blue-900/40" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <div className="absolute bottom-3 left-3 z-20">
                  <span className={`bg-blue-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm ${language === 'hi' ? 'font-hindi' : ''}`}>
                    {language === 'hi' ? 'एक्सप्लेनर' : 'Explainer'}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <span className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block ${language === 'hi' ? 'font-hindi' : ''}`}>
                  {language === 'hi' ? (item.category_hi || 'एक्सप्लेनर') : (item.category || 'Explained')}
                </span>
                <h3 className={`font-serif text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-3 ${language === 'hi' ? 'font-hindi' : ''}`}>
                  {language === 'hi' ? (item.title_hi || item.title) : item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
