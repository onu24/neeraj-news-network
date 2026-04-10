'use client';

import { Facebook, Twitter, MessageCircle, Link2, Check } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface SocialShareSideProps {
  title: string;
  url: string;
}

export function SocialShareSide({ title, url }: SocialShareSideProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + fullUrl)}`,
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">
        {t('social_share')}
      </h3>
      <div className="flex flex-wrap lg:flex-col gap-3">
        {/* WhatsApp */}
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 bg-[#25D366] text-white rounded-sm hover:opacity-90 transition-opacity flex-1 lg:flex-none"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-widest lg:hidden xl:block">WhatsApp</span>
        </a>

        {/* Facebook */}
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 bg-[#1877F2] text-white rounded-sm hover:opacity-90 transition-opacity flex-1 lg:flex-none"
        >
          <Facebook className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-widest lg:hidden xl:block">Facebook</span>
        </a>

        {/* Twitter/X */}
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 bg-black text-white rounded-sm hover:opacity-90 transition-opacity flex-1 lg:flex-none"
        >
          <Twitter className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-widest lg:hidden xl:block">X (Twitter)</span>
        </a>

        {/* Copy Link */}
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-3 px-4 py-3 bg-zinc-100 text-zinc-900 border border-zinc-200 rounded-sm hover:bg-zinc-200 transition-colors flex-1 lg:flex-none"
        >
          {copied ? <Check className="h-5 w-5 text-green-600" /> : <Link2 className="h-5 w-5" />}
          <span className="text-xs font-bold uppercase tracking-widest lg:hidden xl:block">
            {copied ? 'Copied' : 'Copy Link'}
          </span>
        </button>
      </div>
    </div>
  );
}
