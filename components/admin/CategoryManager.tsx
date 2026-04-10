'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Category } from '@/lib/types';
import { CategoryForm } from './CategoryForm';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { deleteCategoryAction } from '@/lib/actions/dashboard-actions';
import { useRouter } from 'next/navigation';

interface CategoryManagerProps {
  initialCategories: Category[];
  categoryCounts: Record<string, number>;
}

export function CategoryManager({ initialCategories, categoryCounts }: CategoryManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleAdd = () => {
    setEditingCategory(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingCategory(undefined);
  };

  const handleDelete = async (cat: Category) => {
    const articleCount = categoryCounts[cat.id] || 0;
    const confirmationMessage =
      articleCount > 0
        ? `"${cat.name}" has ${articleCount} article(s). Deleting it may leave those articles without a valid category. Continue?`
        : `Delete "${cat.name}" category?`;

    if (!window.confirm(confirmationMessage)) return;

    setDeleteError(null);
    setDeletingCategoryId(cat.id);

    try {
      const result = await deleteCategoryAction(cat.id);
      if (!result.success) throw new Error(result.error || 'Failed to delete category');

      setCategories((prev) => prev.filter((item) => item.id !== cat.id));
      router.refresh();
    } catch (err) {
      console.error('[CategoryManager] Delete error:', err);
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setDeletingCategoryId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Categories</h1>
          <p className="text-muted-foreground">Manage editorial structure and coverage areas.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-sm hover:bg-black transition-all shadow-lg active:scale-95"
        >
          <PlusCircle size={18} />
          New Category
        </button>
      </div>

      {isFormOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg m-auto">
            <CategoryForm 
              category={editingCategory} 
              onClose={handleClose}
              onSuccess={() => {
                // Actions refresh naturally
              }}
            />
          </div>
        </div>,
        document.body
      )}

      {deleteError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {deleteError}
        </div>
      )}

      <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="py-4 px-6 font-semibold">Category Name</th>
              <th className="py-4 px-6 font-semibold">Description</th>
              <th className="py-4 px-6 font-semibold text-center">Article Count</th>
              <th className="py-4 px-6 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-secondary/20 transition-colors group">
                <td className="py-4 px-6">
                  <div className="font-hindi text-lg font-bold text-foreground">{cat.name_hi || cat.name}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{cat.name_en || 'NO ENGLISH LABEL'}</div>
                  <div className="text-[10px] text-muted-foreground/60 font-mono mt-1">/{cat.slug}</div>
                </td>
                <td className="py-4 px-6 text-muted-foreground max-w-sm truncate">
                  {cat.description}
                </td>
                <td className="py-4 px-6 text-center">
                   <span className="inline-flex items-center justify-center px-2 py-1 bg-secondary text-foreground font-bold rounded-sm text-xs min-w-[2rem] border border-border">
                     {categoryCounts[cat.id] || 0}
                   </span>
                </td>
                <td className="py-4 px-6 text-right space-x-2">
                  <button 
                    onClick={() => handleEdit(cat)}
                    className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest"
                  >
                    <Pencil size={14} />
                    <span className="hidden md:inline">Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(cat)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest hidden md:inline-flex disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete category"
                    disabled={deletingCategoryId === cat.id}
                  >
                    <Trash2 size={14} />
                    <span className="hidden md:inline">{deletingCategoryId === cat.id ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
