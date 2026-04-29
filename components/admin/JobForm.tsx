'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createJobOpening, updateJobOpening, deleteJobOpening } from '@/lib/actions/careers';
import { JobOpening } from '@/lib/types';
import { Save, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function JobForm({ initialData }: { initialData?: JobOpening | null }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data: Partial<JobOpening> = {
      title: formData.get('title') as string,
      location: formData.get('location') as string,
      type: formData.get('type') as string,
      description: formData.get('description') as string,
      isActive: formData.get('isActive') === 'on',
    };

    let result;
    if (initialData?.id) {
      result = await updateJobOpening(initialData.id, data);
    } else {
      result = await createJobOpening(data);
    }

    if (result.success) {
      router.push('/admin/careers');
    } else {
      setError(result.error || 'Something went wrong');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    setIsDeleting(true);
    const result = await deleteJobOpening(initialData.id);
    if (result.success) {
      router.push('/admin/careers');
    } else {
      setError(result.error || 'Failed to delete');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/careers" className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm">
          <ArrowLeft size={16} /> Back to Jobs
        </Link>
        {initialData?.id && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2"
          >
            <Trash2 size={16} /> {isDeleting ? 'Deleting...' : 'Delete Job'}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-background border border-border/60 rounded-xl p-6 shadow-sm space-y-6">
        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">{error}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Job Title</label>
            <input
              required
              name="title"
              defaultValue={initialData?.title}
              className="w-full p-2.5 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              placeholder="e.g. Senior Political Reporter"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Location</label>
            <input
              required
              name="location"
              defaultValue={initialData?.location}
              className="w-full p-2.5 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              placeholder="e.g. New Delhi, India"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Job Type</label>
            <select
              name="type"
              defaultValue={initialData?.type || 'Full-time'}
              className="w-full p-2.5 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div className="space-y-2 flex flex-col justify-center">
            <label className="flex items-center gap-3 cursor-pointer mt-6">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={initialData ? initialData.isActive : true}
                className="w-5 h-5 accent-primary rounded cursor-pointer"
              />
              <span className="text-sm font-bold text-foreground">Active (Visible on Careers Page)</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">Job Description</label>
          <p className="text-xs text-muted-foreground mb-2">You can use Markdown or HTML formatting here.</p>
          <textarea
            required
            name="description"
            defaultValue={initialData?.description}
            rows={12}
            className="w-full p-3 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-mono"
            placeholder="Describe the role, responsibilities, and requirements..."
          />
        </div>

        <div className="pt-4 border-t border-border/50 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-sm text-sm font-black uppercase tracking-wider flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
          >
            <Save size={18} />
            {isSubmitting ? 'Saving...' : 'Save Job Opening'}
          </button>
        </div>
      </form>
    </div>
  );
}
