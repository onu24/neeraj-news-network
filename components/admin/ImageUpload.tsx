'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { AlertCircle, CheckCircle2, UploadCloud, X, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  currentImage?: string;
}

export function ImageUpload({ onImageUpload, onUploadingChange, currentImage }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [urlValue, setUrlValue] = useState(currentImage || '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal uploading state to parent component
  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [uploading, onUploadingChange]);

  // Handle URL changes
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setUrlValue(val);
    
    // Simple URL validation for live preview
    if (val === '') {
      setPreviewUrl(null);
      onImageUpload('');
      return;
    }

    // Attempt preview immediately
    setPreviewUrl(val);
    onImageUpload(val);
    setError(null);
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setUrlValue('');
    onImageUpload('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid format. Please use JPG, PNG, WebP or GIF.');
      return;
    }
    
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      setError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Limit is 5MB.`);
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'articles/covers');

      const progressInterval = setInterval(() => {
         setProgress(p => (p < 90 ? p + 10 : p));
      }, 300);

      const { uploadImageAction } = await import('@/lib/actions/dashboard-actions');
      const result = await uploadImageAction(formData);

      clearInterval(progressInterval);
      setProgress(100);

      if (!result.success || !result.url) {
         throw new Error(result.error || 'Failed to upload image');
      }

      setPreviewUrl(result.url);
      setUrlValue(result.url);
      onImageUpload(result.url);
      setUploading(false);
      setProgress(0);
      setShowUpload(false); // Hide upload area after success

    } catch (err) {
      console.warn('[ImageUpload] Storage Error:', err);
      setError(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* URL Input Area */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
           <div className="relative flex-1 group">
             <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
               <LinkIcon size={16} />
             </div>
             <input
               type="url"
               value={urlValue}
               onChange={handleUrlChange}
               placeholder="Paste image URL (e.g. https://example.com/image.jpg)"
               className="w-full bg-background pl-10 pr-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium"
             />
           </div>
           {!showUpload && !uploading && (
             <button 
               type="button"
               onClick={() => setShowUpload(true)}
               className="px-4 py-3 bg-secondary text-secondary-foreground text-xs font-black uppercase tracking-widest rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2"
             >
               <UploadCloud size={14} />
               Upload
             </button>
           )}
        </div>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest pl-1">
          Direct links from Unsplash, Imgur, or News CDNs preferred for speed.
        </p>
      </div>

      {/* Upload UI (Hybrid Mode) */}
      {showUpload && (
        <div className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all animate-in slide-in-from-top-2 duration-300 border-primary/30 bg-primary/5`}>
          <button 
            type="button"
            onClick={() => setShowUpload(false)}
            className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
          
          <div className="py-4 flex flex-col items-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
               <ImageIcon className="w-6 h-6 text-primary" />
            </div>
            <h4 className="text-xs font-bold text-foreground mb-1">Select local file</h4>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-4">Max 5MB</p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
              id="image-file-input"
            />
            
            <label
              htmlFor="image-file-input"
              className={`inline-flex px-6 py-2 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-black transition-all cursor-pointer shadow-sm ${
                uploading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {uploading ? 'Uploading...' : 'Choose File'}
            </label>
          </div>

          {uploading && (
            <div className="mt-2 space-y-2">
              <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Area */}
      <div className={`relative border-2 border-dashed rounded-lg p-1 text-center transition-all ${
        previewUrl ? 'border-emerald-200 bg-emerald-50/5' : 'border-border/40 bg-secondary/5 min-h-[200px] flex items-center justify-center'
      }`}>
        
        {previewUrl ? (
          <div className="relative group p-2">
            <div className="relative w-full h-72 rounded-lg overflow-hidden border border-border bg-zinc-100">
               <Image 
                 src={previewUrl} 
                 alt="Preview" 
                 fill 
                 className="object-cover"
                 sizes="(max-width: 1024px) 100vw, 800px" 
                 onError={() => {
                   setError('Could not load image from this URL. Please check the link.');
                   // We don't clear previewUrl here to allow the user to see the broken link state
                 }}
               />
               <div className="absolute top-4 right-4 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                  <CheckCircle2 size={16} />
               </div>
            </div>
            <button 
              onClick={clearImage}
              type="button"
              className="absolute top-0 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors z-10"
            >
              <X size={14} />
            </button>
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-md text-[10px] font-mono truncate opacity-0 group-hover:opacity-100 transition-opacity">
               {previewUrl}
            </div>
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center opacity-40">
            <ImageIcon className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-xs font-bold uppercase tracking-[0.2em]">No Media Selected</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-sm animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <p className="font-medium text-left">{error}</p>
        </div>
      )}
    </div>
  );
}
