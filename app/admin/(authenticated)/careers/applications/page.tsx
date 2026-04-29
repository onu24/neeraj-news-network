import { getJobApplications } from '@/lib/actions/careers';
import Link from 'next/link';
import { ArrowLeft, FileText, ExternalLink, Mail, Phone } from 'lucide-react';

export const revalidate = 0;

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const { jobId } = await searchParams;
  const applications = await getJobApplications(jobId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Job Applications
            </h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-xl">
            Review submitted resumes and candidate details.
          </p>
        </div>
        <div>
          <Link
            href="/admin/careers"
            className="px-4 py-2 border border-border text-foreground text-sm font-medium rounded-sm hover:bg-secondary transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back to Jobs
          </Link>
        </div>
      </div>

      <div className="bg-background border border-border/60 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-[400px]">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">No applications yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              When candidates apply for your job openings, their details will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/30 border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="py-4 px-6 font-semibold">Candidate</th>
                  <th className="py-4 px-6 font-semibold">Applied For</th>
                  <th className="py-4 px-6 font-semibold">Contact</th>
                  <th className="py-4 px-6 font-semibold">Date</th>
                  <th className="py-4 px-6 font-semibold text-right">Resume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="font-bold text-foreground">{app.applicantName}</div>
                      {app.coverLetter && (
                         <div className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-xs" title={app.coverLetter}>
                           {app.coverLetter}
                         </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-foreground">{app.jobTitle}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <a href={`mailto:${app.applicantEmail}`} className="text-muted-foreground hover:text-primary flex items-center gap-1.5">
                          <Mail size={12} /> {app.applicantEmail}
                        </a>
                        {app.applicantPhone && (
                          <a href={`tel:${app.applicantPhone}`} className="text-muted-foreground hover:text-primary flex items-center gap-1.5">
                            <Phone size={12} /> {app.applicantPhone}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground whitespace-nowrap">
                      {new Date(app.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {app.resumeUrl ? (
                         <a 
                          href={app.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-md transition-colors text-xs font-bold uppercase"
                        >
                          View PDF <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">No Resume</span>
                      )}
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
