'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NewsArticle } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { motion, AnimatePresence } from 'framer-motion';

export function SearchInput() {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NewsArticle[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isActive = true;
    const delayDebounceFn = setTimeout(async () => {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length >= 2) {
        setIsLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`);
        const data: NewsArticle[] = await res.json();
        if (!isActive) return;
        setResults(data.slice(0, 5));
        setSelectedIndex(-1);
        setIsLoading(false);
      } else {
        setResults([]);
        setSelectedIndex(-1);
        setIsLoading(false);
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(delayDebounceFn);
    };
  }, [query]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      if (selectedIndex === results.length) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      } else {
        router.push(`/article/${results[selectedIndex].slug}`);
      }
      setIsFocused(false);
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
    }
  };

  const dropdownOpen = isFocused && (query.trim().length >= 2 || results.length > 0);

  return (
    <div className="relative w-full max-w-sm ml-auto" ref={dropdownRef}>
      <form onSubmit={handleSearch} className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={t('search_placeholder')}
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
          aria-controls="search-results"
          autoComplete="off"
          suppressHydrationWarning
          className={`w-full bg-secondary placeholder:text-muted-foreground text-foreground px-4 py-2.5 rounded-full text-sm border border-transparent focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all pl-10 pr-10 ${language === 'hi' ? 'font-hindi' : ''}`}
        />
        <Search className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
        
        <AnimatePresence>
          {query && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button" 
              onClick={() => { setQuery(''); setResults([]); }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
            >
              <X size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence mode="wait">
        {dropdownOpen && (
          <motion.div 
            id="search-results"
            role="listbox"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full mt-2 left-0 right-0 bg-background border border-border rounded-xl shadow-2xl overflow-hidden z-50 origin-top"
          >
            <div className="p-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground px-3 py-2">
                    {language === 'hi' ? 'लेख सूची' : 'Articles List'}
                  </p>
                  {results.map((article, index) => {
                    const displayTitle = (language === 'hi' && article.title_hi && article.title_hi.trim() !== '') ? article.title_hi : article.title;
                    const isSelected = selectedIndex === index;
                    return (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={`/article/${article.slug}`}
                          onClick={() => setIsFocused(false)}
                          className={`flex items-start gap-3 p-2 rounded-lg transition-all group ${isSelected ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : 'hover:bg-secondary'}`}
                        >
                          <div className="relative w-12 h-12 shrink-0 rounded-md overflow-hidden bg-muted border border-border/10">
                              {article.coverImage && (
                                 <Image 
                                  src={article.coverImage} 
                                  alt="" 
                                  fill 
                                  sizes="48px"
                                  className="object-cover group-hover:scale-110 transition-transform duration-500" 
                                />
                              )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-bold leading-tight line-clamp-2 font-serif transition-colors ${isSelected ? 'text-primary' : 'group-hover:text-primary'} ${language === 'hi' ? 'font-hindi' : ''}`}>
                              {displayTitle}
                            </h4>
                            <p className={`text-[10px] text-muted-foreground mt-1 capitalize font-bold tracking-wider ${language === 'hi' ? 'font-hindi' : ''}`}>
                              {language === 'hi' ? article.category_hi : article.category}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}`}
                      onClick={() => setIsFocused(false)}
                      className={`flex items-center justify-between p-3 mt-1 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${selectedIndex === results.length ? 'bg-primary text-white' : 'bg-primary/5 hover:bg-primary/10 text-primary'}`}
                    >
                      {t('view_all')}
                      <ArrowRight size={14} className={selectedIndex === results.length ? 'translate-x-1 transition-transform' : ''} />
                    </Link>
                  </motion.div>
                </div>
              ) : query.trim().length >= 2 ? (
                 <div className="py-12 px-4 text-center">
                    <p className="text-sm text-muted-foreground font-medium">{t('no_results')} <span className="font-bold text-foreground">"{query}"</span></p>
                 </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
