import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { toArticle } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const db = await getMongoDb();
    
    // Fetch the 5 most recent published articles
    const articles = await db.collection('articles')
      .find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    const formattedArticles = articles.map(doc => {
      const article = toArticle(doc._id.toString(), doc);
      return {
        id: article.id,
        title: article.title,
        title_hi: article.title_hi,
        slug: article.slug,
        coverImage: article.coverImage,
        createdAt: article.createdAt,
        category: article.category
      };
    });

    return NextResponse.json({ articles: formattedArticles });
  } catch (error) {
    console.error('[API] Notifications fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
