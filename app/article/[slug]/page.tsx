import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ArticleHeader } from '@/components/article/ArticleHeader';
import { ArticleContent } from '@/components/article/ArticleContent';
import { ArticleSidebar } from '@/components/article/ArticleSidebar';
import { ShareButtons } from '@/components/article/ShareButtons';
import { ArticleImageGallery } from '@/components/article/ArticleImageGallery';
import { 
  getArticleBySlug, 
  getAuthorById, 
  getArticlesByCategory, 
  getLatestArticles,
  getArticleMetadataBySlug,
  getTrendingArticles
} from '@/lib/data-server';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export async function generateStaticParams() {
  // Pre-render top 25 articles for build stability. 
  // Others will render on-demand via ISR.
  const articles = await getLatestArticles(25);
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleMetadataBySlug(slug);
  
  if (!article) return { title: 'Article Not Found' };
  
  // Hindi-first metadata for SEO
  const title = article.title_hi || article.title;
  const description = article.excerpt_hi || article.excerpt;
  
  const galleryImages = Array.isArray(article.galleryImages) ? article.galleryImages.filter(Boolean) : [];
  const ogImages = Array.from(new Set([article.coverImage, ...galleryImages].filter(Boolean)));

  return {
    title: `${title} | Drishyam News`,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: ogImages,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  
  // High-priority parallel start: the article itself AND general trending data
  // We can't parallelize author/related yet because they depend on article data.
  const [article, trendingArticles] = await Promise.all([
    getArticleBySlug(slug),
    getTrendingArticles(5)
  ]);

  if (!article) {

    notFound();
  }

  // Second-tier parallel fetches dependent on article data
  const [author, relatedArticles] = await Promise.all([
    getAuthorById(article.authorId || ''),
    getArticlesByCategory(article.category || article.categoryId || 'india', 4),
  ]);

  const filteredRelated = relatedArticles.filter(a => a.id !== article.id).slice(0, 3);
  const galleryImages = Array.isArray(article.galleryImages) ? article.galleryImages.filter(Boolean) : [];
  const schemaImages = Array.from(new Set([article.coverImage, ...galleryImages].filter(Boolean)));

  // Hindi-first selection for structured data
  const displayTitle = article.title_hi || article.title;
  const displayExcerpt = article.excerpt_hi || article.excerpt;

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: displayTitle,
    image: schemaImages,
    datePublished: article.createdAt,
    dateModified: article.updatedAt || article.createdAt,
    author: [
      {
        '@type': 'Person',
        name: author?.name || 'Drishyam Editorial',
        url: author ? `https://drishyam-news.com/author/${author.id}` : 'https://drishyam-news.com',
      },
    ],
    publisher: {
      '@type': 'Organization',
      name: 'Drishyam News',
      logo: {
        '@type': 'ImageObject',
        url: 'https://drishyam-news.com/logo.png',
      },
    },
    description: displayExcerpt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://drishyam-news.com/article/${slug}`,
    },
  };



  return (
    <main className="flex flex-col min-h-screen bg-white">
      {/* Structured Data for SEO */}
      <script
        id="article-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Header />
      <Navbar />

      <div className="flex-1 bg-white">
        <ArticleHeader article={article} author={author || undefined} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Main Content Column */}
            <div className="lg:col-span-8">
              <ArticleContent
                content={article.content}
                content_hi={article.content_hi}
                keyPoints={article.keyPoints}
                articleType={article.articleType}
                contentFont={article.contentFont}
              />

              {galleryImages.length > 0 && (
                <ArticleImageGallery images={galleryImages} title={displayTitle} />
              )}

              <ShareButtons title={displayTitle} url={`/article/${slug}`} />

              {/* Author Bio */}
              {author && (
                <div className="bg-secondary/20 p-8 rounded-sm my-12 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left border border-border/50">
                  <div className="relative w-20 h-20 shrink-0 rounded-full overflow-hidden bg-muted">
                    {(author.avatar) && (
                      <Image
                        src={author.avatar || ''}
                        alt={author.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold font-serif mb-2">{author.name}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {author.bio || 'Author bio coming soon.'}
                    </p>
                    <Link
                      href={`/author/${author.id}`}
                      className="text-primary font-bold text-xs uppercase tracking-widest hover:underline"
                    >
                      More from this author →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <ArticleSidebar
                relatedArticles={filteredRelated}
                trendingArticles={trendingArticles}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
