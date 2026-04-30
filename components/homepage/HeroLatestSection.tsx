'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { NewsArticle } from '@/lib/types';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { WeatherWidget, CITIES, CityEntry } from '../layout/WeatherWidget';
import { motion } from 'framer-motion';
import { AnimatedLive } from '../layout/AnimatedIcons';
import { useState } from 'react';

export interface HeroLatestSectionProps {
  leadArticle: NewsArticle;
  latestArticles: NewsArticle[];
}

export function HeroLatestSection({ leadArticle, latestArticles }: HeroLatestSectionProps) {
  const { language, t } = useLanguage();
  const [currentCity, setCurrentCity] = useState<CityEntry>(CITIES[0]);

  const formatDate = (dateStr: string) => {
     try {
       return new Date(dateStr).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric' });
     } catch (e) {
       return language === 'hi' ? 'हाल ही में' : 'Recently';
     }
  };

  const leadTitle = (language === 'hi' && leadArticle.title_hi && leadArticle.title_hi.trim() !== '') ? leadArticle.title_hi : leadArticle.title;
  const leadExcerpt = (language === 'hi' && leadArticle.excerpt_hi && leadArticle.excerpt_hi.trim() !== '') 
    ? leadArticle.excerpt_hi 
    : (leadArticle.excerpt || leadArticle.excerpt_hi || (language === 'hi' ? 'आज की महत्वपूर्ण खबर का संपादन विश्लेषण। दृश्यम न्यूज़ पर विस्तृत कवरेज।' : "Editorial analysis of today's developing story. Comprehensive coverage on Drishyam News."));

  return (
    <section className="bg-white dark:bg-zinc-950 border-b-8 border-secondary/30 py-8 sm:py-16 selection:bg-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12">
          
          {/* Main Editorial Block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Lead Story: Dominant & Authoritative */}
            <div className="lg:col-span-8 flex flex-col group/lead">
              <Link href={`/article/${leadArticle.slug}`} className="cursor-pointer block space-y-8">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900 shadow-2xl border border-border/40">
                  {/* Premium Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 pointer-events-none" />
                  
                  {leadArticle.coverImage ? (
                      <Image
                        src={leadArticle.coverImage}
                        alt={leadTitle}
                        fill
                        className="object-cover group-hover/lead:scale-[1.02] transition-transform duration-[1.5s] ease-out-quint"
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 66vw"
                      />
                  ) : (
                    <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  )}
                  
                  {/* Category Badge - Premium Style */}
                  <div className="absolute top-6 left-6 z-20">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-white/20 blur-sm rounded-full" />
                      <span className="relative bg-white dark:bg-zinc-950 text-black dark:text-white text-[10px] font-black px-4 py-2 uppercase tracking-[0.2em] rounded-sm shadow-xl">
                        {language === 'hi' ? (leadArticle.category || 'न्यूज़') : (leadArticle.category || 'NEWS')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h1 className={`font-serif text-4xl sm:text-6xl lg:text-[5.4rem] font-black leading-[0.9] tracking-tight text-foreground group-hover/lead:text-primary transition-colors duration-500 [text-wrap:balance] ${language === 'hi' ? 'font-hindi-serif leading-[1.1] font-black' : ''}`}>
                    {leadTitle}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-10">
                    <p className={`flex-1 text-xl sm:text-[1.35rem] text-muted-foreground/90 font-serif leading-relaxed italic border-l-[6px] border-primary/30 dark:border-primary/50 pl-8 my-2 ${language === 'hi' ? 'font-hindi' : ''}`}>
                      {leadExcerpt}
                    </p>
                    <div className="shrink-0 flex flex-col items-start text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-[0.25em] pt-4 gap-2 border-t sm:border-t-0 sm:border-l border-zinc-100 dark:border-zinc-800 sm:pl-8">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-foreground">{t('made_for_india')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                         <span>{formatDate(leadArticle.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                         <span className="text-primary/80">{t('top_stories')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Sidebar: Premium Feeds List */}
            <div className="lg:col-span-4 flex flex-col h-full border-t-2 lg:border-t-0 lg:border-l border-zinc-100 dark:border-zinc-900 pt-10 lg:pt-0 lg:pl-12">
              
              {/* Regional Weather Context */}
              <div className="mb-6 sm:mb-10 p-4 sm:p-6 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900/80 dark:to-zinc-950 rounded-2xl border border-primary/10 shadow-xl shadow-black/5 relative overflow-hidden group/card hover:border-primary/30 transition-all duration-500">
                 {/* Decorative background glow */}
                 <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 blur-[80px] rounded-full group-hover/card:bg-primary/10 transition-colors pointer-events-none" />
                 
                 <div className="flex items-center justify-between mb-5 sm:mb-8">
                    <div className="flex items-center gap-2 sm:gap-3">
                       <span className="w-1 h-4 bg-primary rounded-full flex-shrink-0" />
                       <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] text-foreground">
                         {currentCity.name} Profile
                       </span>
                    </div>
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </div>
                 </div>
                 <WeatherWidget onCityChange={setCurrentCity} />
              </div>

              <div className="flex items-center justify-between mb-10 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="font-black text-xl sm:text-2xl uppercase tracking-tighter text-foreground flex items-center group/title cursor-default">
                  <motion.div 
                    animate={{ rotate: [45, 225, 45] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-3 h-3 bg-primary mr-3 shadow-[0_0_10px_rgba(220,38,38,0.3)]" 
                  />
                  {t('top_feeds')}
                </h3>
                <Link href="/latest" className="group/live flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-primary/80 hover:text-primary transition-colors">
                  <AnimatedLive className="w-2.5 h-2.5" />
                  {t('live')}
                </Link>
              </div>
              
              <div className="flex flex-col gap-0 divide-y divide-zinc-100 dark:divide-zinc-900">
                {latestArticles.slice(0, 5).map((article, index) => {
                  const displayTitle = (language === 'hi' && article.title_hi) ? article.title_hi : article.title;
                  const itemIndex = (index + 1).toString().padStart(2, '0');
                  
                  return (
                    <Link 
                      key={article.id} 
                      href={`/article/${article.slug}`} 
                      className="group/item py-8 first:pt-0 block hover-lift"
                    >
                      <div className="flex gap-6 items-start">
                        <span className="text-zinc-200 dark:text-zinc-800 font-black text-4xl font-sans tracking-tighter leading-none pt-1">
                          {itemIndex}
                        </span>
                        <div className="flex flex-col gap-2.5">
                           <span className="text-[9px] font-black text-primary/60 dark:text-primary/80 uppercase tracking-[0.25em]">
                              {language === 'hi' ? (article.category || 'न्यूज़') : (article.category || 'NEWS')}
                           </span>
                           <h4 className={`font-serif text-[1.25rem] font-bold leading-tight group-hover/item:text-primary transition-colors duration-300 line-clamp-3 ${language === 'hi' ? 'font-hindi mb-1' : ''}`}>
                            {displayTitle}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest">
                              {formatDate(article.createdAt)}
                            </p>
                            <span className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                            <p className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest">
                              {Math.max(1, article.readingTime || 0)} min read
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              
              <Link
                href="/latest"
                className="group/btn mt-6 sm:mt-12 w-full flex items-center justify-center gap-2.5
                           py-4 sm:py-5 px-5
                           bg-red-600 dark:bg-red-600
                           border border-red-600 dark:border-red-600
                           rounded-xl sm:rounded-sm
                           text-[11px] sm:text-[12px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em]
                           text-white
                           hover:bg-red-700 hover:border-red-700
                           active:scale-[0.97]
                           transition-all duration-300 overflow-hidden relative shadow-md shadow-red-600/20"
              >
                {/* Shimmer sweep on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

                {/* Live pulse dot */}
                <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>

                <span className="relative z-10">{t('view_all')}</span>

                {/* Arrow icon slides in on hover */}
                <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300 relative z-10" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
