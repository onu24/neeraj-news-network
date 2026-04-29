import { getJobOpenings } from '@/lib/actions/careers';
import { TopBar } from '@/components/layout/TopBar';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CareersPageClient } from '@/components/pages/CareersPageClient';

export const metadata = {
  title: 'Careers — Drishyam News',
  description: 'Join Drishyam News and build the future of independent journalism.',
};

// Force dynamic so new jobs show up immediately
export const revalidate = 0;

export default async function CareersPage() {
  const openings = await getJobOpenings(true); // Fetch only active jobs

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      <Header />
      <Navbar />

      <CareersPageClient openings={openings as any} />

      <Footer />
    </div>
  );
}
