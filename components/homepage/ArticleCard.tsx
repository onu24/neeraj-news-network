'use client';

import Link from 'next/link';
import Image from 'next/image';
import { NewsArticle } from '@/lib/types';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface ArticleCardProps {
  article: NewsArticle;
  variant?: 'default' | 'featured' | 'compact' | 'horizontal';
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const { language, t } = useLanguage();

  if (!article) return null;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return language === 'hi' ? 'हाल ही में' : 'Recently';
    }
  };

  const displayTitle = (language === 'hi' && article.title_hi && article.title_hi.trim() !== '') ? article.title_hi : article.title;
  const displayDescription = (language === 'hi' && article.excerpt_hi && article.excerpt_hi.trim() !== '') ? article.excerpt_hi : (article.excerpt || article.excerpt_hi);
  
  const imageUrl = article.coverImage;

  const displayCategory = language === 'hi' ? (article.category_hi || 'न्यूज़') : (article.category || 'NEWS');

  if (variant === 'featured') {
    return (
      <Link href={`/article/${article.slug}`} className="group cursor-pointer block">
        <div className="relative mb-6 overflow-hidden bg-muted aspect-[16/9] w-full rounded-sm border border-border/50 shadow-sm">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={displayTitle}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
              priority
            />
          ) : (
            <div className="w-full h-full bg-secondary/20 flex items-center justify-center font-serif text-muted-foreground italic">
              {language === 'hi' ? 'दृश्यम न्यूज नेटवर्क' : 'Drishyam News Archive'}
            </div>
          )}
          <div className="absolute top-4 left-4">
            <span className="bg-primary text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-tighter rounded-sm shadow-xl">
              {displayCategory}
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] text-foreground group-hover:text-primary transition-colors ${language === 'hi' ? 'font-hindi' : ''}`}>
            {displayTitle}
          </h2>
          {displayDescription && (
            <p className={`text-lg text-muted-foreground line-clamp-3 leading-relaxed border-l-2 border-primary/20 pl-4 py-1 italic ${language === 'hi' ? 'font-hindi' : ''}`}>
              {displayDescription}
            </p>
          )}
          <div className="flex items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest gap-3">
             <span>{formatDate(article.createdAt)}</span>
             <span className="w-1 h-1 bg-border rounded-full" />
             <span>{Math.max(1, article.readingTime || 0)} {language === 'hi' ? 'मिनट' : 'm'} {t('read')}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link href={`/article/${article.slug}`} className="group cursor-pointer flex gap-4 py-4 first:pt-0">
        <div className="relative hidden sm:block w-32 h-24 shrink-0 overflow-hidden bg-muted rounded-sm">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={displayTitle}
              fill
              sizes="(max-width: 768px) 100px, 128px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
            {displayCategory}
          </p>
          <h4 className={`font-serif text-base sm:text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 ${language === 'hi' ? 'font-hindi' : ''}`}>
            {displayTitle}
          </h4>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-2">{formatDate(article.createdAt)}</p>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/article/${article.slug}`} className="group cursor-pointer">
        <div className="relative mb-3 aspect-[3/2] overflow-hidden bg-muted w-full rounded-sm">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={displayTitle}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
          {displayCategory}
        </p>
        <h3 className={`font-serif text-base font-bold leading-snug text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2 ${language === 'hi' ? 'font-hindi' : ''}`}>
          {displayTitle}
        </h3>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{formatDate(article.createdAt)}</p>
      </Link>
    );
  }

  return (
    <Link href={`/article/${article.slug}`} className="group cursor-pointer block border-b border-border/50 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
      <div className="relative mb-4 aspect-video overflow-hidden bg-muted w-full rounded-sm">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={displayTitle}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </div>
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
          {displayCategory}
        </p>
        <h3 className={`font-serif text-xl sm:text-2xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-3 ${language === 'hi' ? 'font-hindi' : ''}`}>
          {displayTitle}
        </h3>
        {displayDescription && (
          <p className={`text-sm text-muted-foreground line-clamp-2 leading-relaxed ${language === 'hi' ? 'font-hindi mt-1' : ''}`}>
            {displayDescription}
          </p>
        )}
        <div className="flex items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-1 gap-2">
           <span>{formatDate(article.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
