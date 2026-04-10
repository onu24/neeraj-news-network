'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';

export function Navbar() {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { language, t } = useLanguage();

  const [categories, setCategories] = useState([
    { name: t('home'), slug: '/' },
    { name: t('latest'), slug: '/latest' },
    { name: t('india'), slug: '/category/india' },
    { name: t('states'), slug: '/category/states' },
    { name: t('politics'), slug: '/category/politics' },
    { name: t('economy'), slug: '/category/economy' },
    { name: t('technology'), slug: '/category/technology' },
    { name: t('sports'), slug: '/category/sports' },
    { name: t('entertainment'), slug: '/category/entertainment' },
    { name: t('jobs'), slug: '/category/jobs' },
    { name: t('exams'), slug: '/category/exams' },
    { name: t('explainers'), slug: '/category/explainers' },
    { name: t('videos'), slug: '/category/videos' },
  ]);

  useEffect(() => {
    // Dynamic import to avoid loading heavy firebase clients on initial render
    import('@/lib/data').then(({ getAllCategories }) => {
      getAllCategories().then((cats) => {
        if (cats && cats.length > 0) {
          const dynamicCategories = cats.map(c => {
            // First check if the name is already localized in DB
            const dbName = language === 'hi' ? (c.name_hi || c.name) : (c.name_en || c.name);
            
            // Second layer: try to find a translation key for the slug
            // (Only if dbName looks like English uppercase fallback)
            let finalName = dbName;
            const isEnglishFallback = /^[A-Z][A-Z\s&]*$/.test(dbName);
            
            if (isEnglishFallback && t(c.slug) !== c.slug) {
              finalName = t(c.slug);
            }

            return {
              name: finalName,
              slug: `/category/${c.slug}`
            };
          });
          
          setCategories([
            { name: t('home'), slug: '/' },
            { name: t('latest'), slug: '/latest' },
            ...dynamicCategories,
            { name: t('visual_stories'), slug: '/visual-stories' }
          ]);
        }
      });
    }).catch(console.error);
  }, [t, language]);

  return (
    <nav className="border-b border-border bg-background sticky top-[80px] z-30 shadow-sm shadow-black/5 dark:shadow-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center px-4 sm:px-6 lg:px-8 h-12">
          <div className="flex items-center gap-6 lg:gap-8">
            {categories.map((category) => {
              const isActive = pathname === category.slug;
              return (
                <Link
                  key={category.slug}
                  href={category.slug}
                  className={`text-[13px] font-bold uppercase tracking-wide whitespace-nowrap py-3.5 border-b-[3px] transition-colors ${
                    language === 'hi' ? 'font-hindi' : 'font-sans'
                  } ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-foreground hover:text-primary'
                  }`}
                >
                  {category.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation (Scrollable Chips) */}
        <div 
          ref={scrollRef}
          className="md:hidden flex items-center gap-2 overflow-x-auto no-scrollbar px-4 py-3"
        >
          {categories.map((category) => {
            const isActive = pathname === category.slug;
            return (
              <Link
                key={category.slug}
                href={category.slug}
                className={`text-xs font-semibold whitespace-nowrap px-4 py-2 rounded-full border transition-colors ${
                  language === 'hi' ? 'font-hindi' : 'font-sans'
                } ${
                  isActive
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-secondary border-transparent text-foreground hover:border-border'
                }`}
              >
                {category.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
