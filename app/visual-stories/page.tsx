import { TopBar } from '@/components/layout/TopBar';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { getVisualStories } from '@/lib/data';

export const metadata = {
  title: 'Visual Stories | Drishyam News',
  description: 'Immersive visual stories from around the world. Breaking news, entertainment, and technology through snapshots.',
};

export default async function VisualStoriesHub() {
  const stories = await getVisualStories();

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      <Header />
      <Navbar />

      <main className="flex-1 bg-secondary/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-[0.2em] rounded-full mb-4 inline-block">
              Web Stories
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold font-serif text-foreground tracking-tight">
              Visual Stories
            </h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the news through immersive, swipeable visual updates. Best enjoyed on mobile.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/visual-stories/${story.slug}`}
                className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-zinc-200 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Image
                  src={story.coverImage}
                  alt={story.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest mb-1 block">
                    {story.category}
                  </span>
                  <h2 className="text-white text-lg font-bold font-serif leading-tight">
                    {story.title}
                  </h2>
                </div>

                {/* Indication of multiple slides */}
                <div className="absolute top-3 right-3 flex gap-1">
                   <div className="w-1 h-3 bg-white/40 rounded-full" />
                   <div className="w-1 h-3 bg-white/40 rounded-full" />
                   <div className="w-1 h-3 bg-white/40 rounded-full" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
