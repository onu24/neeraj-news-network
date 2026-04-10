'use client';

import { useState } from 'react';
import { Author } from '@/lib/types';
import { createAuthorAction, updateAuthorAction } from '@/lib/actions/dashboard-actions';
import { useRouter } from 'next/navigation';
import { AvatarUpload } from './AvatarUpload';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
  UserRound,
  X,
} from 'lucide-react';

interface AuthorFormProps {
  author?: Author;
  onClose?: () => void;
  onSuccess?: () => void;
}

const DEFAULT_AVATAR = '/placeholder-user.jpg';

export function AuthorForm({ author, onClose, onSuccess }: AuthorFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: author?.name || '',
    email: author?.email || '',
    role: author?.role || '',
    avatar: author?.avatar || '',
    bio: author?.bio || '',
    twitter: author?.socialLinks?.twitter || '',
    linkedin: author?.socialLinks?.linkedin || '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.bio.trim()) errors.bio = 'Bio is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isUploadingAvatar) return;
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload: Omit<Author, 'id'> = {
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        avatar: formData.avatar.trim() || DEFAULT_AVATAR,
        email: formData.email.trim() || undefined,
        role: formData.role.trim() || undefined,
        socialLinks:
          formData.twitter.trim() || formData.linkedin.trim()
            ? {
                twitter: formData.twitter.trim() || undefined,
                linkedin: formData.linkedin.trim() || undefined,
              }
            : undefined,
      };

      if (author) {
        const result = await updateAuthorAction(author.id, payload);
        if (!result.success) throw new Error(result.error);
      } else {
        const result = await createAuthorAction(payload);
        if (!result.success) throw new Error(result.error);
      }

      setSuccess(true);
      onSuccess?.();

      setTimeout(() => {
        router.refresh();
        onClose?.();
      }, 800);
    } catch (err) {
      console.error('[AuthorForm] Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save author');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-w-2xl w-full mx-auto">
      <div className="px-6 py-4 border-b border-border bg-secondary/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserRound size={18} className="text-primary" />
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/70">
            {author ? 'Edit Author' : 'New Author'}
          </h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
            <AlertCircle className="flex-shrink-0" size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg">
            <CheckCircle2 className="flex-shrink-0" size={20} />
            <p className="text-sm font-medium">Author saved successfully.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
              Avatar
            </label>
            <AvatarUpload
              currentAvatar={formData.avatar}
              onAvatarUpload={(url) => setFormData({ ...formData, avatar: url })}
              onUploadingChange={setIsUploadingAvatar}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full bg-background p-3 border-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${
                validationErrors.name ? 'border-red-200' : 'border-border focus:border-primary'
              }`}
              placeholder="e.g. Aarav Sharma"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
              Role
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-background p-3 border-2 border-border rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
              placeholder="Senior Correspondent"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full bg-background p-3 border-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${
                validationErrors.email ? 'border-red-200' : 'border-border focus:border-primary'
              }`}
              placeholder="author@drishyam-news.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
              Twitter
            </label>
            <input
              type="url"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              className="w-full bg-background p-3 border-2 border-border rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
              placeholder="https://x.com/username"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
              LinkedIn
            </label>
            <input
              type="url"
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              className="w-full bg-background p-3 border-2 border-border rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className={`w-full bg-background p-4 border-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all min-h-[120px] resize-none ${
              validationErrors.bio ? 'border-red-200' : 'border-border focus:border-primary'
            }`}
            placeholder="Short author bio..."
          />
        </div>

        <div className="pt-2 flex gap-3">
          <button
            type="submit"
            disabled={loading || success || isUploadingAvatar}
            className="flex-1 py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-lg shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />}
            {author ? 'Update' : 'Create'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-4 border border-border text-foreground font-black uppercase tracking-widest rounded-lg hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
