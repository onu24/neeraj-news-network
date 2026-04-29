import { JobForm } from '@/components/admin/JobForm';

export default function CreateJobPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Post New Job</h1>
        <p className="text-muted-foreground text-sm">Fill in the details to publish a new career opportunity.</p>
      </div>
      <JobForm />
    </div>
  );
}
