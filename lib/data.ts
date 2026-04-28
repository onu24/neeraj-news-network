/**
 * lib/data.ts — Public data layer (MongoDB)
 *
 * All reads go through MongoDB Atlas via the getMongoDb() singleton.
 * Function signatures are identical to the old Firebase version —
 * no changes needed in page components or Server Components.
 */

import 'server-only';
import { ObjectId } from 'mongodb';
import { getMongoDb } from './mongodb';
import { NewsArticle, VisualStory, Author, Category, AboutPageContent } from './types';
import { slugify, FALLBACK_IMAGE } from './utils';
import { cache } from 'react';
import { CATEGORY_FALLBACK_MAP } from './i18n';

// --------------------------------------------------------------------------
// Mappers
// --------------------------------------------------------------------------

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

  const rawCover = data.coverImage || data.imageUrl || FALLBACK_IMAGE;
  const isDirectImage =
    rawCover && (!rawCover.includes('ibb.co/') || /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(rawCover));
  const safeCoverImage = isDirectImage ? rawCover : FALLBACK_IMAGE;

  const safeSlug = data.slug && data.slug.trim() !== '' ? data.slug : id;

  const parseDate = (val: any): string => {
    if (!val) return new Date().toISOString();
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'string') {
      const d = new Date(val);
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    }
    // Firestore Timestamp compat (if any old docs remain)
    if (typeof val?.toDate === 'function') return val.toDate().toISOString();
    return new Date().toISOString();
  };

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
    shares: data.shares || 0,
    readingTime: data.readingTime || 3,
    language: data.language || 'en',
    createdAt: parseDate(data.createdAt),
    updatedAt: parseDate(data.updatedAt || data.createdAt),
    metaTitle: data.metaTitle || title,
    metaDescription: data.metaDescription || data.excerpt || '',
    isBreaking: !!data.isBreaking,
    isLive: !!data.isLive,
    keyPoints: data.keyPoints || [],
    videoUrl: data.videoUrl || '',
  } as NewsArticle;
}

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
    createdAt:
      data.createdAt instanceof Date
        ? data.createdAt.toISOString()
        : data.createdAt ?? new Date().toISOString(),
  } as VisualStory;
}

function toAboutContent(id: string, data: Record<string, any>): AboutPageContent {
  return {
    id,
    heroTitle: data.heroTitle || 'About Drishyam News',
    heroTitle_hi: data.heroTitle_hi || null,
    heroSubtitle:
      data.heroSubtitle ||
      'Independent journalism for a modern India. We deliver facts, context, and clarity.',
    heroSubtitle_hi: data.heroSubtitle_hi || null,
    profileImage: data.profileImage || '/placeholder-user.jpg',
    intro:
      data.intro ||
      'Drishyam News is a digital newsroom focused on truth-first reporting and in-depth public-interest journalism.',
    intro_hi: data.intro_hi || null,
    story:
      data.story ||
      'From breaking headlines to explainers, our editorial process prioritizes verification, fairness, and accountability.',
    story_hi: data.story_hi || null,
    mission: data.mission || 'To make credible journalism accessible, fast, and meaningful for every reader.',
    mission_hi: data.mission_hi || null,
    vision:
      data.vision || 'To become India\u2019s most trusted digital-first news platform for informed citizens.',
    vision_hi: data.vision_hi || null,
    values:
      Array.isArray(data.values) && data.values.length > 0
        ? data.values.map((v: any) => String(v))
        : ['Accuracy', 'Independence', 'Accountability', 'Public Interest'],
    values_hi: Array.isArray(data.values_hi) ? data.values_hi.map((v: any) => String(v)) : null,
    updatedAt:
      data.updatedAt instanceof Date
        ? data.updatedAt.toISOString()
        : data.updatedAt ?? new Date().toISOString(),
  } as AboutPageContent;
}

// --------------------------------------------------------------------------
// Shared article pool (cached per request)
// --------------------------------------------------------------------------

const getArticlesPool = cache(async (): Promise<NewsArticle[]> => {
  try {
    const db = await getMongoDb();
    const docs = await db
      .collection('articles')
      .find({}, { projection: { content: 0, content_hi: 0 } })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    return docs.map((d) => toArticle(d._id.toString(), d));
  } catch (e) {
    console.error('[data] getArticlesPool error:', e);
    return [];
  }
});

async function fetchAndFilter(
  filterFn: (a: NewsArticle) => boolean,
  count: number
): Promise<NewsArticle[]> {
  const pool = await getArticlesPool();
  return pool.filter(filterFn).slice(0, count);
}

// --------------------------------------------------------------------------
// Public reads
// --------------------------------------------------------------------------

export async function getFeaturedArticle(): Promise<NewsArticle | null> {
  const articles = await fetchAndFilter((a) => !!a.featured && a.status === 'published', 1);
  return articles[0] ?? null;
}

export async function getLatestArticles(count = 8): Promise<NewsArticle[]> {
  return fetchAndFilter((a) => a.status === 'published', count);
}

export async function getLatestGlobalArticles(count = 5): Promise<NewsArticle[]> {
  return getLatestArticles(count);
}

export async function getArticlesByCategory(categorySlug: string, count = 10): Promise<NewsArticle[]> {
  return fetchAndFilter(
    (a) => a.status === 'published' && a.categorySlug === categorySlug,
    count
  );
}

export async function getArticlesByType(
  type: 'explainer' | 'opinion' | 'video' | 'standard',
  count = 5
): Promise<NewsArticle[]> {
  return fetchAndFilter((a) => a.status === 'published' && a.articleType === type, count);
}

export async function getBreakingNews(count = 5): Promise<NewsArticle[]> {
  return fetchAndFilter((a) => !!a.isBreaking && a.status === 'published', count);
}

export async function getTrendingArticles(count = 5): Promise<NewsArticle[]> {
  return fetchAndFilter((a) => a.status === 'published', count);
}

// --------------------------------------------------------------------------
// Single article by slug
// --------------------------------------------------------------------------

export const getArticleBySlug = cache(async (slug: string): Promise<NewsArticle | null> => {
  try {
    const db = await getMongoDb();
    const decodedSlug = decodeURIComponent(slug);

    const doc = await db.collection('articles').findOne({ slug: decodedSlug });
    if (doc) return toArticle(doc._id.toString(), doc);

    // Fallback: try ObjectId lookup (slug might actually be a Mongo _id string)
    if (ObjectId.isValid(slug)) {
      const byId = await db.collection('articles').findOne({ _id: new ObjectId(slug) });
      if (byId) return toArticle(byId._id.toString(), byId);
    }
  } catch (e) {
    console.error(`[data] getArticleBySlug(${slug}) error:`, e);
  }
  return null;
});

// --------------------------------------------------------------------------
// Categories
// --------------------------------------------------------------------------

export async function getAllCategories(): Promise<Category[]> {
  try {
    const db = await getMongoDb();
    const docs = await db.collection('categories').find().sort({ order: 1, name: 1 }).toArray();

    return docs.map((doc) => {
      const { _id, ...d } = doc;
      const fallback = CATEGORY_FALLBACK_MAP[d.slug];
      return {
        id: _id.toString(),
        ...d,
        name: d.name_hi || fallback?.hi || d.name || 'सामान्य',
        name_hi: d.name_hi || fallback?.hi || d.name || 'सामान्य',
        name_en: d.name_en || fallback?.en || d.name || 'General',
      } as Category;
    });
  } catch (e) {
    console.error('[data] getAllCategories error:', e);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const db = await getMongoDb();
    const d = await db.collection('categories').findOne({ slug });
    if (!d) return null;
    const fallback = CATEGORY_FALLBACK_MAP[d.slug];
    return {
      id: d._id.toString(),
      name: d.name_hi || fallback?.hi || d.name || 'सामान्य',
      name_hi: d.name_hi || fallback?.hi || d.name || 'सामान्य',
      name_en: d.name_en || fallback?.en || d.name || 'General',
      slug: d.slug,
      description: d.description_hi || d.description,
    } as Category;
  } catch (e) {
    console.error(`[data] getCategoryBySlug(${slug}) error:`, e);
    return null;
  }
}

// --------------------------------------------------------------------------
// Authors
// --------------------------------------------------------------------------

export const getAuthorById = cache(async (id: string): Promise<Author | null> => {
  try {
    const db = await getMongoDb();
    let doc = null;

    // Try by string id field first, then by ObjectId _id
    doc = await db.collection('authors').findOne({ id });
    if (!doc && ObjectId.isValid(id)) {
      doc = await db.collection('authors').findOne({ _id: new ObjectId(id) });
    }
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return { id: _id.toString(), ...rest } as Author;
  } catch (e) {
    console.error(`[data] getAuthorById(${id}) error:`, e);
    return null;
  }
});

// --------------------------------------------------------------------------
// Visual Stories
// --------------------------------------------------------------------------

export async function getVisualStories(): Promise<VisualStory[]> {
  try {
    const db = await getMongoDb();
    const docs = await db
      .collection('visualStories')
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return docs.map((d) => toVisualStory(d._id.toString(), d));
  } catch (e) {
    console.error('[data] getVisualStories error:', e);
    return [];
  }
}

export async function getVisualStoryBySlug(slug: string): Promise<VisualStory | null> {
  try {
    const db = await getMongoDb();
    const doc = await db.collection('visualStories').findOne({ slug });
    if (!doc) return null;
    return toVisualStory(doc._id.toString(), doc);
  } catch (e) {
    console.error(`[data] getVisualStoryBySlug(${slug}) error:`, e);
    return null;
  }
}

// --------------------------------------------------------------------------
// About Page
// --------------------------------------------------------------------------

export async function getAboutPageContent(): Promise<AboutPageContent> {
  try {
    const db = await getMongoDb();
    const doc = await db.collection('siteContent').findOne({ _id: 'about-us' as any });
    if (!doc) return toAboutContent('about-us', {});
    return toAboutContent('about-us', doc);
  } catch (e) {
    console.error('[data] getAboutPageContent error:', e);
    return toAboutContent('about-us', {});
  }
}

// --------------------------------------------------------------------------
// Search
// --------------------------------------------------------------------------

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
        if (index.title.includes(token)) { score += index.title.startsWith(token) ? 18 : 12; matchedTokens++; }
        else if (index.slug.includes(token)) { score += 12; matchedTokens++; }
        else if (index.excerpt.includes(token)) { score += 8; matchedTokens++; }
        else if (index.tags.includes(token)) { score += 7; matchedTokens++; }
        else if (index.category.includes(token)) { score += 6; matchedTokens++; }
        else if (index.content.includes(token)) { score += 2; matchedTokens++; }
      }

      const hasPhraseMatch = phraseInTitle || phraseInSlug || phraseInExcerpt || phraseInTags || phraseInCategory || phraseInContent;
      const singleTokenMatch = tokens.length === 1 && matchedTokens >= 1;
      const multiTokenStrictMatch = tokens.length > 1 && matchedTokens === tokens.length;
      const shouldInclude = hasPhraseMatch || singleTokenMatch || multiTokenStrictMatch;

      return { article, score, shouldInclude };
    })
    .filter((item) => item.shouldInclude)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.article.updatedAt || 0).getTime() - new Date(a.article.updatedAt || 0).getTime();
    })
    .map((item) => item.article);
}
