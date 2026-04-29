import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ArticleHeader } from '@/components/article/ArticleHeader';
import { ArticleContent } from '@/components/article/ArticleContent';
import { ArticleSidebar } from '@/components/article/ArticleSidebar';
import { AdContainer } from '@/components/AdContainer';
import { ShareButtons } from '@/components/article/ShareButtons';
import { ArticleImageGallery } from '@/components/article/ArticleImageGallery';
import { ReadingProgress } from '@/components/article/ReadingProgress';
import { TableOfContents } from '@/components/article/TableOfContents';
import { RelatedEngagement } from '@/components/article/RelatedEngagement';
import { ViewTracker } from '@/components/article/ViewTracker';
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
import Script from 'next/script';

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
  const title = (article.title_hi && article.title_hi.trim() !== '') ? article.title_hi : article.title;
  const description = (article.excerpt_hi && article.excerpt_hi.trim() !== '') ? article.excerpt_hi : (article.excerpt || article.excerpt_hi);
  
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
    alternates: {
      canonical: `https://drishyam-news.com/article/${slug}`,
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
  const displayTitle = (article.title_hi && article.title_hi.trim() !== '') ? article.title_hi : article.title;
  const displayExcerpt = (article.excerpt_hi && article.excerpt_hi.trim() !== '') ? article.excerpt_hi : (article.excerpt || article.excerpt_hi);

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
      <ViewTracker slug={slug} />
      <ReadingProgress />
      {/* Structured Data for SEO */}
      <Script
        id="article-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        strategy="afterInteractive"
      />
      
      <Header />
      <Navbar />

      <div className="flex-1 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          
          {/* Breadcrumbs - Moved here for better column alignment */}
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="opacity-30">/</span>
            <Link href={`/category/${article.categorySlug || 'news'}`} className="hover:text-primary transition-colors">
              {article.category || 'News'}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16">
            
            {/* Left Column (~70% / 8 grid cols) */}
            <div className="lg:col-span-8 flex flex-col">
              <ArticleHeader article={article} author={author || undefined} />
              
              <AdContainer slot="article_top_banner" className="bg-secondary/10" />


              <div className="mt-12">
                <TableOfContents content={article.content_hi || article.content} />
                
                <ArticleContent
                  content={article.content}
                  content_hi={article.content_hi}
                  keyPoints={article.keyPoints}
                  articleType={article.articleType}
                  contentFont={article.contentFont}
                />
              </div>

              {galleryImages.length > 0 && (
                <div className="mt-12">
                  <ArticleImageGallery images={galleryImages} title={displayTitle} />
                </div>
              )}

              {/* Tags Section */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-12 py-8 border-t border-zinc-100">
                  {article.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-500 rounded-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Related, History & Discovery */}
              <RelatedEngagement currentArticle={article} />
            </div>

            {/* Right Sidebar (~30% / 4 grid cols) */}
            <div className="lg:col-span-4 mt-12 lg:mt-0 space-y-8">
              <AdContainer slot="sidebar_top_square" format="rectangle" className="bg-secondary/10" />
              <ArticleSidebar
                relatedArticles={filteredRelated}
                trendingArticles={trendingArticles}
                articleTitle={displayTitle}
                articleUrl={`/article/${slug}`}
                articleSlug={slug}
              />
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
