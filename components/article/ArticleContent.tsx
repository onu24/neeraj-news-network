'use client';

import { CheckCircle2 } from 'lucide-react';
import { ArticleContentFont } from '@/lib/types';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface ArticleContentProps {
  content?: string;
  content_hi?: string;
  keyPoints?: string[];
  articleType?: string;
  contentFont?: ArticleContentFont;
}

const FONT_CLASS_MAP: Record<ArticleContentFont, string> = {
  serif: 'font-serif',
  sans: 'font-sans',
  mono: 'font-mono',
  roboto: 'font-roboto',
  poppins: 'font-poppins',
  merriweather: 'font-merriweather',
  playfair: 'font-playfair',
};

export function ArticleContent({ content, content_hi, keyPoints, articleType, contentFont = 'serif' }: ArticleContentProps) {
  const { language, t } = useLanguage();
  
  // Choose correct content based on language with fallback
  const displayContent = (language === 'hi' && content_hi && content_hi.trim() !== '') ? content_hi : (content || content_hi);
  
  if (!displayContent && (!keyPoints || keyPoints.length === 0)) return null;

  // Parse markdown-like content (simple paragraphs separated by double newlines)
  const paragraphs = displayContent?.split('\n\n').filter(p => p.trim()) || [];
  const fontClass = language === 'hi' ? 'font-hindi' : (FONT_CLASS_MAP[contentFont] || FONT_CLASS_MAP.serif);

  return (
    <div className="max-w-[700px] mx-auto">
      <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-foreground/90 prose-p:leading-[1.7] prose-p:mb-8 prose-a:text-primary prose-strong:text-foreground">
        
        {/* Key Points for Explainers */}
        {articleType === 'explainer' && keyPoints && keyPoints.length > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-600 p-8 my-10 rounded-r-md">
            <h3 className="text-blue-900 font-bold text-xl mb-4 flex items-center gap-2 m-0 font-sans">
              <CheckCircle2 className="h-5 w-5" />
              {t('key_highlights')}
            </h3>
            <ul className="space-y-3 m-0 list-none p-0">
              {keyPoints.map((point, i) => (
                <li key={i} className="text-blue-800 text-base leading-relaxed flex gap-3 p-0">
                  <span className="shrink-0 text-blue-400 mt-1.5">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {paragraphs.map((paragraph, index) => {
          // Check if it's a heading (starts with #)
          if (paragraph.startsWith('#')) {
            const levelMatch = paragraph.match(/^#+/);
            if (levelMatch) {
                const level = levelMatch[0].length;
                const text = paragraph.replace(/^#+\s/, '');
                const HeadingTag = `h${Math.min(level + 1, 6)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
                
                // Create ID for TOC matching the TOC component's logic
                const id = text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
                
                return (
                  <HeadingTag 
                    key={index} 
                    id={id}
                    className={`mt-14 mb-6 ${fontClass} font-bold text-foreground tracking-tight scroll-mt-24`}
                  >
                    {text}
                  </HeadingTag>
                );
            }
          }

          // Check for Blockquote (starts with >)
          if (paragraph.startsWith('>')) {
            const text = paragraph.replace(/^>\s/, '');
            return (
              <blockquote key={index} className={`border-l-4 border-primary pl-8 py-2 my-12 italic text-2xl sm:text-3xl ${fontClass} text-muted-foreground leading-relaxed font-serif`}>
                {text}
              </blockquote>
            );
          }

          // Regular paragraph
          return (
            <p key={index} className={`text-xl leading-[1.7] text-foreground/90 mb-8 ${fontClass} selection:bg-primary/20`}>
              {paragraph}
            </p>
          );
        })}
      </div>
    </div>
  );
}
