'use client';

import { useState, useEffect } from 'react';
import { submitApplication } from '@/lib/actions/careers';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

export function ApplicationForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  // Fix hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const text = {
    en: {
      successTitle: 'Application Submitted Successfully',
      successDesc: 'Thank you for applying to Drishyam News. Our team will review your application and get back to you soon.',
      nameLabel: 'Full Name *',
      emailLabel: 'Email Address *',
      phoneLabel: 'Phone Number (Optional)',
      coverLabel: 'Cover Letter / Note *',
      resumeLabel: 'Resume (PDF or Word) *',
      uploadClick: 'Click to upload your resume',
      uploadHint: 'PDF or Word files only, max 5MB',
      submitBtn: 'Submit Application',
      submittingBtn: 'Submitting Application...',
      errorGeneral: 'Failed to submit application. Please try again.',
    },
    hi: {
      successTitle: 'आवेदन सफलतापूर्वक जमा किया गया',
      successDesc: 'दृश्यम न्यूज़ में आवेदन करने के लिए धन्यवाद। हमारी टीम आपके आवेदन की समीक्षा करेगी और जल्द ही आपसे संपर्क करेगी।',
      nameLabel: 'पूरा नाम *',
      emailLabel: 'ईमेल पता *',
      phoneLabel: 'फ़ोन नंबर (वैकल्पिक)',
      coverLabel: 'कवर लेटर / नोट *',
      resumeLabel: 'रिज्यूमे (पीडीएफ या वर्ड) *',
      uploadClick: 'अपना रिज्यूमे अपलोड करने के लिए क्लिक करें',
      uploadHint: 'केवल पीडीएफ या वर्ड फाइलें, अधिकतम 5MB',
      submitBtn: 'आवेदन जमा करें',
      submittingBtn: 'आवेदन जमा हो रहा है...',
      errorGeneral: 'आवेदन जमा करने में विफल। कृपया पुन: प्रयास करें।',
    }
  };

  // Default to Hindi ('hi') on server to match LanguageProvider's fallback
  const currentLang = mounted ? (language as keyof typeof text) : 'hi';
  const t = text[currentLang] || text.hi;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.append('jobId', jobId);
    formData.append('jobTitle', jobTitle);

    const result = await submitApplication(formData);

    if (result.success) {
      setIsSuccess(true);
    } else {
      setError(result.error || t.errorGeneral);
    }
    
    setIsSubmitting(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName('');
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center animate-in fade-in duration-500">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4 text-emerald-600">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-emerald-800 mb-2">{t.successTitle}</h3>
        <p className="text-emerald-700 max-w-md mx-auto">
          {t.successDesc}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">{t.nameLabel}</label>
          <input
            required
            name="applicantName"
            suppressHydrationWarning
            className="w-full p-3 bg-secondary/30 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">{t.emailLabel}</label>
          <input
            required
            type="email"
            name="applicantEmail"
            suppressHydrationWarning
            className="w-full p-3 bg-secondary/30 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground">{t.phoneLabel}</label>
        <input
          type="tel"
          name="applicantPhone"
          suppressHydrationWarning
          className="w-full p-3 bg-secondary/30 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground">{t.coverLabel}</label>
        <textarea
          required
          name="coverLetter"
          rows={5}
          suppressHydrationWarning
          className="w-full p-3 bg-secondary/30 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground">{t.resumeLabel}</label>
        <div className="relative">
          <input
            type="file"
            name="resume"
            required
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center flex flex-col items-center justify-center bg-secondary/10 hover:bg-secondary/30 transition-colors">
            <UploadCloud size={32} className="text-muted-foreground mb-3" />
            {fileName ? (
              <p className="text-sm font-bold text-primary">{fileName}</p>
            ) : (
              <>
                <p className="text-sm font-bold text-foreground">{t.uploadClick}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.uploadHint}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        suppressHydrationWarning
        className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-3 rounded-sm text-sm font-black uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? t.submittingBtn : t.submitBtn}
      </button>
    </form>
  );
}
