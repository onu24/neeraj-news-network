/**
 * lib/data.ts — Public data layer
 *
 * Uses Firebase Client SDK (works in both browser and Node.js/Server Components).
 *
 * IMPORTANT: To avoid "Missing Index" errors in Firestore, we use "Lazy Filtering":
 * We fetch the latest articles sorted by date (auto-indexed) and filter by status/type 
 * in-memory. This guarantees that your Admin-saved content appears immediately 
 * without needing manual index configuration in the Firebase Console.
 */

import { getFirestore, Firestore, initializeFirestore, doc, getDoc, query, collection, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from './firebase';
import { NewsArticle, VisualStory, Author, Category, AboutPageContent } from './types';
import { slugify, FALLBACK_IMAGE } from './utils';
import { cache } from 'react';
import { CATEGORY_FALLBACK_MAP } from './i18n';

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

/** Normalise a Firestore document into NewsArticle shape */
export function toArticle(id: string, data: Record<string, any>): NewsArticle {
  const title = data.title || 'Untitled Story';
  const category = data.category || 'News';
  const categorySlug = data.categorySlug || slugify(category);
  const contentFont = ['serif', 'sans', 'mono', 'roboto', 'poppins', 'merriweather', 'playfair'].includes(
    data.contentFont
  )
    ? data.contentFont
    : 'serif';
  const galleryImages = Array.isArray(data.galleryImages)
    ? data.galleryImages.map((img: any) => String(img)).filter(Boolean)
    : [];
  const fallback = CATEGORY_FALLBACK_MAP[categorySlug];
  
  // Global Image URL Sanitization
  const rawCover = data.coverImage || data.imageUrl || FALLBACK_IMAGE;
  const isDirectImage = rawCover && (!rawCover.includes('ibb.co/') || /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(rawCover));
  const safeCoverImage = isDirectImage ? rawCover : FALLBACK_IMAGE;

  // Slugs: Use DB slug if present, otherwise use document ID.
  // We avoid generating a virtual slug from the title here because 
  // the database query would fail to find it if it's not actually stored.
  const safeSlug = (data.slug && data.slug.trim() !== '') ? data.slug : id;

  return {
    id,
    title,
    title_hi: data.title_hi || null,
    slug: safeSlug,
    excerpt: data.excerpt || '',
    excerpt_hi: data.excerpt_hi || null,
    content: data.content || '',
    content_hi: data.content_hi || null,
    contentFont,
    category: data.category_en || fallback?.en || category,
    category_hi: data.category_hi || fallback?.hi || category,
    categoryId: data.categoryId || '',
    categorySlug,
    coverImage: safeCoverImage,
    galleryImages,
    imageUrl: safeCoverImage, 
    authorId: data.authorId || 'drishyam-editorial',
    status: data.status || 'published',
    featured: !!data.featured,
    tags: data.tags || [],
    articleType: data.articleType || 'standard',
    views: data.views || 0,
    readingTime: data.readingTime || 3,
    language: data.language || 'en',
    
    // Robust date handling
    createdAt: (() => {
      const d = data.createdAt?.toDate?.() ?? new Date(data.createdAt);
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    })(),
    updatedAt: (() => {
      const d = data.updatedAt?.toDate?.() ?? new Date(data.updatedAt || data.createdAt);
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    })(),
    
    // SEO & Engagement
    metaTitle: data.metaTitle || title,
    metaDescription: data.metaDescription || data.excerpt || '',
    isBreaking: !!data.isBreaking,
    isLive: !!data.isLive,
    keyPoints: data.keyPoints || [],
    videoUrl: data.videoUrl || '',
  } as NewsArticle;
}

/** Normalise a Firestore document into VisualStory shape */
function toVisualStory(id: string, data: Record<string, any>): VisualStory {
  const title = data.title || 'Untitled Story';

  return {
    id,
    title,
    slug: data.slug || slugify(title),
    coverImage: data.coverImage || FALLBACK_IMAGE,
    category: data.category || 'General',
    slides: Array.isArray(data.slides)
      ? data.slides.map((slide: any, idx: number) => ({
          id: slide?.id || `slide_${idx + 1}`,
          title: slide?.title || `Slide ${idx + 1}`,
          caption: slide?.caption || '',
          image: slide?.image || FALLBACK_IMAGE,
          video: slide?.video || '',
        }))
      : [],
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt ?? new Date().toISOString(),
  } as VisualStory;
}

function toAboutContent(id: string, data: Record<string, any>): AboutPageContent {
  return {
    id,
    heroTitle: data.heroTitle || 'About Drishyam News',
    heroSubtitle:
      data.heroSubtitle ||
      'Independent journalism for a modern India. We deliver facts, context, and clarity.',
    profileImage: data.profileImage || '/placeholder-user.jpg',
    intro:
      data.intro ||
      'Drishyam News is a digital newsroom focused on truth-first reporting and in-depth public-interest journalism.',
    story:
      data.story ||
      'From breaking headlines to explainers, our editorial process prioritizes verification, fairness, and accountability.',
    mission:
      data.mission ||
      'To make credible journalism accessible, fast, and meaningful for every reader.',
    vision:
      data.vision ||
      'To become India’s most trusted digital-first news platform for informed citizens.',
    values: Array.isArray(data.values) && data.values.length > 0
      ? data.values.map((v: any) => String(v))
      : ['Accuracy', 'Independence', 'Accountability', 'Public Interest'],
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? data.updatedAt ?? new Date().toISOString(),
  } as AboutPageContent;
}

/**
 * getArticlesMetadataPool
 * Client-safe fallback that fetches the latest 50 articles.
 */
const getArticlesMetadataPool = cache(async () => {
  try {
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    if (snap.empty) return [];
    return snap.docs.map(d => toArticle(d.id, d.data()));
  } catch (e) {
    console.error('[data-client] getArticlesMetadataPool error:', e);
    return [];
  }
});

/** 
 * Safe fetcher that avoids Composite Index requirements by filtering in memory.
 */
async function fetchAndFilter(
  filterFn: (data: any) => boolean, 
  count: number
): Promise<NewsArticle[]> {
  const pool = await getArticlesMetadataPool();
  return pool.filter(filterFn).slice(0, count);
}

// --------------------------------------------------------------------------
// Featured article
// --------------------------------------------------------------------------
export async function getFeaturedArticle(): Promise<NewsArticle | null> {
  const articles = await fetchAndFilter(a => a.featured && a.status === 'published', 1);
  return articles.length > 0 ? articles[0] : null;
}

// --------------------------------------------------------------------------
// Latest articles
// --------------------------------------------------------------------------
export async function getLatestArticles(count = 8): Promise<NewsArticle[]> {
  return fetchAndFilter(a => a.status === 'published', count);
}

// --------------------------------------------------------------------------
// Articles by category slug
// --------------------------------------------------------------------------
export async function getArticlesByCategory(
  categorySlug: string,
  count = 10
): Promise<NewsArticle[]> {
  return fetchAndFilter(
    a => a.status === 'published' && a.categorySlug === categorySlug, 
    count
  );
}

// --------------------------------------------------------------------------
// Articles by type
// --------------------------------------------------------------------------
export async function getArticlesByType(
  type: 'explainer' | 'opinion' | 'video' | 'standard',
  count = 5
): Promise<NewsArticle[]> {
  return fetchAndFilter(
    a => a.status === 'published' && a.articleType === type, 
    count
  );
}

// --------------------------------------------------------------------------
// Single article by slug
// --------------------------------------------------------------------------
export const getArticleBySlug = cache(async (slug: string): Promise<NewsArticle | null> => {
  const timerLabel = `[DB] getArticleBySlug(${slug})`;
  console.time(timerLabel);
  try {
    if (!db) {
      console.timeEnd(timerLabel);
      return null;
    }

    // Ensure slug is decoded (handles Hindi characters in URL)
    const decodedSlug = decodeURIComponent(slug);

    // 1. Try Slug Query
    const q = query(collection(db, 'articles'), where('slug', '==', decodedSlug), limit(1));
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      console.timeEnd(timerLabel);
      return toArticle(snap.docs[0].id, snap.docs[0].data());
    }

    // 2. Fallback: Try direct doc ID lookup
    const docRef = doc(db, 'articles', slug);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.timeEnd(timerLabel);
      return toArticle(docSnap.id, docSnap.data());
    }

    // 3. Fallback: Try direct doc ID lookup with decoded slug
    if (decodedSlug !== slug) {
      const decodedRef = doc(db, 'articles', decodedSlug);
      const decodedSnap = await getDoc(decodedRef);
      if (decodedSnap.exists()) {
        console.timeEnd(timerLabel);
        return toArticle(decodedSnap.id, decodedSnap.data());
      }
    }

    console.timeEnd(timerLabel);
  } catch (e) {
    console.error(`[data] getArticleBySlug(${slug}) error:`, e);
    console.timeEnd(timerLabel);
  }
  return null;
});

// --------------------------------------------------------------------------
// Breaking / Trending / Tags
// --------------------------------------------------------------------------
export async function getBreakingNews(count = 5): Promise<NewsArticle[]> {
  return fetchAndFilter(a => a.isBreaking && a.status === 'published', count);
}

export async function getTrendingArticles(count = 5): Promise<NewsArticle[]> {
  return fetchAndFilter(a => a.status === 'published', count); // In memory sort by views if needed
}

export async function getLatestGlobalArticles(count = 5): Promise<NewsArticle[]> {
  return getLatestArticles(count);
}

// --------------------------------------------------------------------------
// Categories & Authors & Stories
// --------------------------------------------------------------------------
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    if (!db) return null;
    const q = query(collection(db, 'categories'), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0].data();
      const fallback = CATEGORY_FALLBACK_MAP[d.slug];
      return { 
        id: snap.docs[0].id, 
        name: d.name_hi || fallback?.hi || d.name || 'सामान्य',
        name_hi: d.name_hi || fallback?.hi || d.name || 'सामान्य',
        name_en: d.name_en || fallback?.en || d.name || 'General',
        slug: d.slug, 
        description: d.description_hi || d.description 
      } as Category;
    }
  } catch (e) {
    console.error(`[data] getCategoryBySlug error:`, e);
  }
  return null;
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    if (!db) return [];
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    
    if (snap.empty) return [];

    return snap.docs.map(d => {
      const data = d.data();
      const fallback = CATEGORY_FALLBACK_MAP[data.slug];
      return { 
        id: d.id, 
        ...data,
        name: data.name_hi || fallback?.hi || data.name || 'सामान्य',
        name_hi: data.name_hi || fallback?.hi || data.name || 'सामान्य',
        name_en: data.name_en || fallback?.en || data.name || 'General',
      } as Category;
    });
  } catch (e) {
    console.error('[data] getAllCategories error:', e);
    return [];
  }
}

export const getAuthorById = cache(
  async (id: string): Promise<Author | null> => {
    const timerLabel = `[DB: Client] getAuthorById(${id})`;
    console.time(timerLabel);
    try {
      if (!db) {
         console.timeEnd(timerLabel);
         return null;
      }
      const snap = await getDocs(query(collection(db, 'authors'), limit(100))); // Small collection
      const docSnap = snap.docs.find(d => d.id === id);
      console.timeEnd(timerLabel);
      if (docSnap) return { id: docSnap.id, ...docSnap.data() } as Author;
    } catch (e) {
      console.error(`[data-client] getAuthorById error:`, e);
      console.timeEnd(timerLabel);
    }
    return null;
  }
);

export async function getVisualStories(): Promise<VisualStory[]> {
  try {
    if (!db) return [];
    const q = query(collection(db, 'visual-stories'), limit(50));
    const snap = await getDocs(q);
    
    if (snap.empty) return [];

    return snap.docs
      .map(d => toVisualStory(d.id, d.data()))
      .sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 10);
  } catch (e) {
    console.error('[data] getVisualStories error:', e);
    return [];
  }
}

export async function getVisualStoryBySlug(slug: string): Promise<VisualStory | null> {
  try {
    if (!db) return null;
    const q = query(collection(db, 'visual-stories'), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) return toVisualStory(snap.docs[0].id, snap.docs[0].data());
  } catch (e) {
    console.error(`[data] getVisualStoryBySlug(${slug}) error:`, e);
  }
  return null;
}

export async function getAboutPageContent(): Promise<AboutPageContent> {
  try {
    if (!db) return toAboutContent('about-us', {});
    const ref = doc(db, 'site-content', 'about-us');
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return toAboutContent('about-us', {});
    }

    return toAboutContent(snap.id, snap.data() || {});
  } catch (e) {
    console.error('[data] getAboutPageContent error:', e);
    return toAboutContent('about-us', {});
  }
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSearchIndex(article: NewsArticle) {
  const title = normalizeSearchText(article.title || '');
  const slug = normalizeSearchText(article.slug || '');
  const excerpt = normalizeSearchText(article.excerpt || '');
  const content = normalizeSearchText(article.content || '');
  const tags = normalizeSearchText((article.tags || []).join(' '));
  const category = normalizeSearchText(article.category || article.categorySlug || '');
  const meta = normalizeSearchText(`${article.metaTitle || ''} ${article.metaDescription || ''}`);
  const combined = `${title} ${slug} ${excerpt} ${content} ${tags} ${category} ${meta}`.trim();

  return { title, slug, excerpt, content, tags, category, meta, combined };
}

export async function searchArticles(queryStr: string): Promise<NewsArticle[]> {
  const term = normalizeSearchText(queryStr || '');
  if (!term) return [];

  const tokens = term.split(' ').filter(Boolean);

  // For search, we always use memory-based search on the buffer
  const pool = await fetchAndFilter((a) => a.status === 'published', 250);

  return pool
    .map((article) => {
      const index = buildSearchIndex(article);
      let score = 0;

      const phraseInTitle = index.title.includes(term);
      const phraseInSlug = index.slug.includes(term);
      const phraseInExcerpt = index.excerpt.includes(term);
      const phraseInTags = index.tags.includes(term);
      const phraseInCategory = index.category.includes(term);
      const phraseInContent = index.content.includes(term);

      if (phraseInTitle) score += 120;
      if (phraseInSlug) score += 80;
      if (phraseInExcerpt) score += 45;
      if (phraseInTags) score += 35;
      if (phraseInCategory) score += 25;
      if (phraseInContent) score += 10;

      let matchedTokens = 0;
      for (const token of tokens) {
        const inTitle = index.title.includes(token);
        const inSlug = index.slug.includes(token);
        const inExcerpt = index.excerpt.includes(token);
        const inTags = index.tags.includes(token);
        const inCategory = index.category.includes(token);
        const inContent = index.content.includes(token);

        if (inTitle) score += index.title.startsWith(token) ? 18 : 12;
        if (inSlug) score += 12;
        if (inExcerpt) score += 8;
        if (inTags) score += 7;
        if (inCategory) score += 6;
        if (inContent) score += 2;

        if (inTitle || inSlug || inExcerpt || inTags || inCategory || inContent) {
          matchedTokens += 1;
        }
      }

      const singleTokenMatch = tokens.length === 1 && matchedTokens >= 1;
      const multiTokenStrictMatch = tokens.length > 1 && matchedTokens === tokens.length;
      const hasPhraseMatch =
        phraseInTitle || phraseInSlug || phraseInExcerpt || phraseInTags || phraseInCategory || phraseInContent;
      const shouldInclude = hasPhraseMatch || singleTokenMatch || multiTokenStrictMatch;

      return { article, score, shouldInclude };
    })
    .filter((item) => item.shouldInclude)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const bTime = new Date(b.article.updatedAt || b.article.createdAt || 0).getTime();
      const aTime = new Date(a.article.updatedAt || a.article.createdAt || 0).getTime();
      return bTime - aTime;
    })
    .map((item) => item.article);
}
