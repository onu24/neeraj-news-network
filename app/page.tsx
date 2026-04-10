import { TopBar } from '@/components/layout/TopBar';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BreakingStrip } from '@/components/homepage/BreakingStrip';
import { HeroLatestSection } from '@/components/homepage/HeroLatestSection';
import { SectionBlock } from '@/components/homepage/Section';
import { ExplainerGrid } from '@/components/homepage/ExplainerGrid';
import { OpinionRow } from '@/components/homepage/OpinionRow';
import { VideoCarousel } from '@/components/homepage/VideoCarousel';
import { VisualStories } from '@/components/homepage/VisualStories';
import { FeedPersonalization } from '@/components/homepage/FeedPersonalization';
import { AdContainer } from '@/components/AdContainer';

import { 
  getFeaturedArticle, 
  getLatestArticles, 
  getArticlesByCategory,
  getArticlesByType,
} from '@/lib/data-server';

// Exported ISR Revalidation
export const revalidate = 60;

export const metadata = {
  title: 'Drishyam News - Breaking News & Analysis',
  description: 'Latest news, breaking stories, and in-depth analysis on politics, business, technology, and more.',
};

export default async function Home() {

  const [
    featured,
    latest,
    indiaNews,
    politicsNews,
    economyNews,
    techNews,
    sportsNews,
    entertainNews,
    jobsNews,
    examsNews,
    explainerArticles,
    opinionArticles,
    videoArticles,
  ] = await Promise.all([
    getFeaturedArticle(),
    getLatestArticles(12),
    getArticlesByCategory('india', 5),
    getArticlesByCategory('politics', 5),
    getArticlesByCategory('economy', 5),
    getArticlesByCategory('technology', 5),
    getArticlesByCategory('sports', 6),
    getArticlesByCategory('entertainment', 6),
    getArticlesByCategory('jobs', 4),
    getArticlesByCategory('exams', 4),
    getArticlesByType('explainer', 3),
    getArticlesByType('opinion', 4),
    getArticlesByType('video', 5),
  ]);

  const leadArticle = featured || latest[0];
  const sidebarLatest = latest.filter(a => a.id !== leadArticle?.id).slice(0, 5);
  const hasIndiaNews = indiaNews.length > 0;
  const hasEconomyNews = economyNews.length > 0;
  const hasPoliticsNews = politicsNews.length > 0;
  const hasTechNews = techNews.length > 0;
  const hasSportsNews = sportsNews.length > 0;
  const hasEntertainmentNews = entertainNews.length > 0;
  const hasJobsNews = jobsNews.length > 0;
  const hasExamsNews = examsNews.length > 0;


  return (
    <div className="flex flex-col min-h-screen bg-white">
      <TopBar />
      <Header />
      <Navbar />
      <BreakingStrip articles={latest.slice(0, 5)} />
      
      <main className="flex-1 w-full space-y-4">
        {/* Above the Fold: Lead Hierarchy */}
        {leadArticle && (
          <HeroLatestSection 
            leadArticle={leadArticle} 
            latestArticles={sidebarLatest} 
          />
        )}

        {/* Lead Ad Banner */}
        <div className="max-w-7xl mx-auto px-4 py-2">
          <AdContainer slot="home_top_banner" format="auto" className="bg-secondary/20 min-h-[100px]" />
        </div>
        
        {/* India News: Editorial Feature */}
        {hasIndiaNews && (
          <SectionBlock
            category="india"
            articles={indiaNews}
            variant="feature"
          />
        )}
        
        {/* Economy & Tech: Grid Layout */}
        {hasEconomyNews && (
          <div className="bg-zinc-50 border-y border-border/40 py-4">
            <SectionBlock
              category="economy"
              articles={economyNews}
              variant="grid"
            />
          </div>
        )}

        {/* Opinion Section (Full Width Editorial) */}
        <OpinionRow articles={opinionArticles} />
        
        {/* Politics: Dynamic Side-by-Side */}
        {hasPoliticsNews && (
          <SectionBlock
            category="politics"
            articles={politicsNews}
            variant="side-by-side"
          />
        )}

        {/* Visual Content Layer */}
        <VisualStories />
        <VideoCarousel articles={videoArticles} />

        {/* Tech: Grid Layout */}
        {hasTechNews && (
          <SectionBlock
            category="technology"
            articles={techNews}
            variant="grid"
          />
        )}

        {/* Explainers: High Value Content */}
        <ExplainerGrid articles={explainerArticles} />

        {/* Middle Ad Banner */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <AdContainer slot="home_mid_banner" format="auto" className="bg-secondary/20 min-h-[100px]" />
        </div>

        {/* Sports & Entertainment: Light Grid */}
        {(hasSportsNews || hasEntertainmentNews) && (
          <div className="bg-zinc-50 border-y border-border/40 py-4">
            {hasSportsNews && (
              <SectionBlock
                category="sports"
                articles={sportsNews}
                variant="grid"
              />
            )}
            {hasEntertainmentNews && (
              <SectionBlock
                category="entertainment"
                articles={entertainNews}
                variant="grid"
              />
            )}
          </div>
        )}

        {/* Jobs & Exams: List View */}
        {(hasJobsNews || hasExamsNews) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 max-w-7xl mx-auto px-4 gap-12 py-10">
            {hasJobsNews && (
              <SectionBlock
                category="jobs"
                articles={jobsNews}
                variant="minimal-list"
              />
            )}
            {hasExamsNews && (
              <SectionBlock
                category="exams"
                articles={examsNews}
                variant="minimal-list"
              />
            )}
          </div>
        )}

        <FeedPersonalization />
      </main>

      <Footer />
    </div>
  );
}
