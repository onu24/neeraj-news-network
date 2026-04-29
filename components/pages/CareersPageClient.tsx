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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-10">
        <section className="border-b border-border pb-8">
          <h1 className="font-serif text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            {t.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-3xl">
            {t.subtitle}
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
            <Users className="h-6 w-6 text-primary mb-3" />
            <h2 className="font-serif text-xl font-bold mb-2">{t.culture.people.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.culture.people.desc}
            </p>
          </div>
          <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
            <Sparkles className="h-6 w-6 text-primary mb-3" />
            <h2 className="font-serif text-xl font-bold mb-2">{t.culture.standards.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.culture.standards.desc}
            </p>
          </div>
          <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
            <HeartHandshake className="h-6 w-6 text-primary mb-3" />
            <h2 className="font-serif text-xl font-bold mb-2">{t.culture.impact.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.culture.impact.desc}
            </p>
          </div>
        </section>

        <section className="bg-background border border-border rounded-xl p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <BriefcaseBusiness className="h-6 w-6 text-primary" />
            <h2 className="font-serif text-2xl font-bold">{t.currentOpenings}</h2>
          </div>

          <div className="space-y-4">
            {openings.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                {t.noOpenings}
              </p>
            ) : (
              openings.map((opening) => (
                <div
                  key={opening.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-border rounded-lg p-4"
                >
                  <div>
                    <h3 className="font-bold text-foreground">{opening.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {opening.location} • {opening.type}
                    </p>
                  </div>
                  <Link
                    href={`/careers/${opening.slug}`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest rounded-sm hover:bg-black transition-colors"
                  >
                    {t.viewRole}
                  </Link>
                </div>
              ))
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed pt-4">
            {t.contactDesc}{' '}
            <a href="mailto:careers@drishyamnews.in" className="text-primary hover:underline font-semibold">
              careers@drishyamnews.in
            </a>{' '}
            {t.contactAction}
          </p>
        </section>
      </div>
    </main>
  );
}
