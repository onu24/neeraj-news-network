'use client';

import { BriefcaseBusiness, MapPin, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { ApplicationForm } from '@/components/careers/ApplicationForm';
import { JobOpening } from '@/lib/types';

export function JobDetailsClient({ job }: { job: JobOpening }) {
  const { language } = useLanguage();

  const text = {
    en: {
      back: 'Back to all openings',
      applyTitle: 'Apply for this position',
    },
    hi: {
      back: 'सभी रिक्तियों पर वापस जाएं',
      applyTitle: 'इस पद के लिए आवेदन करें',
    }
  };

  const t = text[language as keyof typeof text] || text.en;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <div className="mb-6">
        <Link href="/careers" className="text-sm font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
          <ArrowLeft size={16} /> {t.back}
        </Link>
      </div>

      <div className="bg-background border border-border rounded-xl p-8 shadow-sm mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
          {job.title}
        </h1>
        
        <div className="flex flex-wrap gap-4 text-sm font-medium text-muted-foreground mb-8">
          <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-md">
            <MapPin size={16} /> {job.location}
          </div>
          <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-md">
            <Clock size={16} /> {job.type}
          </div>
        </div>

        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 text-foreground">
          <div dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br />') }} />
        </div>

        <div className="border-t border-border pt-8 mt-8 text-foreground">
          <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-3">
            <BriefcaseBusiness className="text-primary" size={24} /> 
            {t.applyTitle}
          </h2>
          <ApplicationForm jobId={job.id} jobTitle={job.title} />
        </div>
      </div>
    </div>
  );
}
