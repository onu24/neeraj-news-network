'use client';

import { Settings2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useLanguage } from '@/components/providers/LanguageProvider';

const TOPICS = [
  { label: 'india', slug: 'india' },
  { label: 'states', slug: 'states' },
  { label: 'politics', slug: 'politics' },
  { label: 'economy', slug: 'economy' },
  { label: 'jobs', slug: 'jobs' },
  { label: 'exams', slug: 'exams' },
  { label: 'sports', slug: 'sports' },
  { label: 'entertainment', slug: 'entertainment' },
];

export function FeedPersonalization() {
  const { t } = useLanguage();
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();

  // Load initial preferences from cookie
  useEffect(() => {
    const prefs = document.cookie
      .split('; ')
      .find(row => row.startsWith('drishyam_user_prefs='))
      ?.split('=')[1];
    
    if (prefs) {
      try {
        setSelectedSlugs(JSON.parse(decodeURIComponent(prefs)));
      } catch (e) {
        console.error("Failed to parse prefs", e);
      }
    }
  }, []);

  const toggleTopic = (slug: string) => {
    setIsSaved(false);
    setSelectedSlugs(prev => 
      prev.includes(slug) 
        ? prev.filter(s => s !== slug) 
        : [...prev, slug]
    );
  };

  const savePreferences = () => {
    if (selectedSlugs.length === 0) {
      toast.info('No topics selected', {
        description: 'Choose at least one topic before saving your feed preferences.',
      });
      return;
    }

    // Save to cookie (valid for 30 days)
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    
    document.cookie = `drishyam_user_prefs=${encodeURIComponent(JSON.stringify(selectedSlugs))}; path=/; expires=${expiry.toUTCString()}; SameSite=Lax`;
    
    setIsSaved(true);

    toast.success('Preferences saved', {
      description: `Your feed is updated for ${selectedSlugs.length} selected topic${selectedSlugs.length > 1 ? 's' : ''}.`,
    });
    
    // Refresh the page data (Server Components will pick up the new cookie)
    router.refresh();

    // Reset saved state after a few seconds
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <section className="bg-secondary/30 py-10 border-b border-border" id="filter-feed">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="font-bold text-xl sm:text-2xl tracking-tight text-foreground flex items-center justify-center mb-2">
          <Settings2 className="mr-2 h-5 w-5 text-primary" />
          {t('customize_feed')}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {t('newsletter_intro')}
        </p>

        <div className="flex flex-wrap justify-center gap-x-3 gap-y-3 sm:gap-x-4 sm:gap-y-4 mb-7">
          {TOPICS.map((topic) => {
            const isActive = selectedSlugs.includes(topic.slug);
            return (
              <button
                key={topic.slug}
                onClick={() => toggleTopic(topic.slug)}
                suppressHydrationWarning
                className={`px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md scale-105 border-primary'
                    : 'bg-background border border-border text-foreground hover:border-primary/50 hover:text-primary'
                }`}
              >
                {t(topic.label)}
              </button>
            );
          })}
        </div>
        
          <div className="mt-2 flex flex-col items-center justify-center gap-3">
            <button 
              onClick={savePreferences}
              disabled={isSaved}
              suppressHydrationWarning
              className={`min-w-[220px] font-bold text-xs uppercase tracking-[0.14em] px-8 py-3 rounded-sm transition-all flex items-center justify-center ${
                isSaved 
                  ? 'bg-green-600 text-white cursor-default' 
                  : 'bg-foreground text-background hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {t('subscribed_success')}
                </>
              ) : (
                t('customize_feed')
              )}
            </button>

            {selectedSlugs.length > 0 && (
              <button
                onClick={() => {
                  setSelectedSlugs([]);
                  document.cookie = 'drishyam_user_prefs=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                  setIsSaved(false);
                  toast.success(t('reset_prefs'), {
                    description: 'You are back to the default homepage feed.',
                  });
                  router.refresh();
                }}
                className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
              >
                {t('reset_prefs')}
              </button>
            )}
          </div>
          
          {selectedSlugs.length > 0 && !isSaved && (
            <p className="mt-3 text-[10px] text-muted-foreground animate-pulse">
              Click save to apply your {selectedSlugs.length} selected topics
            </p>
          )}
        </div>
    </section>
  );
}
