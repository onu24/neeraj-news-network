import { getJobOpenings } from '@/lib/actions/careers';
import Link from 'next/link';
import { PlusCircle, BriefcaseBusiness, Inbox } from 'lucide-react';

export const revalidate = 0; // Always fetch latest jobs in admin

export default async function AdminCareersPage() {
  const jobs = await getJobOpenings(false); // Fetch all jobs

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Careers Management
            </h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-xl">
            Manage job postings and review submitted applications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/careers/applications"
            className="px-4 py-2 border border-border text-foreground text-sm font-medium rounded-sm hover:bg-secondary transition-colors inline-flex items-center gap-2"
          >
            <Inbox size={16} /> View Applications
          </Link>
          <Link
            href="/admin/careers/create"
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <PlusCircle size={16} /> New Job
          </Link>
        </div>
      </div>

      <div className="bg-background border border-border/60 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-[400px]">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <BriefcaseBusiness size={32} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">No job openings</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              You have not posted any job openings yet.
            </p>
            <Link
              href="/admin/careers/create"
              className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors inline-block"
            >
              Post a Job
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/30 border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="py-4 px-6 font-semibold">Job Title</th>
                  <th className="py-4 px-6 font-semibold">Location / Type</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold">Posted On</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="font-medium text-foreground">{job.title}</div>
                      <div className="text-xs text-muted-foreground">{job.slug}</div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">
                      {job.location} • {job.type}
                    </td>
                    <td className="py-4 px-6">
                      {job.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-bold bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-bold bg-secondary/80 text-foreground">
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground whitespace-nowrap">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {/* Using Link for edit. To keep simple, we can just use create page with edit logic or separate component */}
                      <Link 
                        href={`/admin/careers/${job.id}`}
                        className="text-primary hover:underline text-sm font-semibold"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
