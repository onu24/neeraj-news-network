'use client';

import { PlayCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { NewsArticle } from '@/lib/types';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface VideoCarouselProps {
  articles: NewsArticle[];
}

export function VideoCarousel({ articles }: VideoCarouselProps) {
  const { language, t } = useLanguage();
  
  if (articles.length === 0) return null;

  return (
    <section className="bg-black text-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-white/20 relative">
          <h2 className={`font-bold text-2xl tracking-tight flex items-center ${language === 'hi' ? 'font-hindi' : ''}`}>
            <PlayCircle className="mr-2 h-6 w-6 text-primary" />
            {t('videos')}
          </h2>
          <Link
            href="/category/videos"
            className="text-xs font-bold text-primary hover:text-white uppercase tracking-widest transition-colors"
          >
            {language === 'hi' ? 'सभी वीडियो →' : 'All Videos →'}
          </Link>
          <div className="absolute -bottom-[2px] left-0 w-12 border-b-2 border-primary" />
        </div>

        <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {articles.map((video) => (
            <Link
              key={video.id}
              href={`/article/${video.slug}`}
              className="group shrink-0 w-[280px] sm:w-[320px] snap-center sm:snap-start block"
            >
              <div className="relative aspect-video bg-zinc-800 rounded-sm overflow-hidden mb-3">
                {/* Play icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity z-20">
                  <PlayCircle className="text-white h-12 w-12 drop-shadow-lg" />
                </div>

                {/* Thumbnail */}
                {video.coverImage ? (
                  <Image
                    src={video.coverImage}
                    alt={video.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 z-10"
                    sizes="320px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 group-hover:scale-105 transition-transform duration-500" />
                )}

                {/* Duration badge — use readingTime as proxy if no videoUrl */}
                <div className="absolute bottom-2 right-2 bg-black/80 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-sm z-30 shadow-sm">
                  {video.readingTime ? `${video.readingTime} ${language === 'hi' ? 'मिनट' : 'min'}` : (language === 'hi' ? 'वीडियो' : 'Video')}
                </div>
              </div>

              <div className="space-y-1">
                <span className={`text-[11px] font-bold text-primary uppercase tracking-widest ${language === 'hi' ? 'font-hindi' : ''}`}>
                  {language === 'hi' ? (video.category_hi || 'वीडियो') : (video.category || 'Video')}
                </span>
                <h3 className={`font-serif text-lg font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2 ${language === 'hi' ? 'font-hindi' : ''}`}>
                  {language === 'hi' ? (video.title_hi || video.title) : video.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
