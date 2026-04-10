'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface TableOfContentsProps {
  content: string;
}

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const { language, t } = useLanguage();
  const [items, setItems] = useState<TOCItem[]>([]);

  useEffect(() => {
    // Extract headers from markdown content
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    const extracted: TOCItem[] = [];

    paragraphs.forEach((p) => {
      if (p.startsWith('#')) {
        const levelMatch = p.match(/^#+/);
        if (levelMatch) {
          const level = levelMatch[0].length;
          const text = p.replace(/^#+\s/, '');
          // Create a URL-safe ID
          const id = text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
          extracted.push({ id, text, level });
        }
      }
    });

    setItems(extracted);
  }, [content]);

  if (items.length === 0) return null;

  const scrollToId = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Offset for header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-sm p-6 mb-10 overflow-hidden">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-3">
        <span className="w-6 h-[1px] bg-primary" />
        {t('table_of_contents') || (language === 'hi' ? 'लेख का सारांश' : 'Contents')}
      </h3>
      <nav className="space-y-4">
        {items.map((item, index) => (
          <a
            key={index}
            href={`#${item.id}`}
            onClick={(e) => scrollToId(e, item.id)}
            className={`block group transition-all duration-300 ${
              item.level === 1 ? 'font-bold text-sm' : 'pl-4 text-xs font-medium text-muted-foreground hover:text-primary'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">→</span>
              <span className="group-hover:translate-x-1 transition-transform">{item.text}</span>
            </div>
          </a>
        ))}
      </nav>
    </div>
  );
}
