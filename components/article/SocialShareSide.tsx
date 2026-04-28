'use client';

import { Facebook, Twitter, Link2, Check, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';

// Authentic WhatsApp SVG for a more premium look
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

interface SocialShareSideProps {
  title: string;
  url: string;
  slug?: string;
}

export function SocialShareSide({ title, url, slug }: SocialShareSideProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [fullUrl, setFullUrl] = useState(url);

  const trackShare = () => {
    if (!slug) return;
    fetch(`/api/articles/${encodeURIComponent(slug)}/share`, {
      method: 'POST',
    }).catch(err => console.error('[ShareTrackerSide] Failed:', err));
  };

  useEffect(() => {
    setFullUrl(`${window.location.origin}${url}`);
  }, [url]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    trackShare();
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + fullUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="h-[2px] w-8 bg-primary rounded-full" />
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          {t('social_share')}
        </h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
        {/* WhatsApp - THE PRIMARY ACTION */}
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackShare}
          suppressHydrationWarning
          className="group relative flex items-center gap-4 px-5 py-4 bg-[#25D366] text-white rounded-2xl overflow-hidden shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 active:scale-95 transition-all duration-500"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <WhatsAppIcon className="h-6 w-6 relative z-10 drop-shadow-md" />
          <div className="flex flex-col relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">Send to</span>
            <span className="text-sm font-bold tracking-tight leading-none">WhatsApp</span>
          </div>
        </a>

        {/* Facebook */}
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackShare}
          suppressHydrationWarning
          className="group relative flex items-center gap-4 px-5 py-4 bg-[#1877F2] text-white rounded-2xl overflow-hidden shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 active:scale-95 transition-all duration-500"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Facebook className="h-6 w-6 relative z-10 drop-shadow-md" />
          <div className="flex flex-col relative z-10">
             <span className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">Post on</span>
             <span className="text-sm font-bold tracking-tight leading-none">Facebook</span>
          </div>
        </a>

        {/* Telegram - Added for better reach */}
        <a
          href={shareLinks.telegram}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackShare}
          suppressHydrationWarning
          className="group relative flex items-center gap-4 px-5 py-4 bg-[#0088cc] text-white rounded-2xl overflow-hidden shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:-translate-y-1 active:scale-95 transition-all duration-500"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Send className="h-6 w-6 relative z-10 drop-shadow-md" />
          <div className="flex flex-col relative z-10">
             <span className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">Forward to</span>
             <span className="text-sm font-bold tracking-tight leading-none">Telegram</span>
          </div>
        </a>

        {/* Twitter/X */}
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackShare}
          suppressHydrationWarning
          className="group relative flex items-center gap-4 px-5 py-4 bg-zinc-950 text-white rounded-2xl overflow-hidden shadow-lg shadow-black/20 hover:shadow-black/40 hover:-translate-y-1 active:scale-95 transition-all duration-500 border border-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Twitter className="h-6 w-6 relative z-10 drop-shadow-md" />
          <div className="flex flex-col relative z-10">
             <span className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">Tweet on</span>
             <span className="text-sm font-bold tracking-tight leading-none">X / Twitter</span>
          </div>
        </a>

        {/* Copy Link - Refined */}
        <button
          onClick={copyToClipboard}
          suppressHydrationWarning
          className={`group relative flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-500 hover:-translate-y-1 active:scale-95 overflow-hidden ${
            copied 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-xl shadow-emerald-500/20' 
            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm hover:shadow-xl hover:border-primary/20'
          }`}
        >
          {copied ? (
            <Check className="h-6 w-6 animate-in zoom-in duration-300 relative z-10" />
          ) : (
            <Link2 className="h-6 w-6 group-hover:rotate-45 transition-transform duration-500 relative z-10" />
          )}
          <div className="flex flex-col text-left relative z-10">
             <span className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">Direct Link</span>
             <span className="text-sm font-bold tracking-tight leading-none">
                {copied ? 'Link Copied!' : 'Copy to Clipboard'}
             </span>
          </div>
        </button>
      </div>
    </div>
  );
}
