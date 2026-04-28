/**
 * lib/dashboard.ts — Admin data layer (MongoDB)
 *
 * All admin CRUD operations use MongoDB via getMongoDb().
 * Exported function signatures are identical to the old Firebase version —
 * no changes needed in dashboard-actions.ts.
 */

import 'server-only';
import { ObjectId } from 'mongodb';
import { getMongoDb } from './mongodb';
import { Article, Category, Author, DashboardStats, ArticleStatus, VisualStory, AboutPageContent, ContactPageContent } from './types';
import { slugify, FALLBACK_IMAGE } from './utils';
import { toArticle } from './data';

// --------------------------------------------------------------------------
// Mappers
// --------------------------------------------------------------------------

function toVisualStory(id: string, data: any): VisualStory {
  return {
    id,
    title: data.title || 'Untitled Story',
    slug: data.slug || slugify(data.title || 'story'),
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

function toAboutContent(id: string, data: any): AboutPageContent {
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
    vision: data.vision || 'To become India\u2019s most trusted digital-first news platform for informed citizens.',
    vision_hi: data.vision_hi || null,
    values:
      Array.isArray(data.values) && data.values.length > 0
        ? data.values.map((v: any) => String(v))
        : ['Accuracy', 'Independence', 'Accountability', 'Public Interest'],
    values_hi: Array.isArray(data.values_hi) ? data.values_hi.map((v: any) => String(v)) : null,
    updatedAt:
      data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt ?? new Date().toISOString(),
  } as AboutPageContent;
}

// --------------------------------------------------------------------------
// Articles
// --------------------------------------------------------------------------

export async function getAllArticles(): Promise<Article[]> {
  try {
    const db = await getMongoDb();
    const docs = await db.collection('articles').find().sort({ createdAt: -1 }).limit(500).toArray();
    return docs.map((d) => toArticle(d._id.toString(), d));
  } catch (err) {
    console.error('[Dashboard] getAllArticles error:', err);
    return [];
  }
}

export async function getArticleById(id: string): Promise<Article | null> {
  try {
    const db = await getMongoDb();
    if (!ObjectId.isValid(id)) return null;
    const doc = await db.collection('articles').findOne({ _id: new ObjectId(id) });
    if (!doc) return null;
    return toArticle(doc._id.toString(), doc);
  } catch (err) {
    console.error('[Dashboard] getArticleById error:', err);
    return null;
  }
}

export async function createArticle(
  data: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'views'>
): Promise<Article> {
  const db = await getMongoDb();
  const now = new Date();
  const payload = { ...data, views: 0, createdAt: now, updatedAt: now };
  const result = await db.collection('articles').insertOne(payload);
  return toArticle(result.insertedId.toString(), payload);
}

export async function updateArticle(id: string, data: Partial<Article>): Promise<Article> {
  const db = await getMongoDb();
  // Strip the id field to avoid $set conflicts
  const { id: _id, ...rest } = data as any;
  const updates = { ...rest, updatedAt: new Date() };
  await db.collection('articles').updateOne({ _id: new ObjectId(id) }, { $set: updates });
  const updated = await db.collection('articles').findOne({ _id: new ObjectId(id) });
  return toArticle(updated!._id.toString(), updated!);
}

export async function deleteArticle(id: string): Promise<boolean> {
  const db = await getMongoDb();
  await db.collection('articles').deleteOne({ _id: new ObjectId(id) });
  return true;
}

export async function getRecentArticles(n = 5): Promise<Article[]> {
  try {
    const db = await getMongoDb();
    const docs = await db.collection('articles').find().sort({ createdAt: -1 }).limit(n).toArray();
    return docs.map((d) => toArticle(d._id.toString(), d));
  } catch (err) {
    console.error('[Dashboard] getRecentArticles error:', err);
    return [];
  }
}

export async function getFeaturedArticles(): Promise<Article[]> {
  try {
    const db = await getMongoDb();
    const docs = await db
      .collection('articles')
      .find({ featured: true, status: 'published' })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    return docs.map((d) => toArticle(d._id.toString(), d));
  } catch (err) {
    console.error('[Dashboard] getFeaturedArticles error:', err);
    return [];
  }
}

// --------------------------------------------------------------------------
// Visual Stories
// --------------------------------------------------------------------------

export async function getAllVisualStories(limitCount = 200): Promise<VisualStory[]> {
  try {
    const db = await getMongoDb();
    const docs = await db
      .collection('visualStories')
      .find()
      .sort({ createdAt: -1 })
      .limit(limitCount)
      .toArray();
    return docs.map((d) => toVisualStory(d._id.toString(), d));
  } catch (err) {
    console.error('[Dashboard] getAllVisualStories error:', err);
    return [];
  }
}

export async function getVisualStoryById(id: string): Promise<VisualStory | null> {
  try {
    const db = await getMongoDb();
    if (!ObjectId.isValid(id)) return null;
    const doc = await db.collection('visualStories').findOne({ _id: new ObjectId(id) });
    if (!doc) return null;
    return toVisualStory(doc._id.toString(), doc);
  } catch (err) {
    console.error('[Dashboard] getVisualStoryById error:', err);
    return null;
  }
}

export async function createVisualStory(
  data: Omit<VisualStory, 'id' | 'createdAt'>
): Promise<VisualStory> {
  const db = await getMongoDb();
  const now = new Date();
  const payload = { ...data, createdAt: now, updatedAt: now };
  const result = await db.collection('visualStories').insertOne(payload);
  return toVisualStory(result.insertedId.toString(), payload);
}

export async function updateVisualStory(id: string, data: Partial<VisualStory>): Promise<VisualStory> {
  const db = await getMongoDb();
  const { id: _id, ...rest } = data as any;
  const updates = { ...rest, updatedAt: new Date() };
  await db.collection('visualStories').updateOne({ _id: new ObjectId(id) }, { $set: updates });
  const updated = await db.collection('visualStories').findOne({ _id: new ObjectId(id) });
  return toVisualStory(updated!._id.toString(), updated!);
}

export async function deleteVisualStory(id: string): Promise<boolean> {
  const db = await getMongoDb();
  await db.collection('visualStories').deleteOne({ _id: new ObjectId(id) });
  return true;
}

// --------------------------------------------------------------------------
// About Page
// --------------------------------------------------------------------------

export async function getAboutPageContent(): Promise<AboutPageContent> {
  try {
    const db = await getMongoDb();
    const doc = await db.collection('siteContent').findOne({ _id: 'about-us' as any });
    return toAboutContent('about-us', doc || {});
  } catch (err) {
    console.error('[Dashboard] getAboutPageContent error:', err);
    return toAboutContent('about-us', {});
  }
}

export async function upsertAboutPageContent(data: Partial<AboutPageContent>): Promise<AboutPageContent> {
  const db = await getMongoDb();
  const { id: _id, ...rest } = data as any;
  const payload = { ...rest, updatedAt: new Date() };
  await db.collection('siteContent').updateOne(
    { _id: 'about-us' as any },
    { $set: payload },
    { upsert: true }
  );
  const updated = await db.collection('siteContent').findOne({ _id: 'about-us' as any });
  return toAboutContent('about-us', updated || payload);
}

// --------------------------------------------------------------------------
// Contact Page
// --------------------------------------------------------------------------

function toContactContent(id: string, data: any): ContactPageContent {
  return {
    id,
    heroTitle: data.heroTitle || 'Contact Us',
    heroTitle_hi: data.heroTitle_hi || null,
    heroSubtitle:
      data.heroSubtitle ||
      "Have a tip, a correction, or a business inquiry? We'd love to hear from you.",
    heroSubtitle_hi: data.heroSubtitle_hi || null,
    email:
      data.email || 'editorial@drishyamnews.in\nbusiness@drishyamnews.in',
    phone: data.phone || '+91 11 XXXX XXXX',
    address: data.address || 'New Delhi, India',
    address_hi: data.address_hi || null,
    extraInfo: data.extraInfo || '',
    extraInfo_hi: data.extraInfo_hi || null,
    updatedAt:
      data.updatedAt instanceof Date
        ? data.updatedAt.toISOString()
        : data.updatedAt ?? new Date().toISOString(),
  } as ContactPageContent;
}

export async function getContactPageContent(): Promise<ContactPageContent> {
  try {
    const db = await getMongoDb();
    const doc = await db.collection('siteContent').findOne({ _id: 'contact-us' as any });
    return toContactContent('contact-us', doc || {});
  } catch (err) {
    console.error('[Dashboard] getContactPageContent error:', err);
    return toContactContent('contact-us', {});
  }
}

export async function upsertContactPageContent(data: Partial<ContactPageContent>): Promise<ContactPageContent> {
  const db = await getMongoDb();
  const { id: _id, ...rest } = data as any;
  const payload = { ...rest, updatedAt: new Date() };
  await db.collection('siteContent').updateOne(
    { _id: 'contact-us' as any },
    { $set: payload },
    { upsert: true }
  );
  const updated = await db.collection('siteContent').findOne({ _id: 'contact-us' as any });
  return toContactContent('contact-us', updated || payload);
}

// --------------------------------------------------------------------------
// Dashboard Stats
// --------------------------------------------------------------------------

export async function getDashboardStats(): Promise<DashboardStats & { pendingArticles: Article[], growth: any }> {
  try {
    const db = await getMongoDb();
    const articlesCol = db.collection('articles');
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [total, published, draft, review, featured, categories, authors, recentArticles, pendingDocs] = await Promise.all([
      articlesCol.countDocuments(),
      articlesCol.countDocuments({ status: 'published' }),
      articlesCol.countDocuments({ status: 'draft' }),
      articlesCol.countDocuments({ status: 'review' }),
      articlesCol.countDocuments({ featured: true }),
      db.collection('categories').countDocuments(),
      db.collection('authors').countDocuments(),
      articlesCol.countDocuments({ status: 'published', createdAt: { $gte: thirtyDaysAgo } }),
      articlesCol.find({ status: { $in: ['draft', 'review'] } }).sort({ updatedAt: -1 }).limit(5).toArray()
    ]);

    // Sum views and shares from published articles
    const engagementAgg = await articlesCol
      .aggregate([{ $match: { status: 'published' } }, { $group: { _id: null, totalViews: { $sum: '$views' }, totalShares: { $sum: '$shares' } } }])
      .toArray();
    const totalViews = engagementAgg[0]?.totalViews || 0;
    const totalShares = engagementAgg[0]?.totalShares || 0;

    // Calculate Growth Percentage (Mocking the previous month comparison for UI feel, but using real current count)
    const publishedGrowth = total > 0 ? Math.round((recentArticles / total) * 100) : 0;

    return {
      totalArticles: total,
      publishedCount: published,
      draftCount: draft,
      reviewCount: review,
      featuredArticles: featured,
      totalViews,
      totalShares,
      totalCategories: categories,
      totalAuthors: authors,
      pendingArticles: pendingDocs.map(d => toArticle(d._id.toString(), d)),
      growth: {
        published: publishedGrowth,
        views: 0, // In a real app, we'd need a time-series views table
      }
    } as any;
  } catch (err) {
    console.error('[Dashboard] getDashboardStats error:', err);
    return {
      totalArticles: 0, publishedCount: 0, draftCount: 0,
      reviewCount: 0, featuredArticles: 0, totalViews: 0, totalShares: 0,
      totalCategories: 0, totalAuthors: 0, pendingArticles: [],
      growth: { published: 0, views: 0 }
    } as any;
  }
}

// --------------------------------------------------------------------------
// Categories
// --------------------------------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  try {
    const db = await getMongoDb();
    const docs = await db.collection('categories').find().sort({ order: 1, name: 1 }).toArray();
    return docs.map((doc) => {
      const { _id, ...rest } = doc;
      return { id: _id.toString(), ...rest } as Category;
    });
  } catch (err) {
    console.error('[Dashboard] getCategories error:', err);
    return [];
  }
}

export async function createCategory(
  data: Omit<Category, 'id' | 'order'> & { order: number }
): Promise<Category> {
  const db = await getMongoDb();
  const result = await db.collection('categories').insertOne(data);
  const { _id, ...rest } = data as any;
  return { id: result.insertedId.toString(), ...rest } as Category;
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  const db = await getMongoDb();
  const { id: _id, ...rest } = data as any;
  await db.collection('categories').updateOne({ _id: new ObjectId(id) }, { $set: rest });
  const updated = await db.collection('categories').findOne({ _id: new ObjectId(id) });
  const { _id: finalId, ...finalData } = updated!;
  return { id: finalId.toString(), ...finalData } as Category;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const db = await getMongoDb();
  await db.collection('categories').deleteOne({ _id: new ObjectId(id) });
  return true;
}

// --------------------------------------------------------------------------
// Authors
// --------------------------------------------------------------------------

export async function getAuthors(): Promise<Author[]> {
  try {
    const db = await getMongoDb();
    const docs = await db.collection('authors').find().limit(100).toArray();
    return docs.map((doc) => {
      const { _id, ...rest } = doc;
      return { id: _id.toString(), ...rest } as Author;
    });
  } catch (err) {
    console.error('[Dashboard] getAuthors error:', err);
    return [];
  }
}

export async function createAuthor(data: Omit<Author, 'id'>): Promise<Author> {
  const db = await getMongoDb();
  const result = await db.collection('authors').insertOne(data);
  const { _id, ...rest } = data as any;
  return { id: result.insertedId.toString(), ...rest } as Author;
}

export async function updateAuthor(id: string, data: Partial<Author>): Promise<Author> {
  const db = await getMongoDb();
  const { id: _id, ...rest } = data as any;
  await db.collection('authors').updateOne({ _id: new ObjectId(id) }, { $set: rest });
  const updated = await db.collection('authors').findOne({ _id: new ObjectId(id) });
  const { _id: finalId, ...finalData } = updated!;
  return { id: finalId.toString(), ...finalData } as Author;
}

export async function deleteAuthor(id: string): Promise<boolean> {
  const db = await getMongoDb();
  await db.collection('authors').deleteOne({ _id: new ObjectId(id) });
  return true;
}

// Alias for compatibility
export { getAllArticles as getArticlesByCategory };
