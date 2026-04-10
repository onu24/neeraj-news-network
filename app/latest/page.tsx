import { TopBar } from '@/components/layout/TopBar';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LatestFeed } from '@/components/latest/LatestFeed';
import { getLatestArticles } from '@/lib/data-server';

export const revalidate = 60;

export const metadata = {
  title: 'Latest Updates | Drishyam News',
  description: 'Stay updated with the latest breaking news, stories, and analysis from Drishyam News.',
};

export default async function LatestPage() {
  const articles = await getLatestArticles(20);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <TopBar />
      <Header />
      <Navbar />
      
      <main className="flex-1 w-full bg-secondary/10 pb-16">
        <LatestFeed articles={articles} />
      </main>

      <Footer />
    </div>
  );
}
