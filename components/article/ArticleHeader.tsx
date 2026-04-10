'use client';

import { NewsArticle as Article, Author } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Eye, Calendar } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useState } from 'react';

/** Handles broken avatar URLs from Firestore with a local fallback */
function AvatarImage({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src || '/placeholder-user.jpg');
  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      sizes="56px"
      className="object-cover"
      onError={() => setImgSrc('/placeholder-user.jpg')}
    />
  );
}

interface ArticleHeaderProps {
  article: Article;
  author?: Author;
}

export function ArticleHeader({ article, author }: ArticleHeaderProps) {
  const { language, t } = useLanguage();

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return t('latest_updates');
      return d.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return t('latest_updates');
    }
  };

  const readingTime = article.readingTime || Math.ceil((article.content?.split(' ').length || 0) / 200);
  const isOpinion = article.articleType === 'opinion';
  const displayCategory = language === 'hi' ? (article.category || 'न्यूज़') : (article.category || 'NEWS');
  
  // Choose localized content with English fallback
  const displayTitle = (language === 'hi' && article.title_hi) ? article.title_hi : article.title;
  const displayExcerpt = (language === 'hi' && article.excerpt_hi) ? article.excerpt_hi : article.excerpt;

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
      {/* Breadcrumbs */}
      <ScrollReveal delay={100}>
        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground mb-10">
          <Link href="/" className="hover:text-primary transition-colors">{t('home')}</Link>
          <span className="opacity-30">/</span>
          <Link href={`/category/${article.categorySlug || 'news'}`} className="hover:text-primary transition-colors">
            {displayCategory}
          </Link>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <div className="space-y-8">
          {/* Category & Type Badges */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-tighter rounded-sm shadow-md">
              {displayCategory}
            </span>
            {isOpinion && (
              <span className="px-3 py-1.5 bg-black text-white text-[10px] font-black uppercase tracking-tighter rounded-sm shadow-md">
                {t('opinion')}
              </span>
            )}
            {article.articleType === 'explainer' && (
              <span className="px-3 py-1.5 bg-blue-700 text-white text-[10px] font-black uppercase tracking-tighter rounded-sm shadow-md">
                {t('analysis')}
              </span>
            )}
            {article.isLive && (
              <span className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-md flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                {t('live')}
              </span>
            )}
          </div>

        {/* Authoritative Headline */}
        <h1 className={`font-serif leading-[0.95] tracking-tight font-bold text-foreground mb-8 ${isOpinion ? 'text-5xl sm:text-7xl italic text-zinc-950 text-center py-6 border-y-4 border-black/5' : 'text-4xl sm:text-6xl md:text-7xl'} ${language === 'hi' ? 'font-hindi' : ''}`}>
          {displayTitle}
        </h1>

        {/* High-Impact Excerpt */}
        {displayExcerpt && (
          <p className={`text-xl sm:text-2xl text-muted-foreground font-serif leading-relaxed italic border-l-4 border-primary/20 pl-8 my-10 max-w-3xl ${language === 'hi' ? 'font-hindi' : ''}`}>
            {displayExcerpt}
          </p>
        )}

        {/* Editorial Metadata Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 pb-10 border-b-2 border-zinc-100 mt-12 bg-zinc-50/50 p-6 rounded-sm border border-zinc-200/50">
          {author ? (
            <div className="flex items-center gap-5">
              <div className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden bg-zinc-200 border-2 border-white shadow-sm ring-1 ring-zinc-200">
                  <AvatarImage
                    src={author.avatar || '/placeholder-user.jpg'}
                    alt={author.name}
                  />
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-lg text-foreground leading-none mb-1.5">{author.name}</p>
                <div className="flex items-center gap-2">
                   <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                    {author.role || (language === 'hi' ? 'वरिष्ठ संवाददाता' : 'Senior Correspondent')}
                  </p>
                   {author.socialLinks?.twitter && (
                      <span className="text-[10px] text-primary/60 font-bold tracking-tighter underline underline-offset-4 decoration-1 decoration-primary/20 cursor-pointer">@{language === 'hi' ? 'सत्यापित' : 'Verified'}</span>
                   )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center text-white font-serif text-lg italic shadow-xl">
                  D
               </div>
               <div className="flex flex-col">
                  <p className="font-bold text-lg text-foreground leading-none mb-1.5">{language === 'hi' ? 'दृश्यम न्यूजरूम' : 'Drishyam Newsroom'}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{language === 'hi' ? 'संपादकीय टीम' : 'Editorial Team'}</p>
               </div>
            </div>
          )}
          
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-zinc-300" />
              <span>{formatDate(article.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-zinc-300" />
              <span>{readingTime}m {t('read')}</span>
            </div>
            {article.views !== undefined && (
              <div className="hidden sm:flex items-center gap-2">
                <Eye className="h-4 w-4 text-zinc-300" />
                <span>{article.views.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      </ScrollReveal>

      {/* Hero Featured Image */}
      {article.coverImage && (
        <ScrollReveal delay={400} baseClass="reveal-blur">
          <div className="mt-12 mb-6 group">
            <div className="relative w-full aspect-video overflow-hidden rounded-sm shadow-2xl border border-zinc-200">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-[1.01] transition-transform duration-1000"
                priority
              />
              {/* Minimal Photo Caption Overlay */}
              <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold px-3 py-1.5 uppercase tracking-widest rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                 Media Archive / Drishyam News Network
              </div>
            </div>
          </div>
        </ScrollReveal>
      )}
    </article>
  );
}
