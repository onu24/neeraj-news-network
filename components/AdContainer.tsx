'use client';

import { useEffect, useRef } from 'react';

interface AdContainerProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: boolean;
  className?: string;
  client?: string; // Optional: specify if different from the one in layout, but typically use default
}

export function AdContainer({ 
  slot, 
  format = 'auto', 
  responsive = true, 
  className = '',
  client = process.env.NEXT_PUBLIC_ADSENSE_ID || 'ca-pub-XXXXXXXXXXXXXXXX' 
}: AdContainerProps) {
  const adRef = useRef<HTMLModElement>(null);
  
  useEffect(() => {
    // Check if the ad has already been filled. AdSense injects an iframe and sets data-adsbygoogle-status="done".
    // This prevents "adsbygoogle.push() error: All ins elements in the DOM with class=adsbygoogle already have ads in them."
    if (adRef.current && !adRef.current.hasChildNodes()) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error("AdSense initialization failed:", error);
      }
    }
  }, [slot]);

  return (
    <div className={`w-full flex items-center justify-center my-6 text-center ${className}`}>
      {/* Editorial Wrapper for the ad */}
      <div className="w-full relative bg-secondary/20 border border-border/40 p-1 md:p-2 rounded-sm relative overflow-hidden flex flex-col items-center justify-center min-h-[100px]">
        <span className="absolute top-0 right-1 text-[8px] sm:text-[10px] uppercase tracking-widest text-muted-foreground/60">
          Advertisement
        </span>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minWidth: '250px' }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </div>
  );
}
