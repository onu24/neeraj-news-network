import { TopBar } from '@/components/layout/TopBar';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ArticleCard } from '@/components/homepage/ArticleCard';
import { CategorySidebar } from '@/components/category/CategorySidebar';
import { SportsScoreboard } from '@/components/sports/SportsScoreboard';
import { getLiveCricketScores } from '@/lib/cricket';
import { 
  getArticlesByCategory, 
  getLatestGlobalArticles, 
  getTrendingArticles,
  getCategoryBySlug 
} from '@/lib/data';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

export const revalidate = 60; // ISR cache

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found' };
  
  return {
    title: `${category.name} News - Drishyam News`,
    description: category.description || `Latest breaking news and stories related to ${category.name}.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const isSports = slug === 'sports' || slug === 'खेल';

  const [category, allArticles, latestGlobal, trending, liveMatches] = await Promise.all([
    getCategoryBySlug(slug),
    getArticlesByCategory(slug, 15),
    getLatestGlobalArticles(6),
    getTrendingArticles(5),
    isSports ? getLiveCricketScores() : Promise.resolve([])
  ]);

  if (!category) {
    notFound();
  }

  const leadStory = allArticles[0];
  const remainingArticles = allArticles.slice(1);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <TopBar />
      <Header />
      <Navbar />
      
      <main className="flex-1 w-full bg-white dark:bg-zinc-950 pb-20">
        {/* Category Header & Breadcrumbs */}
        <div className="bg-secondary/10 dark:bg-zinc-900/50 border-b border-border/40 mb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">{category.name}</span>
            </nav>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <h1 className="font-serif text-5xl lg:text-7xl font-bold uppercase tracking-tighter text-foreground mb-4">
                  {category.name}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground font-serif leading-relaxed italic">
                  {category.description || `Comprehensive coverage and breaking updates in ${category.name.toLowerCase()}.`}
                </p>
              </div>
              <div className="hidden lg:block text-right">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary block mb-1">Live Updates</span>
                <span className="text-xs font-serif italic text-muted-foreground">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specialized Widgets for Categories */}
        {isSports && <SportsScoreboard initialMatches={liveMatches} />}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-12">
              {allArticles.length === 0 ? (
                <div className="text-center py-20 bg-secondary/5 border-2 border-dashed border-border rounded-sm">
                  <p className="mb-6 text-xl font-serif italic text-muted-foreground">We are currently updating our coverage in this section.</p>
                  <Link href="/" className="px-6 py-2 bg-primary text-white font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors">
                    Return to Home
                  </Link>
                </div>
              ) : (
                <>
                  {/* Lead Story Spotlight */}
                  {leadStory && (
                    <div className="pb-12 border-b border-border/60">
                      <ArticleCard article={leadStory} variant="featured" />
                    </div>
                  )}

                  {/* Secondary Story Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                    {remainingArticles.map((article, index) => (
                      <ArticleCard key={article.id} article={article} variant="default" />
                    ))}
                  </div>

                  {/* Optional Load More / Pagination */}
                  {allArticles.length >= 15 && (
                    <div className="pt-10 flex justify-center">
                      <button className="px-10 py-3 border-2 border-primary text-primary font-bold uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all duration-300">
                        Load More Stories
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4">
               <CategorySidebar 
                 latestArticles={latestGlobal}
                 trendingArticles={trending}
               />
            </div>
            
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
