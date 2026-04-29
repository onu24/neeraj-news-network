import { JobForm } from '@/components/admin/JobForm';
import { getJobOpening } from '@/lib/actions/careers';
import { notFound } from 'next/navigation';

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJobOpening(id);

  if (!job) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Edit Job: {job.title}</h1>
        <p className="text-muted-foreground text-sm">Update the details of this career opportunity.</p>
      </div>
      <JobForm initialData={job as any} />
    </div>
  );
}
