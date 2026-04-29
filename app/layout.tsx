import type { Metadata } from 'next'
import {
  Geist,
  Geist_Mono,
  Lora,
  Noto_Sans_Devanagari,
  Roboto,
  Poppins,
  Merriweather,
  Playfair_Display,
} from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import Script from 'next/script'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const _geist = Geist({ subsets: ["latin"], variable: '--font-sans' });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: '--font-mono' });
const _lora = Lora({ subsets: ["latin"], variable: '--font-serif' });
const _noto = Noto_Sans_Devanagari({ weight: ['400', '500', '600', '700'], subsets: ["devanagari"], variable: '--font-hindi' });
const _roboto = Roboto({ weight: ['400', '500', '700'], subsets: ['latin'], variable: '--font-roboto' });
const _poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-poppins' });
const _merriweather = Merriweather({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-merriweather',
});
const _playfair = Playfair_Display({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://drishyam-news.com'),
  title: {
    default: 'Drishyam News - Breaking News & Analysis',
    template: '%s | Drishyam News',
  },
  description: 'Latest news, breaking stories, and in-depth analysis from Drishyam News',
  keywords: ['news', 'india', 'politics', 'economy', 'technology', 'sports'],
  authors: [{ name: 'Drishyam Editorial' }],
  creator: 'Drishyam News',
  publisher: 'Drishyam News',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://drishyam-news.com',
    siteName: 'Drishyam News',
    title: 'Drishyam News - Breaking News & Analysis',
    description: 'Latest news, breaking stories, and in-depth analysis from Drishyam News',
    images: [
      {
        url: '/og-image.jpg', // Should be created
        width: 1200,
        height: 630,
        alt: 'Drishyam News Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Drishyam News - Breaking News & Analysis',
    description: 'Latest news, breaking stories, and in-depth analysis from Drishyam News',
    images: ['/og-image.jpg'],
    creator: '@drishyamnews',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
}

import { LanguageProvider } from '@/components/providers/LanguageProvider'
import { BackToTop } from '@/components/layout/BackToTop'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${_lora.variable} ${_geist.variable} ${_geistMono.variable} ${_noto.variable} ${_roboto.variable} ${_poppins.variable} ${_merriweather.variable} ${_playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground tracking-tight" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <LanguageProvider>
            {children}
            <BackToTop />
          </LanguageProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
