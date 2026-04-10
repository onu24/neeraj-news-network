import 'server-only';
import { db } from './firebase';
import { adminDb, isFirebaseAdminConfigured } from './firebase-admin';
import { query, collection, orderBy, limit, getDocs, where, doc, getDoc } from 'firebase/firestore';
import { NewsArticle, VisualStory, Author, Category, AboutPageContent } from './types';
import { toArticle } from './data';

import { cache } from 'react';

const METADATA_FIELDS = [
  'title', 'title_hi', 'slug', 'excerpt', 'excerpt_hi', 'category', 'categorySlug', 
  'coverImage', 'authorId', 'status', 'featured', 
  'articleType', 'views', 'readingTime', 
  'createdAt', 'updatedAt', 'isBreaking', 'isLive'
];

/**
 * getArticlesMetadataPool
 * strictly server-only high-performance field selection.
 */
export const getArticlesMetadataPool = cache(async () => {
  try {
    if (!isFirebaseAdminConfigured()) {
      throw new Error('Admin SDK not configured');
    }
    const dbAdmin = adminDb();
    if (!dbAdmin) throw new Error('Admin DB not available');
    const snap = await dbAdmin.collection('articles')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .select(...METADATA_FIELDS)
      .get();
      
    if (snap.empty) return [];

    return snap.docs.map((d: any) => {
      const data = d.data();
      return toArticle(d.id, data);
    });
  } catch (e: any) {
    console.warn('[data-server] Admin SDK Pool fallback:', e.message);
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map((d: any) => toArticle(d.id, d.data()));
  } finally {
  }
});

export async function fetchAndFilterAdmin(
  filterFn: (data: any) => boolean, 
  count: number
): Promise<NewsArticle[]> {
  const pool = await getArticlesMetadataPool();
  return pool.filter(filterFn).slice(0, count);
}

export async function getLatestArticles(count = 8): Promise<NewsArticle[]> {
  return fetchAndFilterAdmin((a: any) => a.status === 'published', count);
}

export async function getFeaturedArticle(): Promise<NewsArticle | null> {
  const articles = await fetchAndFilterAdmin((a: any) => a.featured && a.status === 'published', 1);
  return articles.length > 0 ? articles[0] : null;
}

export async function getArticlesByCategory(
  categorySlug: string,
  count = 10
): Promise<NewsArticle[]> {
  return fetchAndFilterAdmin(
    (a: any) => a.status === 'published' && a.categorySlug === categorySlug, 
    count
  );
}

/**
 * getAuthorsPool
 * Fetch all authors once and cache globally.
 */
export const getAuthorsPool = cache(async () => {
  try {
    if (!isFirebaseAdminConfigured()) {
      throw new Error('Admin SDK not configured');
    }
    const dbAdmin = adminDb();
    if (!dbAdmin) throw new Error('Admin DB not available');
    const snap = await dbAdmin.collection('authors').limit(100).get();
    return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Author));
  } catch (e: any) {
    console.warn('[data-server] getAuthorsPool fallback:', e.message);
    const snap = await getDocs(query(collection(db, 'authors'), limit(100)));
    return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Author));
  } finally {
  }
});

export const getAuthorById = cache(
  async (id: string): Promise<Author | null> => {
    const authors = await getAuthorsPool();
    return authors.find((a: any) => a.id === id) || null;
  }
);

export async function getArticlesByType(
  type: 'explainer' | 'opinion' | 'video' | 'standard',
  count = 5
): Promise<NewsArticle[]> {
  return fetchAndFilterAdmin(
    (a: any) => a.status === 'published' && a.articleType === type, 
    count
  );
}

export async function getBreakingNews(count = 5): Promise<NewsArticle[]> {
  return fetchAndFilterAdmin((a: any) => a.isBreaking && a.status === 'published', count);
}

export async function getTrendingArticles(count = 5): Promise<NewsArticle[]> {
  return fetchAndFilterAdmin((a: any) => a.status === 'published', count);
}

/**
 * getArticleMetadataBySlug
 * Optimized for generateMetadata/SEO: pulls only essential fields.
 */
export const getArticleMetadataBySlug = cache(async (slug: string): Promise<NewsArticle | null> => {
  try {
    // 1. Try Admin SDK by Slug
    if (isFirebaseAdminConfigured()) {
      try {
        const dbAdmin = adminDb();
        if (dbAdmin) {
          const snap = await dbAdmin.collection('articles')
            .where('slug', '==', slug)
            .limit(1)
            .select(...METADATA_FIELDS)
            .get();
          if (!snap.empty) {
            const doc = snap.docs[0];
            return toArticle(doc.id, doc.data());
          }
        }
      } catch (adminErr) {
        console.warn(`[data-server] getArticleMetadataBySlug Admin fallback:`, adminErr);
      }
    }

    // 2. Try Client SDK by Slug
    const q = query(collection(db, 'articles'), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) return toArticle(snap.docs[0].id, snap.docs[0].data());

    // 3. Last Resort: Try direct doc ID lookup (for cases where slug field is missing)
    const docRef = doc(db, 'articles', slug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return toArticle(docSnap.id, docSnap.data());

  } catch (e) {
    console.error(`[data-server] getArticleMetadataBySlug error:`, e);
  }
  return null;
});

/**
 * getArticleBySlug
 * Full document fetch including content.
 */
export const getArticleBySlug = cache(async (slug: string): Promise<NewsArticle | null> => {
  try {
    // Ensure slug is decoded (handles Hindi characters in URL)
    const decodedSlug = decodeURIComponent(slug);

    // 1. Try Admin SDK by Slug
    if (isFirebaseAdminConfigured()) {
      try {
        const dbAdmin = adminDb();
        if (dbAdmin) {
          const snap = await dbAdmin.collection('articles')
            .where('slug', '==', decodedSlug)
            .limit(1)
            .get();
          if (!snap.empty) {
            const doc = snap.docs[0];
            return toArticle(doc.id, doc.data());
          }
        }
      } catch (adminErr) {
        console.warn(`[data-server] getArticleBySlug Admin fallback:`, adminErr);
      }
    }

    // 2. Try Client SDK by Slug
    const q = query(collection(db, 'articles'), where('slug', '==', decodedSlug), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) return toArticle(snap.docs[0].id, snap.docs[0].data());

    // 3. Last Resort: Try direct doc ID lookup (using the original slug parameter which might be the ID)
    const docRef = doc(db, 'articles', slug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return toArticle(docSnap.id, docSnap.data());

    // 4. Try direct doc ID lookup with decoded slug just in case
    if (decodedSlug !== slug) {
      const decodedRef = doc(db, 'articles', decodedSlug);
      const decodedSnap = await getDoc(decodedRef);
      if (decodedSnap.exists()) return toArticle(decodedSnap.id, decodedSnap.data());
    }

  } catch (e) {
    console.error(`[data-server] getArticleBySlug error:`, e);
  }
  return null;
});
