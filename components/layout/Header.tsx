'use client';

import Link from 'next/link';
import { Search, Bell } from 'lucide-react';
import { SearchInput } from './SearchInput';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { language, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNotificationsClick = () => {
    toast.info(t('notifications_coming_soon'), {
      description: t('notifications_desc'),
    });
  };

  return (
    <header 
      suppressHydrationWarning
      className={`sticky top-0 z-40 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        scrolled 
          ? 'bg-background/80 backdrop-blur-md shadow-sm border-b border-border/50' 
          : 'bg-background border-b border-border'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'
        }`}>
          
          {/* Logo Main Segment */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
            <div className="flex flex-col">
              <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-primary tracking-tight leading-none group-hover:opacity-90 transition-opacity">
                Drishyam
              </h1>
              <p className={`text-[10px] sm:text-xs font-semibold text-muted-foreground tracking-widest uppercase mt-0.5 ml-1 ${language === 'hi' ? 'font-hindi' : ''}`}>
                {t('news_analysis')}
              </p>
            </div>
          </Link>

          {/* Right Actions Segment */}
          <div className="flex items-center gap-4 lg:gap-6 flex-1 justify-end max-w-xl">
            <div className="hidden md:block w-full max-w-xs lg:max-w-sm">
              <SearchInput />
            </div>

            <button 
              aria-label="Search" 
              suppressHydrationWarning
              className="md:hidden text-foreground hover:text-primary transition-colors p-2"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              aria-label="Notifications"
              onClick={handleNotificationsClick}
              suppressHydrationWarning
              className="text-foreground hover:text-primary transition-colors p-2 relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
