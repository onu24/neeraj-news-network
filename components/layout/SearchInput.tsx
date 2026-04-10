'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NewsArticle } from '@/lib/types';
import { searchArticles } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';

export function SearchInput() {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NewsArticle[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isActive = true;
    const delayDebounceFn = setTimeout(async () => {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length >= 2) {
        setIsLoading(true);
        const data = await searchArticles(trimmedQuery);
        if (!isActive) return;
        setResults(data.slice(0, 5)); // Show top 5 in suggest
        setIsLoading(false);
      } else {
        setResults([]);
        setIsLoading(false);
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(delayDebounceFn);
    };
  }, [query]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
    }
  };

  return (
    <div className="relative w-full max-w-sm ml-auto" ref={dropdownRef}>
      <form onSubmit={handleSearch} className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={t('search_placeholder')}
          suppressHydrationWarning
          className={`w-full bg-secondary placeholder:text-muted-foreground text-foreground px-4 py-2 rounded-full text-sm border-transparent focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all pl-10 pr-10 ${language === 'hi' ? 'font-hindi' : ''}`}
        />
        <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
        
        {query && (
          <button 
            type="button" 
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {isFocused && (query.trim().length >= 2 || results.length > 0) && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-background border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-3 py-2">
                  {language === 'hi' ? 'खबरों की सूची' : 'Articles List'}
                </p>
                {results.map((article) => {
                  const displayTitle = (language === 'hi' && article.title_hi) ? article.title_hi : article.title;
                  return (
                    <Link
                      key={article.id}
                      href={`/article/${article.slug}`}
                      onClick={() => setIsFocused(false)}
                      className="flex items-start gap-3 p-2 hover:bg-secondary rounded-lg transition-colors group"
                    >
                      <div className="relative w-12 h-12 shrink-0 rounded-md overflow-hidden bg-muted">
                          {article.coverImage && (
                             <Image 
                              src={article.coverImage} 
                              alt="" 
                              fill 
                              className="object-cover" 
                            />
                          )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold leading-tight line-clamp-2 font-serif group-hover:text-primary transition-colors ${language === 'hi' ? 'font-hindi' : ''}`}>
                          {displayTitle}
                        </h4>
                        <p className={`text-[10px] text-muted-foreground mt-1 capitalize ${language === 'hi' ? 'font-hindi' : ''}`}>
                          {language === 'hi' ? article.category_hi : article.category}
                        </p>
                      </div>
                    </Link>
                  );
                })}
                
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => setIsFocused(false)}
                  className="flex items-center justify-between p-3 mt-1 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold rounded-lg transition-colors"
                >
                  {t('view_all')}
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : query.trim().length >= 2 ? (
               <div className="py-8 px-4 text-center">
                  <p className="text-sm text-muted-foreground">{t('no_results')} <span className="font-bold text-foreground">"{query}"</span></p>
               </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
