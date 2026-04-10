'use client';

import { NewsArticle as Article } from '@/lib/types';
import { ArticleCard } from '@/components/homepage/ArticleCard';
import { AdContainer } from '@/components/AdContainer';
import { ScrollReveal } from '@/components/ScrollReveal';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface ArticleSidebarProps {
  relatedArticles: Article[];
  trendingArticles: Article[];
}

export function ArticleSidebar({ relatedArticles, trendingArticles }: ArticleSidebarProps) {
  const { language, t } = useLanguage();

  return (
    <aside className="space-y-12">
      {/* Related Stories */}
      {relatedArticles.length > 0 && (
        <ScrollReveal delay={100}>
          <div className="border-t-2 border-primary pt-6">
            <h3 className="font-serif text-xl font-bold text-foreground mb-6 underline decoration-primary/30 underline-offset-8">
              {t('national_news')}
            </h3>
            <div className="space-y-8">
              {relatedArticles.slice(0, 3).map((article) => (
                <div key={article.id} className="transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1">
                  <ArticleCard
                    article={article}
                    variant="compact"
                  />
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Ad Slot */}
      <ScrollReveal delay={200}>
        <div className="bg-secondary/30 rounded-sm p-4 flex flex-col items-center justify-center min-h-[250px] border border-border/50">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">
            {t('analysis')}
          </span>
          <AdContainer slot="article_sidebar" format="rectangle" />
        </div>
      </ScrollReveal>

      {/* Trending / Top Stories */}
      {trendingArticles.length > 0 && (
        <ScrollReveal delay={300}>
          <div className="bg-foreground text-background p-6 rounded-sm">
            <h3 className="font-serif text-xl font-bold mb-6 border-b border-background/20 pb-2">
              {t('trending')}
            </h3>
            <div className="space-y-6">
              {trendingArticles.slice(0, 5).map((article, index) => (
                <a 
                  key={article.id} 
                  href={`/article/${article.slug}`}
                  className="group block transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5"
                >
                  <div className="flex gap-4">
                    <span className="text-xl font-serif font-bold text-primary italic opacity-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:scale-110">
                      {index + 1}
                    </span>
                    <p className="text-sm font-bold leading-tight line-clamp-2 pb-1 bg-gradient-to-r from-primary to-primary bg-[length:0%_2px] bg-no-repeat bg-left-bottom group-hover:bg-[length:100%_2px] group-hover:text-primary transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                      {language === 'hi' ? (article.title_hi || article.title) : article.title}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}
    </aside>
  );
}
