import { getJobOpening } from '@/lib/actions/careers';
import { TopBar } from '@/components/layout/TopBar';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { notFound } from 'next/navigation';
import { JobDetailsClient } from '@/components/careers/JobDetailsClient';

export const revalidate = 60; // Cache for 1 minute

export default async function JobDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJobOpening(slug);

  if (!job || !job.isActive) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      <Header />
      <Navbar />

      <main className="flex-1 bg-secondary/10">
        <JobDetailsClient job={job as any} />
      </main>

      <Footer />
    </div>
  );
}
