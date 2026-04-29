'use client';

import { useLanguage } from '@/components/providers/LanguageProvider';
import { Mail, MapPin, Phone, Send, Loader2 } from 'lucide-react';
import { ContactPageContent } from '@/lib/types';
import { useEffect, useState, useRef } from 'react';
import { submitContactForm } from '@/lib/actions/contact';
import { toast } from 'sonner';

interface ContactPageClientProps {
  content: ContactPageContent;
}

export function ContactPageClient({ content }: ContactPageClientProps) {
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      const result = await submitContactForm(formData);
      if (result.success) {
        toast.success(language === 'hi' ? 'संदेश सफलतापूर्वक भेजा गया!' : 'Message sent successfully!');
        formRef.current?.reset();
      } else {
        toast.error(result.error || 'Failed to send message');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isHindi = language === 'hi';

  // Content Selection Logic
  const heroTitle = (isHindi && mounted && content.heroTitle_hi) ? content.heroTitle_hi : content.heroTitle;
  const heroSubtitle = (isHindi && mounted && content.heroSubtitle_hi) ? content.heroSubtitle_hi : content.heroSubtitle;
  const address = (isHindi && mounted && content.address_hi) ? content.address_hi : content.address;
  const extraInfo = (isHindi && mounted && content.extraInfo_hi) ? content.extraInfo_hi : content.extraInfo;

  // Split multi-line fields into individual lines
  const emailLines = content.email.split('\n').map((l) => l.trim()).filter(Boolean);

  return (
    <main className="flex-1 w-full bg-secondary/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Page heading */}
        <div className="mb-10 border-b-2 border-foreground/10 pb-6 relative">
          <h1 className={`text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight ${isHindi ? 'font-hindi-serif' : 'font-serif'}`}>
            {heroTitle}
          </h1>
          {heroSubtitle && (
            <p className={`mt-3 text-lg text-muted-foreground leading-relaxed max-w-2xl ${isHindi ? 'font-hindi' : ''}`}>
              {heroSubtitle}
            </p>
          )}
          <div className="absolute -bottom-[2px] left-0 w-16 border-b-2 border-primary"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Contact details */}
          <div className="space-y-8">

            {/* Email */}
            {emailLines.length > 0 && (
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-background/50 transition-colors">
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm uppercase tracking-wider mb-1 ${isHindi ? 'font-hindi-label' : ''}`}>
                    {t('email')}
                  </h3>
                  <div className="text-muted-foreground text-sm font-medium">
                    {emailLines.map((line, i) => (
                      <a key={i} href={`mailto:${line}`} className="hover:text-primary transition-colors block">
                        {line}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Phone */}
            {content.phone && (
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-background/50 transition-colors">
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm uppercase tracking-wider mb-1 ${isHindi ? 'font-hindi-label' : ''}`}>
                    {t('phone')}
                  </h3>
                  <a href={`tel:${content.phone}`} className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors">
                    {content.phone}
                  </a>
                </div>
              </div>
            )}

            {/* Address */}
            {address && (
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-background/50 transition-colors">
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm uppercase tracking-wider mb-1 ${isHindi ? 'font-hindi-label' : ''}`}>
                    {t('office')}
                  </h3>
                  <p className={`text-muted-foreground text-sm font-medium whitespace-pre-line ${isHindi ? 'font-hindi' : ''}`}>
                    {address}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Contact form */}
          <form 
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-5 bg-background border border-border/60 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <label htmlFor="name" className={`block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ${isHindi ? 'font-hindi-label text-xs' : ''}`}>
                {t('name')}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder={t('name_placeholder')}
                className={`w-full bg-secondary/50 placeholder:text-muted-foreground/60 text-foreground px-4 py-3 rounded-xl text-sm border border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all ${isHindi ? 'font-hindi' : ''}`}
              />
            </div>

            <div>
              <label htmlFor="email" className={`block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ${isHindi ? 'font-hindi-label text-xs' : ''}`}>
                {t('email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className={`w-full bg-secondary/50 placeholder:text-muted-foreground/60 text-foreground px-4 py-3 rounded-xl text-sm border border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all ${isHindi ? 'font-hindi' : ''}`}
              />
            </div>

            <div>
              <label htmlFor="subject" className={`block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ${isHindi ? 'font-hindi-label text-xs' : ''}`}>
                {t('subject')}
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                placeholder={t('subject_placeholder')}
                className={`w-full bg-secondary/50 placeholder:text-muted-foreground/60 text-foreground px-4 py-3 rounded-xl text-sm border border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all ${isHindi ? 'font-hindi' : ''}`}
              />
            </div>

            <div>
              <label htmlFor="message" className={`block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ${isHindi ? 'font-hindi-label text-xs' : ''}`}>
                {t('message')}
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                placeholder={t('message_placeholder')}
                className={`w-full bg-secondary/50 placeholder:text-muted-foreground/60 text-foreground px-4 py-3 rounded-xl text-sm border border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all resize-none ${isHindi ? 'font-hindi' : ''}`}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest px-8 py-4 rounded-xl hover:-translate-y-0.5 hover:shadow-lg active:scale-95 disabled:opacity-70 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 ${isHindi ? 'font-hindi-serif text-sm' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {isHindi ? 'भेज रहा है...' : 'SENDING...'}
                </>
              ) : (
                <>
                  <Send size={16} />
                  {t('send_message')}
                </>
              )}
            </button>

            {extraInfo && (
              <p className={`text-[10px] text-muted-foreground text-center whitespace-pre-line leading-relaxed ${isHindi ? 'font-hindi text-xs' : ''}`}>
                {extraInfo}
              </p>
            )}
          </form>

        </div>
      </div>
    </main>
  );
}
