'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Author } from '@/lib/types';
import { AuthorForm } from './AuthorForm';
import { deleteAuthorAction } from '@/lib/actions/dashboard-actions';
import { Pencil, PlusCircle, Trash2 } from 'lucide-react';

interface AuthorManagerProps {
  initialAuthors: Author[];
  authorCounts: Record<string, number>;
}

const DEFAULT_AVATAR = '/placeholder-user.jpg';

export function AuthorManager({ initialAuthors, authorCounts }: AuthorManagerProps) {
  const [authors, setAuthors] = useState(initialAuthors);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAuthors(initialAuthors);
  }, [initialAuthors]);

  const handleAdd = () => {
    setEditingAuthor(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingAuthor(undefined);
  };

  const handleDelete = async (author: Author) => {
    const contributionCount = authorCounts[author.id] || 0;
    if (contributionCount > 0) {
      window.alert(`This author has ${contributionCount} linked article(s). Reassign them first.`);
      return;
    }

    const confirmed = window.confirm(`Delete author "${author.name}" permanently?`);
    if (!confirmed) return;

    setDeletingId(author.id);
    try {
      const result = await deleteAuthorAction(author.id);
      if (!result.success) {
        throw new Error(result.error || 'Delete failed');
      }

      setAuthors((prev) => prev.filter((a) => a.id !== author.id));
    } catch (err) {
      console.error('[AuthorManager] Delete error:', err);
      window.alert(err instanceof Error ? err.message : 'Failed to delete author');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Authors</h1>
          <p className="text-muted-foreground">Manage the editorial team and contributor profiles.</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-sm hover:bg-black transition-all shadow-lg active:scale-95"
        >
          <PlusCircle size={18} />
          Add Author
        </button>
      </div>

      {isFormOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="w-full max-w-2xl m-auto">
              <AuthorForm author={editingAuthor} onClose={handleClose} />
            </div>
          </div>,
          document.body
        )}

      <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="py-4 px-6 font-semibold">Author</th>
              <th className="py-4 px-6 font-semibold">Contact / Bio</th>
              <th className="py-4 px-6 font-semibold text-center">Published</th>
              <th className="py-4 px-6 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {authors.map((author) => (
              <tr key={author.id} className="hover:bg-secondary/20 transition-colors group">
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 relative overflow-hidden rounded-full bg-secondary border border-border">
                      <Image
                        src={author.avatar || DEFAULT_AVATAR}
                        alt={author.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{author.name}</div>
                      <div className="text-xs font-semibold text-primary uppercase tracking-wide mt-0.5">
                        {author.role || 'Contributor'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="text-sm text-foreground">{author.email || '-'}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-1 max-w-sm">{author.bio}</div>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center justify-center px-2 py-1 bg-secondary text-foreground font-bold rounded-sm text-xs min-w-[2rem] border border-border">
                    {authorCounts[author.id] || 0}
                  </span>
                </td>
                <td className="py-4 px-6 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(author)}
                    className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest"
                  >
                    <Pencil size={14} />
                    <span className="hidden md:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(author)}
                    disabled={deletingId === author.id}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={14} />
                    <span className="hidden md:inline">
                      {deletingId === author.id ? 'Deleting' : 'Delete'}
                    </span>
                  </button>
                </td>
              </tr>
            ))}
            {authors.length === 0 && (
              <tr>
                <td colSpan={4} className="py-10 px-6 text-center text-muted-foreground">
                  No authors yet. Add your first author profile.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
