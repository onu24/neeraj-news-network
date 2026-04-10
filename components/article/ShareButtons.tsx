'use client';

import { Share2, Twitter, Facebook, Link2, MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const siteOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://drishyam-news.com');
  const fullUrl = url.startsWith('http') ? url : `${siteOrigin}${url}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: 'X',
      icon: <Twitter className="h-4 w-4" />,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`,
      color: 'hover:bg-black hover:text-white',
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="h-4 w-4" />,
      href: `https://wa.me/?text=${encodeURIComponent(title + ' ' + fullUrl)}`,
      color: 'hover:bg-[#25D366] hover:text-white',
    },
    {
      name: 'Facebook',
      icon: <Facebook className="h-4 w-4" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
      color: 'hover:bg-[#1877F2] hover:text-white',
    },
  ];

  return (
    <div className="flex flex-col gap-4 py-8 border-y border-border my-8">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Share2 className="h-3 w-3" />
          Share this story
        </span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${link.color}`}
          >
            {link.icon}
            {link.name}
          </a>
        ))}
        
        <button
          suppressHydrationWarning
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
            copied ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'hover:bg-secondary'
          }`}
        >
          <Link2 className="h-4 w-4" />
          {copied ? 'Link Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  );
}
