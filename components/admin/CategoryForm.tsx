'use client';

import { useState, useMemo } from 'react';
import { Category } from '@/lib/types';
import { createCategoryAction, updateCategoryAction } from '@/lib/actions/dashboard-actions';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/utils';
import { 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Save, 
  X,
  Tags,
  Hash,
  Languages
} from 'lucide-react';

interface CategoryFormProps {
  category?: Category;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function CategoryForm({ category, onClose, onSuccess }: CategoryFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name_hi: category?.name_hi || category?.name || '',
    name_en: category?.name_en || '',
    description: category?.description || '',
    order: category?.order || 0,
    slug: category?.slug || '',
  });

  // Slug defaults to English name if present, else derived from HI (less ideal but possible)
  const slugValue = useMemo(() => {
    if (formData.slug && category) return formData.slug; // Keep existing slug if editing
    return slugify(formData.name_en || formData.name_hi);
  }, [formData.name_en, formData.name_hi, formData.slug, category]);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name_hi.trim()) errors.name_hi = 'Hindi Label is required (Primary)';
    if (!formData.name_en.trim()) errors.name_en = 'English Label is required (Secondary)';
    if (!formData.description.trim()) errors.description = 'Description is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const submitData = {
        name: formData.name_hi, // name becomes the Hindi source
        name_hi: formData.name_hi,
        name_en: formData.name_en,
        slug: slugValue,
        description: formData.description,
        order: Number(formData.order),
      };

      if (category) {
        const result = await updateCategoryAction(category.id, submitData);
        if (!result.success) throw new Error(result.error);
      } else {
        const result = await createCategoryAction(submitData);
        if (!result.success) throw new Error(result.error);
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
      
      setTimeout(() => {
        router.refresh();
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      console.error('[CategoryForm] Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-w-lg w-full mx-auto">
      <div className="px-6 py-4 border-b border-border bg-secondary/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Languages size={18} className="text-primary" />
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/70">
            {category ? 'Edit Category' : 'New News Category'}
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
            <p className="text-sm font-medium">Category synchronized successfully!</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
              Hindi Label <span className="text-primary font-bold">(Primary)</span>
            </label>
            <input
              type="text"
              placeholder="उदाहरण: भारत, राजनीति"
              className={`w-full bg-background p-4 border-2 rounded-lg font-hindi text-xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${
                validationErrors.name_hi ? 'border-red-200' : 'border-border focus:border-primary'
              }`}
              value={formData.name_hi}
              onChange={(e) => setFormData({ ...formData, name_hi: e.target.value })}
            />
            {validationErrors.name_hi && <p className="text-[10px] text-red-500 mt-1 font-bold">{validationErrors.name_hi}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
              English Label <span className="text-muted-foreground/60">(Translation)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. India, Politics"
              className={`w-full bg-background p-3 border-2 rounded-lg font-sans text-lg focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${
                validationErrors.name_en ? 'border-red-200' : 'border-border focus:border-primary'
              }`}
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
            />
             {validationErrors.name_en && <p className="text-[10px] text-red-500 mt-1 font-bold">{validationErrors.name_en}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">URL Slug (Derived from EN)</label>
            <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg border border-border/50">
              <Hash size={14} className="text-primary" />
              <span className="text-xs font-mono font-bold text-muted-foreground">/{slugValue}</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Description</label>
            <textarea
              placeholder="What kind of stories belong here?"
              className={`w-full bg-background p-4 border-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all min-h-[100px] resize-none ${
                validationErrors.description ? 'border-red-200' : 'border-border focus:border-primary'
              }`}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Display Order</label>
            <input
              type="number"
              className="w-full bg-background p-3 border rounded-lg focus:ring-2 focus:ring-primary text-sm"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button 
            type="submit" 
            disabled={loading || success}
            className="flex-1 py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-lg shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />}
            {category ? 'Update' : 'Create'}
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
