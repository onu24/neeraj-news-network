'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VisualStory } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { createVisualStoryAction, updateVisualStoryAction } from '@/lib/actions/dashboard-actions';
import { ImageUpload } from './ImageUpload';
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, PlusCircle, Save, Trash2, Video } from 'lucide-react';

interface StoryFormProps {
  story?: VisualStory;
}

interface StorySlideForm {
  id: string;
  title: string;
  caption: string;
  image: string;
  video: string;
}

const makeSlideId = (index?: number) =>
  index !== undefined ? `slide_${index + 1}` : `slide_${Math.random().toString(36).slice(2, 8)}`;

export function StoryForm({ story }: StoryFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadingSlideIndex, setUploadingSlideIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: story?.title || '',
    category: story?.category || '',
    coverImage: story?.coverImage || '',
    slides:
      story?.slides?.length
        ? story.slides.map((slide, idx) => ({
            id: slide.id || makeSlideId(idx),
            title: slide.title || '',
            caption: slide.caption || '',
            image: slide.image || '',
            video: slide.video || '',
          }))
        : [{ id: makeSlideId(0), title: '', caption: '', image: '', video: '' }],
  });

  const slugValue = useMemo(() => slugify(formData.title), [formData.title]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.category.trim()) errors.category = 'Category is required';
    if (!formData.coverImage.trim()) errors.coverImage = 'Cover image is required';
    if (formData.slides.length === 0) {
      errors.slides = 'Add at least one slide';
    }

    formData.slides.forEach((slide, idx) => {
      const no = idx + 1;
      if (!slide.title.trim()) errors[`slide_${idx}_title`] = `Slide ${no} title is required`;
      if (!slide.caption.trim()) errors[`slide_${idx}_caption`] = `Slide ${no} caption is required`;
      if (!slide.image.trim() && !slide.video.trim()) {
        errors[`slide_${idx}_media`] = `Slide ${no} needs image or video`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSlideChange = (index: number, field: keyof StorySlideForm, value: string) => {
    setFormData((prev) => {
      const slides = [...prev.slides];
      slides[index] = { ...slides[index], [field]: value };
      return { ...prev, slides };
    });
  };

  const handleAddSlide = () => {
    setFormData((prev) => ({
      ...prev,
      slides: [...prev.slides, { id: makeSlideId(), title: '', caption: '', image: '', video: '' }],
    }));
  };

  const handleRemoveSlide = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      slides: prev.slides.filter((_, idx) => idx !== index),
    }));
  };

  const handleSlideFileSelect = async (index: number, file: File | undefined, mediaType: 'image' | 'video') => {
    if (!file) return;

    const validTypes =
      mediaType === 'image'
        ? ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
        : ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

    if (!validTypes.includes(file.type)) {
      setError(
        mediaType === 'image'
          ? 'Invalid image format. Please use JPG, PNG, WebP or GIF.'
          : 'Invalid video format. Please use MP4, WebM, OGG, or MOV.'
      );
      return;
    }

    const MAX_SIZE = mediaType === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError(
        `${
          mediaType === 'image' ? 'Slide image' : 'Slide video'
        } is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Limit is ${
          mediaType === 'image' ? '5MB' : '50MB'
        }.`
      );
      return;
    }

    setError(null);
    setUploadingSlideIndex(index);

    try {
      const body = new FormData();
      body.append('file', file);
      body.append('folder', mediaType === 'image' ? 'stories/slides/images' : 'stories/slides/videos');

      const { uploadImageAction } = await import('@/lib/actions/dashboard-actions');
      const result = await uploadImageAction(body);

      if (!result.success || !result.url) {
        throw new Error(result.error || `Slide ${mediaType} upload failed`);
      }

      handleSlideChange(index, mediaType, result.url);
    } catch (err) {
      console.error('[StoryForm] Slide upload error:', err);
      setError(err instanceof Error ? err.message : `Failed to upload slide ${mediaType}`);
    } finally {
      setUploadingSlideIndex(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isUploadingCover || uploadingSlideIndex !== null) return;
    if (!validateForm()) {
      setError('Please fix the highlighted fields before saving.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        slug: slugValue,
        category: formData.category.trim(),
        coverImage: formData.coverImage.trim(),
        slides: formData.slides.map((slide, idx) => ({
          id: slide.id || `slide_${idx + 1}`,
          title: slide.title.trim(),
          caption: slide.caption.trim(),
          image: slide.image.trim(),
          video: slide.video.trim(),
        })),
      };

      if (story) {
        const result = await updateVisualStoryAction(story.id, payload);
        if (!result.success) throw new Error(result.error);
      } else {
        const result = await createVisualStoryAction(payload);
        if (!result.success) throw new Error(result.error);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/stories');
        router.refresh();
      }, 900);
    } catch (err) {
      console.error('[StoryForm] Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl pb-20 animate-in fade-in duration-500">
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 p-5 rounded-lg shadow-sm">
          <AlertCircle className="flex-shrink-0" size={22} />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-lg shadow-sm">
          <CheckCircle2 className="flex-shrink-0" size={22} />
          <p className="font-medium text-sm">Story saved successfully. Redirecting...</p>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
              Story Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className={`w-full bg-background p-4 border-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${
                validationErrors.title ? 'border-red-200' : 'border-border focus:border-primary'
              }`}
              placeholder="e.g. Top 10 News Stories of the Week"
            />
            <p className="mt-2 text-[11px] text-muted-foreground font-mono">Slug: /visual-stories/{slugValue || 'story-slug'}</p>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              className={`w-full bg-background p-4 border-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${
                validationErrors.category ? 'border-red-200' : 'border-border focus:border-primary'
              }`}
              placeholder="e.g. Technology, Politics, Sports"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
            Cover Image
          </label>
          <ImageUpload
            currentImage={formData.coverImage}
            onImageUpload={(url) => setFormData((prev) => ({ ...prev, coverImage: url }))}
            onUploadingChange={setIsUploadingCover}
          />
          {validationErrors.coverImage && (
            <p className="text-xs text-red-600 mt-2">{validationErrors.coverImage}</p>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-2xl font-bold text-foreground">Slides</h3>
            <p className="text-sm text-muted-foreground">Add title, caption, and image/video for each swipe card.</p>
          </div>
          <button
            type="button"
            onClick={handleAddSlide}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest rounded-sm hover:bg-black transition-colors"
          >
            <PlusCircle size={14} />
            Add Slide
          </button>
        </div>

        {validationErrors.slides && <p className="text-xs text-red-600">{validationErrors.slides}</p>}

        <div className="space-y-5">
          {formData.slides.map((slide, index) => (
            <div key={slide.id} className="border border-border rounded-lg p-5 bg-background/40">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-foreground">Slide {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveSlide(index)}
                  disabled={formData.slides.length === 1}
                  className="inline-flex items-center gap-1 text-xs font-bold uppercase text-red-600 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                  className={`w-full bg-background p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    validationErrors[`slide_${index}_title`] ? 'border-red-300' : 'border-border'
                  }`}
                  placeholder="Slide title"
                />

                <textarea
                  value={slide.caption}
                  onChange={(e) => handleSlideChange(index, 'caption', e.target.value)}
                  className={`w-full bg-background p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[96px] resize-none ${
                    validationErrors[`slide_${index}_caption`] ? 'border-red-300' : 'border-border'
                  }`}
                  placeholder="Slide caption"
                />

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Image URL Section */}
                    <div className="space-y-2">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground">Slide Image</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="url"
                            value={slide.image}
                            onChange={(e) => handleSlideChange(index, 'image', e.target.value)}
                            className={`w-full bg-background p-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 ${
                              validationErrors[`slide_${index}_media`] ? 'border-red-300' : 'border-border'
                            }`}
                            placeholder="Image URL (Unsplash/Imgur etc.)"
                          />
                        </div>
                        <label className="p-2 border border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors" title="Upload Image">
                          <ImagePlus size={18} className={uploadingSlideIndex === index ? 'animate-pulse text-primary' : ''} />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingSlideIndex !== null}
                            onChange={(e) => handleSlideFileSelect(index, e.target.files?.[0], 'image')}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Video URL Section */}
                    <div className="space-y-2">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground">Slide Video (Optional)</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="url"
                            value={slide.video}
                            onChange={(e) => handleSlideChange(index, 'video', e.target.value)}
                            className="w-full bg-background p-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 border-border"
                            placeholder="Video URL (.mp4, .webm)"
                          />
                        </div>
                        <label className="p-2 border border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors" title="Upload Video">
                          <Video size={18} className={uploadingSlideIndex === index ? 'animate-pulse text-primary' : ''} />
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/ogg,video/quicktime"
                            className="hidden"
                            disabled={uploadingSlideIndex !== null}
                            onChange={(e) => handleSlideFileSelect(index, e.target.files?.[0], 'video')}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {validationErrors[`slide_${index}_media`] && (
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{validationErrors[`slide_${index}_media`]}</p>
                  )}

                  {(slide.image || slide.video) && (
                    <div className="flex items-start gap-4 p-3 bg-secondary/20 rounded-lg animate-in fade-in duration-300">
                      {slide.image && (
                        <div className="space-y-1">
                          <p className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground">Image Preview</p>
                          <img
                            src={slide.image}
                            alt={`Slide ${index + 1}`}
                            className="h-40 w-28 rounded-md object-cover border border-border shadow-sm bg-white"
                            onError={(e) => (e.currentTarget.src = '/placeholder-story.jpg')}
                          />
                        </div>
                      )}
                      {slide.video && (
                        <div className="space-y-1">
                          <p className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground">Video Preview</p>
                          <video
                            src={slide.video}
                            className="h-40 w-28 rounded-md object-cover border border-border bg-black shadow-sm"
                            muted
                            playsInline
                            controls
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border border-border rounded-lg p-4 flex gap-3 z-10">
        <button
          type="submit"
          disabled={loading || success || isUploadingCover || uploadingSlideIndex !== null}
          className="px-6 py-3 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-sm hover:bg-black transition-colors disabled:opacity-50 inline-flex items-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {story ? 'Update Story' : 'Create Story'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/admin/stories')}
          className="px-6 py-3 border border-border text-foreground font-black uppercase tracking-widest rounded-sm hover:bg-secondary transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
