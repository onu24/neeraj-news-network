'use client';

import { useState, useMemo, useEffect } from 'react';
import { Article, Category, Author, ArticleStatus, ArticleContentFont } from '@/lib/types';
import { createArticleAction, updateArticleAction } from '@/lib/actions/dashboard-actions';
import { ImageUpload } from './ImageUpload';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/utils';
import Image from 'next/image';
import { 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  ExternalLink, 
  Loader2, 
  Save, 
  Settings, 
  Tag, 
  X,
  PlusCircle,
  FileText,
  CloudUpload,
  Images,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

interface ArticleFormProps {
  article?: Article;
  availableCategories: Category[];
  availableAuthors: Author[];
}

export function ArticleForm({ article, availableCategories = [], availableAuthors = [] }: ArticleFormProps) {
  const router = useRouter();
  const fontOptions: { value: ArticleContentFont; label: string }[] = [
    { value: 'serif', label: 'Serif (Editorial)' },
    { value: 'sans', label: 'Sans (Modern)' },
    { value: 'mono', label: 'Mono (Technical)' },
    { value: 'roboto', label: 'Roboto' },
    { value: 'poppins', label: 'Poppins' },
    { value: 'merriweather', label: 'Merriweather' },
    { value: 'playfair', label: 'Playfair Display' },
  ];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [coverImage, setCoverImage] = useState(article?.coverImage || '');
  const [galleryImages, setGalleryImages] = useState<string[]>(article?.galleryImages?.filter(Boolean) || []);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingGalleryImages, setIsUploadingGalleryImages] = useState(false);

  const [formData, setFormData] = useState({
    title: article?.title || '',
    categoryId: article?.categoryId || '',
    authorId: article?.authorId || '',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    contentFont: (article?.contentFont || 'serif') as ArticleContentFont,
    status: (article?.status || 'draft') as ArticleStatus,
    featured: article?.featured || false,
    articleType: (article?.articleType || 'standard') as Article['articleType'],
    tags: article?.tags?.join(', ') || '',
    language: article?.language || 'en',
    isBreaking: article?.isBreaking || false,
    isLive: article?.isLive || false,
  });

  // Comprehensive Slug Preview
  const slugValue = useMemo(() => slugify(formData.title), [formData.title]);
  const fullUrlPreview = `drishyam-news.com/article/${slugValue || 'your-url-here'}`;

  // Form Validation State
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Headline is required';
    if (!formData.categoryId) errors.category = 'Please select a category';
    if (!formData.authorId) errors.author = 'Please select an author';
    if (!formData.excerpt.trim()) errors.excerpt = 'Summary is required for coverage cards';
    if (!formData.content.trim()) errors.content = 'Body content cannot be empty';
    if (!coverImage && formData.status === 'published') {
      errors.image = 'Headline image is mandatory for published reports';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    setGalleryImages((prev) => Array.from(new Set([...prev, newGalleryUrl.trim()])));
    setNewGalleryUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Client-side Validation (Workflow Guards)
    if (isUploadingImage || isUploadingGalleryImages) return; // Prevent double-submit while uploader is busy
    
    if (!validateForm()) {
      setError('Please resolve the highlighted validation errors before publishing.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const selectedCategory = availableCategories.find(c => c.id === formData.categoryId);

      // 2. Standardized Data Model
      const submitData = {
        title: formData.title,
        slug: slugValue,
        excerpt: formData.excerpt,
        content: formData.content,
        categoryId: formData.categoryId,
        category: selectedCategory?.name || 'Uncategorized',
        categorySlug: selectedCategory?.slug || 'uncategorized',
        authorId: formData.authorId,
        readingTime: Math.ceil(formData.content.length / 500) || 1,
        contentFont: formData.contentFont,
        status: formData.status,
        featured: formData.featured,
        articleType: formData.articleType,
        tags: tagsArray,
        coverImage: coverImage,
        galleryImages: galleryImages.filter(Boolean),
        language: formData.language as 'en' | 'hi',
        isBreaking: formData.isBreaking,
        isLive: formData.isLive,
      };

      if (article) {
        const result = await updateArticleAction(article.id, submitData);
        if (!result.success) throw new Error(result.error);
      } else {
        const result = await createArticleAction(submitData);
        if (!result.success) throw new Error(result.error);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/articles');
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error('[ArticleForm] Save error:', err);
      setError(`Database Error: ${err instanceof Error ? err.message : 'Failed to reach Firestore'}`);
    } finally {
      setLoading(false);
    }
  };

  // If Categories are missing, suggest setup
  const isDataMissing = availableCategories.length === 0;

  if (isDataMissing && !article) {
    return (
      <div className="bg-card border-2 border-dashed border-border rounded-xl p-12 text-center animate-in fade-in zoom-in duration-500">
         <div className="max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
               <Settings size={40} />
            </div>
            <h2 className="font-serif text-3xl font-bold text-foreground">Newsroom Setup Required</h2>
            <p className="text-muted-foreground leading-relaxed">
               Before you can draft a report, you must have at least one Category and one Author configured in the editorial suite.
            </p>
            <div className="flex flex-col gap-3">
               <Link 
                 href="/admin/categories" 
                 className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-sm hover:bg-black transition-colors"
               >
                 <PlusCircle size={18} />
                 Create Category
               </Link>
               <Link 
                 href="/admin/authors" 
                 className="flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground font-black uppercase tracking-widest rounded-sm hover:bg-secondary transition-colors"
               >
                 <PlusCircle size={18} />
                 Add Editorial Staff
               </Link>
            </div>
         </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl pb-20 animate-in fade-in duration-500">
      
      {/* Dynamic Status Banner */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 p-5 rounded-lg shadow-sm">
          <AlertCircle className="flex-shrink-0" size={24} />
          <div>
             <p className="font-black uppercase tracking-widest text-xs mb-0.5">Publishing Blocked</p>
             <p className="font-medium text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-lg shadow-sm">
          <CheckCircle2 className="flex-shrink-0" size={24} />
          <div>
             <p className="font-black uppercase tracking-widest text-xs mb-0.5">Success</p>
             <p className="font-medium text-sm">Report archived in Firestore. Redirecting to Newsroom...</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section: Media */}
          <div className="bg-card overflow-hidden border border-border rounded-xl shadow-sm transition-shadow hover:shadow-md">
            <div className="px-6 py-4 border-b border-border bg-secondary/5 flex items-center justify-between">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/70">Story Cover Media</h3>
               {validationErrors.image && <span className="text-[10px] text-red-500 font-bold uppercase">{validationErrors.image}</span>}
            </div>
            <div className="p-6">
              <ImageUpload 
                onImageUpload={setCoverImage} 
                onUploadingChange={setIsUploadingImage}
                currentImage={coverImage} 
              />

              <div className="mt-6 pt-6 border-t border-border/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground/80 flex items-center gap-2">
                      <Images size={14} />
                      Article Gallery (Multiple Images)
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload extra photos for this article. On mobile these will show as swipe slides.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                       <input
                        type="url"
                        placeholder="Paste image URL for gallery..."
                        className="w-full bg-background p-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
                        value={newGalleryUrl}
                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGalleryUrl())}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddGalleryUrl}
                      className="px-4 py-2 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-black transition-colors"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {galleryImages.map((img, index) => (
                      <div key={`${img}-${index}`} className="relative rounded-md overflow-hidden border border-border bg-secondary/20">
                        <div className="relative w-full aspect-[4/3]">
                          <Image
                            src={img}
                            alt={`Gallery image ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 50vw, 240px"
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-red-600 transition-colors"
                          aria-label="Remove gallery image"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Headline & Slug */}
          <div className="bg-card border border-border rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-border bg-secondary/5">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/70">Headline & SEO</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Primary Headline</label>
                <input
                  type="text"
                  placeholder="Enter the main headline of the story..."
                  className={`w-full bg-background font-serif text-3xl sm:text-4xl font-bold p-6 border-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${
                    validationErrors.title ? 'border-red-200' : 'border-border focus:border-primary'
                  }`}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <div className="mt-4 p-4 bg-secondary/30 rounded-lg flex items-center justify-between border border-border/50 group">
                   <div className="flex items-center gap-3">
                      <ExternalLink size={16} className="text-primary" />
                      <span className="text-[11px] font-mono font-bold text-muted-foreground truncate max-w-sm">
                        {fullUrlPreview}
                      </span>
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">Real-time Slug</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Editorial Summary (160 characters)</label>
                <textarea
                  placeholder="Write a gripping summary for coverage cards..."
                  className={`w-full bg-background p-5 border-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all min-h-[100px] resize-none ${
                    validationErrors.excerpt ? 'border-red-200' : 'border-border focus:border-primary'
                  }`}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section: Body Content */}
          <div className="bg-card border border-border rounded-xl shadow-sm">
             <div className="px-6 py-4 border-b border-border bg-secondary/5 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/70">Report Content</h3>
                <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                   <FileText size={12} /> Standard HTML
                </span>
             </div>
             <div className="p-6">
                <textarea
                  placeholder="<p>Start writing the detailed report here...</p>"
                  className={`w-full bg-secondary/5 font-mono text-sm leading-relaxed p-6 border-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all min-h-[500px] ${
                    validationErrors.content ? 'border-red-200' : 'border-border focus:border-primary'
                  }`}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
                <div className="mt-4 flex flex-wrap gap-2">
                   {['<p>', '<strong>', '<h3>', '<ul>'].map(tag => (
                      <span key={tag} className="text-[10px] font-mono bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 text-zinc-600">{tag}</span>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Section: Meta Data */}
          <div className="bg-white border border-border rounded-xl shadow-sm p-6 space-y-6 sticky top-8">
            <div className="space-y-4">
               <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex justify-between">
                    Category {validationErrors.category && <span className="text-red-500 normal-case font-bold italic animate-pulse">Required</span>}
                  </label>
                  <select 
                    className={`w-full p-3 bg-secondary/30 border rounded-lg focus:ring-2 focus:ring-primary text-sm font-bold ${
                      validationErrors.category ? 'border-red-300' : 'border-border'
                    }`}
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="">Select Category...</option>
                    {availableCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
               </div>

               <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex justify-between">
                    Assigned Author {validationErrors.author && <span className="text-red-500 normal-case font-bold italic animate-pulse">Required</span>}
                  </label>
                  <select 
                    className={`w-full p-3 bg-secondary/30 border rounded-lg focus:ring-2 focus:ring-primary text-sm font-bold ${
                      validationErrors.author ? 'border-red-300' : 'border-border'
                    }`}
                    value={formData.authorId}
                    onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                  >
                    <option value="">Select Lead Reporter...</option>
                    {availableAuthors.map(auth => (
                      <option key={auth.id} value={auth.id}>{auth.name}</option>
                    ))}
                  </select>
               </div>

               <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Publishing Status</label>
                  <select 
                    className="w-full p-3 bg-primary text-primary-foreground border-none rounded-lg focus:ring-2 focus:ring-primary text-sm font-bold uppercase tracking-widest"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ArticleStatus })}
                  >
                    <option value="draft">📁 Save Draft</option>
                    <option value="review">🔍 Editorial Review</option>
                    <option value="published">🚀 Publish Live</option>
                  </select>
               </div>

               <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                    Content Font
                  </label>
                  <select
                    className="w-full p-3 bg-secondary/30 border border-border rounded-lg focus:ring-2 focus:ring-primary text-sm font-bold"
                    value={formData.contentFont}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contentFont: e.target.value as ArticleContentFont,
                      })
                    }
                  >
                    {fontOptions.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
               </div>
            </div>

            <hr className="border-border/50" />

            <div className="space-y-3">
               {[
                 { id: 'featured', label: 'Primary Feature', field: 'featured', color: 'primary' },
                 { id: 'isBreaking', label: 'Breaking News', field: 'isBreaking', color: 'red' },
                 { id: 'isLive', label: 'Live Story', field: 'isLive', color: 'emerald' },
               ].map((item) => (
                 <label 
                   key={item.id} 
                   className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-secondary/5 cursor-pointer hover:bg-secondary/10 transition-colors"
                 >
                    <span className="text-xs font-bold text-foreground/80">{item.label}</span>
                    <input 
                      type="checkbox"
                      checked={(formData as any)[item.field]}
                      onChange={(e) => setFormData({ ...formData, [item.field]: e.target.checked })}
                      className="w-5 h-5 rounded border-zinc-300 text-primary focus:ring-primary"
                    />
                 </label>
               ))}
            </div>

            <div className="space-y-4 pt-4">
               <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                    <Tag size={10} /> Editorial Tags
                  </label>
                  <input
                    type="text"
                    placeholder="politics, analysis, india..."
                    className="w-full p-3 border border-border rounded-lg text-sm bg-background"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
               </div>
            </div>

            <div className="pt-2">
               {(isUploadingImage || isUploadingGalleryImages) && (
                 <div className="flex items-center gap-2 mb-4 bg-primary/5 p-3 rounded-lg border border-primary/20 animate-pulse">
                    <CloudUpload className="text-primary animate-bounce" size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Awaiting Media Asset...</span>
                 </div>
               )}
               <button 
                type="submit" 
                disabled={loading || success || isUploadingImage || isUploadingGalleryImages}
                className="w-full py-4 bg-black text-white font-black uppercase tracking-[0.2em] rounded-lg shadow-xl hover:bg-primary transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Archiving...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 size={20} />
                    Redircting
                  </>
                ) : (isUploadingImage || isUploadingGalleryImages) ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {article ? 'Update Report' : 'Consign Report'}
                  </>
                )}
              </button>
            </div>

            <button 
              type="button"
              onClick={() => router.back()}
              className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-black transition-colors"
            >
              Abandon Draft
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
