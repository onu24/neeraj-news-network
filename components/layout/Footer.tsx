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
  const [isSubscribing, setIsSubscribing] = useState(false);

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

  const handleSubscribe = async () => {
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

    setIsSubscribing(true);
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.message === 'Already subscribed') {
          toast.info(language === 'hi' ? 'आप पहले से ही सब्सक्राइब कर चुके हैं!' : 'You are already subscribed!');
        } else {
          toast.success(t('subscribed_success'), {
            description: `${t('subscribed_success')} ${email}.`,
          });
          setNewsletterEmail('');
        }
      } else {
        throw new Error(data.error || 'Subscription failed');
      }
    } catch (error: any) {
      toast.error(language === 'hi' ? 'कुछ गलत हो गया' : 'Something went wrong', {
        description: error.message,
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-zinc-950 text-white pt-16 pb-8 border-t-8 border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">

          {/* Column 1: Brand & Mission */}
          <div className="space-y-6">
            <h2 className={`text-4xl tracking-tighter ${language === 'hi' ? 'font-hindi-serif font-black leading-tight' : 'font-serif font-black'}`}>
              {language === 'hi' ? 'दृश्यम' : 'DRISHYAM'}<span className="text-primary italic">{language === 'hi' ? 'न्यूज़' : 'NEWS'}</span>
            </h2>
            <p className={`text-zinc-400 text-sm leading-relaxed ${language === 'hi' ? 'font-hindi-tiro text-base' : 'font-serif italic'} border-l-2 border-primary/40 pl-4 py-1`}>
              {t('about_drishyam')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300">
                <span className="sr-only">Twitter</span>
                <span className="text-sm">𝕏</span>
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300">
                <span className="sr-only">Facebook</span>
                <span className="text-sm">f</span>
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300">
                <span className="sr-only">Instagram</span>
                <span className="text-sm">ig</span>
              </a>
            </div>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h3 className={`mb-8 text-primary ${language === 'hi' ? 'font-hindi-label text-sm' : 'text-[11px] font-black uppercase tracking-[0.25em]'}`}>
              {t('sections')}
            </h3>
            <ul className="grid grid-cols-2 gap-y-4 gap-x-4">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={cat.slug === 'visual-stories' ? '/visual-stories' : `/category/${cat.slug}`}
                    className={`text-zinc-400 hover:text-white transition-all duration-300 ease-premium hover:translate-x-1.5 inline-block ${language === 'hi' ? 'font-hindi-footer-link' : 'text-sm font-bold uppercase tracking-wider'}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Drishyam Network */}
          <div>
            <h3 className={`mb-8 text-primary ${language === 'hi' ? 'font-hindi-label text-sm' : 'text-[11px] font-black uppercase tracking-[0.25em]'}`}>
              {t('company')}
            </h3>
            <ul className="space-y-4">
              {network.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`text-zinc-400 hover:text-white transition-all duration-300 ease-premium hover:translate-x-1.5 inline-block ${language === 'hi' ? 'font-hindi-footer-link' : 'text-sm font-medium'}`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-6">
            <h3 className={`mb-8 text-primary ${language === 'hi' ? 'font-hindi-label text-sm' : 'text-[11px] font-black uppercase tracking-[0.25em]'}`}>
              {mounted ? t('daily_briefing') : TRANSLATIONS.hi.daily_briefing}
            </h3>
            <p className={`text-zinc-400 leading-relaxed ${language === 'hi' ? 'font-hindi-tiro text-base opacity-85' : 'text-xs uppercase tracking-widest font-bold'}`}>
              {mounted ? t('newsletter_intro') : TRANSLATIONS.hi.newsletter_intro}
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder={mounted ? t('email_placeholder') : TRANSLATIONS.hi.email_placeholder}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                suppressHydrationWarning
                disabled={isSubscribing}
                className="bg-zinc-900 border border-zinc-800 px-4 py-3.5 text-sm focus:outline-none focus:border-primary transition-colors rounded-sm selection:bg-primary/20 disabled:opacity-50"
              />
              <button
                onClick={handleSubscribe}
                suppressHydrationWarning
                disabled={isSubscribing}
                className={`group/sub relative w-full bg-primary py-4 text-white hover:bg-white hover:text-zinc-950 transition-all duration-500 overflow-hidden active:scale-95 shadow-xl disabled:opacity-70 disabled:cursor-not-allowed ${language === 'hi' ? 'font-hindi-serif text-xl font-bold pt-3' : 'text-[11px] font-black uppercase tracking-[0.3em]'}`}
              >
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/sub:translate-x-full transition-transform duration-1000 ease-in-out" />
                <span className="relative z-10">
                  {isSubscribing ? (language === 'hi' ? 'सब्सक्राइब हो रहा है...' : 'SUBSCRIBING...') : (mounted ? t('subscribe_free') : TRANSLATIONS.hi.subscribe_free)}
                </span>
              </button>
            </div>
            <p className={`text-[10px] text-zinc-500 leading-relaxed ${language === 'hi' ? 'font-hindi text-xs opacity-60' : 'uppercase tracking-widest'}`}>
              {mounted ? t('agree_terms') : TRANSLATIONS.hi.agree_terms}
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className={`text-zinc-500 font-bold ${language === 'hi' ? 'font-hindi text-sm tracking-normal' : 'text-[11px] uppercase tracking-widest'}`}>
            © {currentYear} {t('made_for_india')}
          </p>
          <div className={`flex items-center gap-8 text-zinc-500/80 ${language === 'hi' ? 'font-hindi-tiro text-sm font-medium' : 'text-[11px] font-bold uppercase tracking-widest'}`}>
            <span>{language === 'hi' ? 'दृश्यम न्यूज नेटवर्क द्वारा भारत में गर्व से निर्मित' : 'PROUDLY MADE IN INDIA BY DRISHYAM NEWS NETWORK'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
