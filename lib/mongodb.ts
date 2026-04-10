import 'server-only';

import { Collection, Db, MongoClient, type Document, type IndexSpecification } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'drishyam_news';

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI. Set it in your environment before starting the app.');
}

declare global {
  // eslint-disable-next-line no-var
  var __drishyamMongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var __drishyamMongoIndexesPromise: Promise<void> | undefined;
}

const clientOptions = {
  maxPoolSize: 20,
  appName: 'drishyam-news-web',
};

const clientPromise =
  global.__drishyamMongoClientPromise || new MongoClient(MONGODB_URI, clientOptions).connect();

if (process.env.NODE_ENV !== 'production') {
  global.__drishyamMongoClientPromise = clientPromise;
}

async function safeCreateIndex(
  collection: Collection<Document>,
  keys: IndexSpecification,
  options: Record<string, unknown>
) {
  try {
    await collection.createIndex(keys, options);
  } catch (error: any) {
    const code = Number(error?.code);
    const codeName = String(error?.codeName || '');
    const message = String(error?.message || '').toLowerCase();

    if (
      code === 85 ||
      codeName.includes('indexoptionsconflict') ||
      message.includes('already exists') ||
      message.includes('equivalent index already exists')
    ) {
      return;
    }

    throw error;
  }
}

async function ensureIndexes(db: Db) {
  if (!global.__drishyamMongoIndexesPromise) {
    global.__drishyamMongoIndexesPromise = (async () => {
      const articles = db.collection('articles');
      const categories = db.collection('categories');
      const visualStories = db.collection('visualStories');

      await Promise.all([
        safeCreateIndex(articles, { slug: 1 }, { name: 'slug_unique', unique: true }),
        safeCreateIndex(articles, { status: 1, createdAt: -1 }, { name: 'status_createdAt' }),
        safeCreateIndex(articles, { categorySlug: 1, status: 1, createdAt: -1 }, { name: 'category_status_createdAt' }),
        safeCreateIndex(articles, { articleType: 1, status: 1, createdAt: -1 }, { name: 'type_status_createdAt' }),
        safeCreateIndex(articles, { featured: 1, status: 1, createdAt: -1 }, { name: 'featured_status_createdAt' }),
        safeCreateIndex(articles, { isBreaking: 1, status: 1, createdAt: -1 }, { name: 'breaking_status_createdAt' }),
        safeCreateIndex(articles, { views: -1, updatedAt: -1 }, { name: 'views_updatedAt' }),
        safeCreateIndex(
          articles,
          {
            title: 'text',
            title_hi: 'text',
            excerpt: 'text',
            excerpt_hi: 'text',
            tags: 'text',
            category: 'text',
            slug: 'text',
          },
          { name: 'article_text_search', default_language: 'none' }
        ),
        safeCreateIndex(categories, { slug: 1 }, { name: 'slug_unique', unique: true }),
        safeCreateIndex(categories, { order: 1, name: 1 }, { name: 'order_name' }),
        safeCreateIndex(visualStories, { slug: 1 }, { name: 'slug_unique', unique: true }),
        safeCreateIndex(visualStories, { createdAt: -1 }, { name: 'createdAt_desc' }),
      ]);
    })().catch((error) => {
      global.__drishyamMongoIndexesPromise = undefined;
      throw error;
    });
  }

  await global.__drishyamMongoIndexesPromise;
}

export async function getMongoClient() {
  return clientPromise;
}

export async function getMongoDb() {
  const client = await getMongoClient();
  const db = client.db(MONGODB_DB);
  await ensureIndexes(db);
  return db;
}

export { MONGODB_DB };
