'use client';

import { BriefcaseBusiness, HeartHandshake, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { JobOpening } from '@/lib/types';

export function CareersPageClient({ openings }: { openings: JobOpening[] }) {
  const { language } = useLanguage();

  const text = {
    en: {
      title: 'Careers at Drishyam News',
      subtitle: 'We are building a newsroom for courageous, public-interest journalism. If you care about truth, impact, and storytelling, we would love to meet you.',
      culture: {
        people: {
          title: 'People First',
          desc: 'We support a collaborative newsroom culture with learning, mentorship, and ownership.'
        },
        standards: {
          title: 'High Standards',
          desc: 'We value accuracy, fairness, speed, and editorial integrity in every story we publish.'
        },
        impact: {
          title: 'Real Impact',
          desc: 'Your work will inform citizens, shape conversations, and hold power to account.'
        }
      },
      currentOpenings: 'Current Openings',
      noOpenings: 'There are no open positions at the moment. Please check back later.',
      viewRole: 'View Role',
      contactDesc: 'Do not see a matching role? Send your resume and portfolio to',
      contactAction: 'and tell us how you can contribute.',
    },
    hi: {
      title: 'दृश्यम न्यूज़ में करियर',
      subtitle: 'हम जनहित की साहसिक पत्रकारिता के लिए एक न्यूज़ रूम बना रहे हैं। यदि आपको सच्चाई, प्रभाव और कहानी कहने की परवाह है, तो हमें आपसे मिलकर खुशी होगी।',
      culture: {
        people: {
          title: 'पीपल फर्स्ट',
          desc: 'हम सीखने, सलाह देने और स्वामित्व के साथ एक सहयोगी न्यूज़ रूम संस्कृति का समर्थन करते हैं।'
        },
        standards: {
          title: 'उच्च मानक',
          desc: 'हम जो भी कहानी प्रकाशित करते हैं, उसमें सटीकता, निष्पक्षता, गति और संपादकीय अखंडता को महत्व देते हैं।'
        },
        impact: {
          title: 'वास्तविक प्रभाव',
          desc: 'आपका काम नागरिकों को सूचित करेगा, बातचीत को आकार देगा और सत्ता को जवाबदेह ठहराएगा।'
        }
      },
      currentOpenings: 'वर्तमान रिक्तियां',
      noOpenings: 'इस समय कोई रिक्त पद नहीं हैं। कृपया बाद में जांचें।',
      viewRole: 'भूमिका देखें',
      contactDesc: 'क्या आपको कोई मेल खाने वाली भूमिका नहीं दिख रही है? अपना रिज्यूमे और पोर्टफोलियो भेजें',
      contactAction: 'और हमें बताएं कि आप कैसे योगदान दे सकते हैं।',
    }
  };

  const t = text[language as keyof typeof text] || text.en;

  return (
    <main className="flex-1 bg-secondary/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-20 space-y-12">
        <section className="text-center sm:text-left space-y-4">
          <h1 className="font-serif text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            {t.title}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto sm:mx-0">
            {t.subtitle}
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-background border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Users size={20} />
            </div>
            <h2 className="font-serif text-xl font-bold mb-2">{t.culture.people.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.culture.people.desc}
            </p>
          </div>
          <div className="bg-background border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Sparkles size={20} />
            </div>
            <h2 className="font-serif text-xl font-bold mb-2">{t.culture.standards.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.culture.standards.desc}
            </p>
          </div>
          <div className="bg-background border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <HeartHandshake size={20} />
            </div>
            <h2 className="font-serif text-xl font-bold mb-2">{t.culture.impact.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.culture.impact.desc}
            </p>
          </div>
        </section>

        <section className="bg-background border border-border/60 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8">
          <div className="flex items-center gap-3 border-b border-border pb-6">
            <BriefcaseBusiness className="h-6 w-6 text-primary" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">{t.currentOpenings}</h2>
          </div>

          <div className="space-y-4">
            {openings.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground italic">
                  {t.noOpenings}
                </p>
              </div>
            ) : (
              openings.map((opening) => (
                <div
                  key={opening.id}
                  className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-border/50 rounded-xl p-5 hover:border-primary/30 hover:bg-primary/5 transition-all"
                >
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{opening.title}</h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <span className="bg-secondary px-2 py-0.5 rounded-sm uppercase tracking-wider">{opening.location}</span>
                      <span>•</span>
                      <span className="uppercase tracking-wider">{opening.type}</span>
                    </div>
                  </div>
                  <Link
                    href={`/careers/${opening.slug}`}
                    className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest rounded-sm hover:bg-black transition-colors sm:w-auto w-full"
                  >
                    {t.viewRole}
                  </Link>
                </div>
              ))
            )}
          </div>

          <div className="bg-secondary/20 rounded-xl p-6 border border-border/40">
            <p className="text-sm text-muted-foreground leading-relaxed text-center sm:text-left">
              {t.contactDesc}{' '}
              <a href="mailto:careers@drishyamnews.in" className="text-primary hover:underline font-bold">
                careers@drishyamnews.in
              </a>{' '}
              {t.contactAction}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
