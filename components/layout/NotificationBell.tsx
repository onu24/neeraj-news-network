'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface NotificationArticle {
  id: string;
  title: string;
  title_hi?: string;
  slug: string;
  coverImage?: string;
  createdAt: string;
  category: string;
}

export function NotificationBell() {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [articles, setArticles] = useState<NotificationArticle[]>([]);
  const [hasNew, setHasNew] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications/recent');
      const data = await res.json();
      if (data.articles) {
        setArticles(data.articles);
        
        const lastChecked = localStorage.getItem('notifications_last_checked');
        if (data.articles.length > 0) {
          const newestTime = new Date(data.articles[0].createdAt).getTime();
          if (!lastChecked || newestTime > parseInt(lastChecked)) {
            setHasNew(true);
          }
        }
      }
    } catch (err) {
      console.error('[NotificationBell] Fetch error:', err);
    }
  };

  const checkPushSubscription = async () => {
    // Detect iOS and Standalone mode
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iOS);
    
    const standalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && (window.navigator as any).standalone === true);
    setIsStandalone(standalone);

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsPushSupported(true);
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    setIsSubscribing(true);
    try {
      // 1. Register Service Worker
      await navigator.serviceWorker.register('/sw.js');
      const registration = await navigator.serviceWorker.ready;

      // 2. Subscribe
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error('VAPID Public Key missing');

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // 3. Send to Server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      setIsSubscribed(true);
    } catch (err) {
      console.error('[NotificationBell] Push subscription failed:', err);
    } finally {
      setIsSubscribing(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setIsSubscribing(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        // Optionally notify server
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error('[NotificationBell] Unsubscribe failed:', err);
    } finally {
      setIsSubscribing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    checkPushSubscription();
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!isOpen && hasNew) {
      setHasNew(false);
      localStorage.setItem('notifications_last_checked', Date.now().toString());
    }
    setIsOpen(!isOpen);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        aria-label="Notifications"
        onClick={handleToggle}
        suppressHydrationWarning
        className={`group/bell transition-all p-2.5 rounded-full relative active:scale-90 ${
          isOpen ? 'bg-primary text-white shadow-lg' : 'bg-secondary/50 text-foreground/70 hover:text-primary'
        }`}
      >
        <Bell className={`h-5 w-5 ${isOpen ? '' : 'group-hover/bell:animate-ring'}`} />
        {hasNew && (
          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background animate-pulse"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-80 sm:w-96 bg-background border border-border shadow-2xl rounded-2xl overflow-hidden z-50 origin-top-right"
          >
            <div className="p-4 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm uppercase tracking-widest text-foreground">
                  {t('latest_updates') || 'Latest Updates'}
                </h3>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-black">
                  {articles.length} NEW
                </span>
              </div>
              
              {(isPushSupported || (isIOS && !isStandalone)) && (
                <div className="flex flex-col gap-2 bg-background/50 p-2.5 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-tighter">Push Notifications</span>
                      <span className="text-[9px] text-muted-foreground">Get lock screen alerts</span>
                    </div>
                    {isPushSupported ? (
                      <button
                        onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
                        disabled={isSubscribing}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                          isSubscribed 
                            ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600' 
                            : 'bg-primary text-white hover:bg-primary/90'
                        } disabled:opacity-50`}
                      >
                        {isSubscribing ? '...' : (isSubscribed ? 'Enabled' : 'Enable')}
                      </button>
                    ) : (
                      <span className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-[9px] font-black uppercase">Action Needed</span>
                    )}
                  </div>
                  {isIOS && !isStandalone && (
                    <div className="mt-1 p-2 rounded-lg bg-secondary/50 text-[10px] leading-tight text-foreground/80 border border-border/50">
                      <strong>iOS User:</strong> To enable lock screen notifications, tap the <strong className="text-primary">Share</strong> button at the bottom of Safari and select <strong className="text-primary">Add to Home Screen</strong>.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
              {articles.length > 0 ? (
                articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex gap-4 p-4 hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0 group"
                  >
                    <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-secondary">
                      {article.coverImage && (
                        <Image
                          src={article.coverImage}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      )}
                    </div>
                    <div className="flex flex-col justify-center gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase text-primary tracking-tighter">
                          {article.category}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span className="text-[9px] text-muted-foreground font-medium flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {formatTime(article.createdAt)}
                        </span>
                      </div>
                      <h4 className={`text-sm font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 ${language === 'hi' ? 'font-hindi' : ''}`}>
                        {language === 'hi' ? (article.title_hi || article.title) : article.title}
                      </h4>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-12 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground italic">No new updates yet.</p>
                </div>
              )}
            </div>

            <Link
              href="/latest"
              onClick={() => setIsOpen(false)}
              className="p-4 bg-secondary/10 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-white transition-all"
            >
              See all news
              <ArrowRight className="h-3 w-3" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
