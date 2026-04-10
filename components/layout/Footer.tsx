'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { TRANSLATIONS } from '@/lib/i18n';

export function Footer() {
  const { language, t } = useLanguage();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentYear = new Date().getFullYear();

  const categories = [
    { name: t('india'), slug: 'india' },
    { name: t('politics'), slug: 'politics' },
    { name: t('economy'), slug: 'economy' },
    { name: t('technology'), slug: 'technology' },
    { name: t('sports'), slug: 'sports' },
    { name: t('entertainment'), slug: 'entertainment' },
    { name: t('jobs'), slug: 'jobs' },
    { name: t('exams'), slug: 'exams' },
    { name: t('visual_stories'), slug: 'visual-stories' },
  ];

  const network = [
    { name: t('about_us'), href: '/about' },
    { name: t('contact'), href: '/contact' },
    { name: t('careers'), href: '/careers' },
    { name: t('privacy'), href: '/privacy' },
    { name: t('terms'), href: '/terms' },
  ];

  const handleSubscribe = () => {
    const email = newsletterEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      toast.error(t('email_required'), {
        description: t('email_placeholder'),
      });
      return;
    }

    if (!emailRegex.test(email)) {
      toast.error(t('invalid_email'), {
        description: t('invalid_email'),
      });
      return;
    }

    toast.success(t('subscribed_success'), {
      description: `${t('subscribed_success')} ${email}.`,
    });
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-zinc-950 text-white pt-16 pb-8 border-t-8 border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Brand & Mission */}
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-black tracking-tighter">
              DRISHYAM<span className="text-primary italic">NEWS</span>
            </h2>
            <p className={`text-zinc-400 text-sm leading-relaxed ${language === 'hi' ? 'font-hindi' : 'font-serif italic'} border-l-2 border-primary/40 pl-4 py-1`}>
              {t('about_drishyam')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-primary transition-colors">
                <span className="sr-only">Twitter</span>
                <span className="text-xs">𝕏</span>
              </a>
              <a href="#" className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-primary transition-colors">
                <span className="sr-only">Facebook</span>
                <span className="text-xs">f</span>
              </a>
              <a href="#" className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-primary transition-colors">
                <span className="sr-only">Instagram</span>
                <span className="text-xs">ig</span>
              </a>
            </div>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h3 className={`text-xs font-black uppercase tracking-[0.2em] text-primary mb-8 ${language === 'hi' ? 'font-hindi' : ''}`}>
              {t('sections')}
            </h3>
            <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link 
                    href={cat.slug === 'visual-stories' ? '/visual-stories' : `/category/${cat.slug}`} 
                    className={`text-zinc-400 hover:text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-1 inline-block text-sm font-bold uppercase tracking-wider ${language === 'hi' ? 'font-hindi' : ''}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Drishyam Network */}
          <div>
            <h3 className={`text-xs font-black uppercase tracking-[0.2em] text-primary mb-8 ${language === 'hi' ? 'font-hindi' : ''}`}>
              {t('company')}
            </h3>
            <ul className="space-y-4">
              {network.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href} 
                    className={`text-zinc-400 hover:text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-1 inline-block text-sm font-medium ${language === 'hi' ? 'font-hindi' : ''}`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-6">
            <h3 className={`text-xs font-black uppercase tracking-[0.2em] text-primary mb-8 ${language === 'hi' ? 'font-hindi' : ''}`}>
              {mounted ? t('daily_briefing') : TRANSLATIONS.hi.daily_briefing}
            </h3>
            <p className={`text-zinc-400 text-xs leading-relaxed uppercase tracking-widest font-bold ${language === 'hi' ? 'font-hindi' : ''}`}>
              {mounted ? t('newsletter_intro') : TRANSLATIONS.hi.newsletter_intro}
            </p>
            <div className="flex flex-col gap-3">
               <input 
                 type="email" 
                 placeholder={mounted ? t('email_placeholder') : TRANSLATIONS.hi.email_placeholder} 
                 value={newsletterEmail}
                 onChange={(e) => setNewsletterEmail(e.target.value)}
                 suppressHydrationWarning
                 className="bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors rounded-sm"
               />
               <button
                 onClick={handleSubscribe}
                 suppressHydrationWarning
                 className={`w-full bg-primary py-3 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] ${language === 'hi' ? 'font-hindi' : ''}`}
               >
                  {mounted ? t('subscribe_free') : TRANSLATIONS.hi.subscribe_free}
               </button>
            </div>
            <p className={`text-[9px] text-zinc-500 uppercase tracking-widest leading-relaxed ${language === 'hi' ? 'font-hindi' : ''}`}>
               {mounted ? t('agree_terms') : TRANSLATIONS.hi.agree_terms}
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className={`text-zinc-500 text-[10px] uppercase font-bold tracking-[0.2em] ${language === 'hi' ? 'font-hindi' : ''}`}>
            © {currentYear} {t('made_for_india')}
          </p>
          <div className={`flex items-center gap-8 text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-500 ${language === 'hi' ? 'font-hindi' : ''}`}>
             <span>{language === 'hi' ? 'दृश्यम न्यूज नेटवर्क द्वारा भारत में गर्व से निर्मित' : 'PROUDLY MADE IN INDIA BY DRISHYAM NEWS NETWORK'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
