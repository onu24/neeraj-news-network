'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { VisualStory } from '@/lib/types';
import { getVisualStories } from '@/lib/data';
import { useLanguage } from '@/components/providers/LanguageProvider';

export function VisualStories() {
  const { language, t } = useLanguage();
  const [stories, setStories] = useState<VisualStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStories() {
      const data = await getVisualStories();
      setStories(data);
      setLoading(false);
    }
    loadStories();
  }, []);

  if (loading) return null;

  return (
    <section className="bg-background border-y border-border py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h2 className={`font-bold text-xl sm:text-2xl tracking-tight text-foreground flex items-center ${language === 'hi' ? 'font-hindi' : ''}`}>
              {t('visual_stories')}
            </h2>
            <span className="ml-3 px-2 py-0.5 bg-secondary text-muted-foreground text-[10px] uppercase font-bold tracking-widest rounded-sm">
              Web Stories
            </span>
          </div>
          <Link 
            href="/visual-stories" 
            className="text-xs font-bold uppercase tracking-widest text-primary hover:underline transition-all"
          >
            {t('view_all')}
          </Link>
        </div>

        <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-4 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {stories.map((story) => (
            <Link
              key={story.id}
              href={`/visual-stories/${story.slug}`}
              className="group relative shrink-0 w-[140px] sm:w-[160px] h-[240px] sm:h-[280px] snap-center sm:snap-start rounded-lg overflow-hidden block shadow-sm"
            >
              {/* Image Container */}
              <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110">
                 <Image 
                  src={story.coverImage} 
                  alt={story.title}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
              
              {/* Gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

              {/* Story indicator lines at top */}
              <div className="absolute top-2 left-2 right-2 flex gap-1">
                {story.slides.map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 bg-white/40 rounded-full"></div>
                ))}
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <span className={`text-[8px] uppercase tracking-wider text-white/70 font-bold mb-1 block ${language === 'hi' ? 'font-hindi' : ''}`}>
                  {language === 'hi' ? 'दृश्यम' : (story.category || 'General')}
                </span>
                <h3 className={`text-white text-xs sm:text-sm font-bold leading-tight font-serif drop-shadow-md ${language === 'hi' ? 'font-hindi' : ''}`}>
                  {story.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
