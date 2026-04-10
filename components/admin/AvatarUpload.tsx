'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AlertCircle, Camera, CheckCircle2, X, Link as LinkIcon } from 'lucide-react';

interface AvatarUploadProps {
  onAvatarUpload: (url: string) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  currentAvatar?: string;
  folder?: string;
  inputId?: string;
  buttonLabel?: string;
  alt?: string;
}

const DEFAULT_AVATAR = '/placeholder-user.jpg';

export function AvatarUpload({
  onAvatarUpload,
  onUploadingChange,
  currentAvatar,
  folder = 'authors',
  inputId = 'avatar-upload-input',
  buttonLabel = 'Upload Avatar',
  alt = 'Avatar preview',
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [urlValue, setUrlValue] = useState(currentAvatar || '');
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatar || DEFAULT_AVATAR);
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [uploading, onUploadingChange]);

  useEffect(() => {
    setPreviewUrl(currentAvatar || DEFAULT_AVATAR);
    setUrlValue(currentAvatar || '');
  }, [currentAvatar]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setUrlValue(val);
    
    if (val === '') {
      setPreviewUrl(DEFAULT_AVATAR);
      onAvatarUpload('');
      return;
    }

    setPreviewUrl(val);
    onAvatarUpload(val);
    setError(null);
  };

  const clearAvatar = () => {
    setPreviewUrl(DEFAULT_AVATAR);
    setUrlValue('');
    onAvatarUpload('');
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

    const MAX_SIZE = 3 * 1024 * 1024; // 3MB
    if (file.size > MAX_SIZE) {
      setError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Limit is 3MB.`);
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const progressInterval = setInterval(() => {
        setProgress((p) => (p < 90 ? p + 10 : p));
      }, 250);

      const { uploadImageAction } = await import('@/lib/actions/dashboard-actions');
      const result = await uploadImageAction(formData);

      clearInterval(progressInterval);
      setProgress(100);

      if (!result.success || !result.url) {
        throw new Error(result.error || 'Failed to upload avatar');
      }

      setPreviewUrl(result.url);
      setUrlValue(result.url);
      onAvatarUpload(result.url);
      setUploading(false);
      setProgress(0);
      setShowUpload(false);
    } catch (err) {
      console.warn('[AvatarUpload] Upload error:', err);
      setError(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        {/* URL Input */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
             <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
               <LinkIcon size={14} />
             </div>
             <input
               type="url"
               value={urlValue}
               onChange={handleUrlChange}
               placeholder="Avatar image URL..."
               className="w-full bg-background pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium"
             />
          </div>
          {!showUpload && !uploading && (
            <button
              type="button"
              onClick={() => setShowUpload(true)}
              className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-zinc-200 transition-colors"
              title="Upload file"
            >
              <Camera size={16} />
            </button>
          )}
        </div>

        {/* Upload Toggle Area */}
        {showUpload && (
          <div className="p-4 border border-dashed border-primary/30 bg-primary/5 rounded-lg flex flex-col items-center gap-2 animate-in fade-in slide-in-from-top-1">
             <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Upload Profile Photo</p>
             <input
               ref={fileInputRef}
               type="file"
               accept="image/*"
               onChange={handleFileSelect}
               disabled={uploading}
               className="hidden"
               id={inputId}
             />
             <label
               htmlFor={inputId}
               className={`px-4 py-1.5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-black transition-colors cursor-pointer ${
                 uploading ? 'opacity-50 pointer-events-none' : ''
               }`}
             >
               {uploading ? 'Processing...' : 'Select File'}
             </label>
             <button onClick={() => setShowUpload(false)} className="text-[9px] font-bold uppercase text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        )}

        {/* Preview & Status */}
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-border bg-secondary/40">
            <Image
              src={previewUrl}
              alt={alt}
              fill
              sizes="80px"
              className="object-cover"
              onError={() => setPreviewUrl(DEFAULT_AVATAR)}
            />
            {!uploading && previewUrl !== DEFAULT_AVATAR && (
              <button
                type="button"
                onClick={clearAvatar}
                className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                aria-label="Remove avatar"
              >
                <X size={10} />
              </button>
            )}
            {!uploading && previewUrl !== DEFAULT_AVATAR && (
              <div className="absolute bottom-0 right-0 p-1 bg-emerald-500 text-white rounded-full">
                <CheckCircle2 size={10} />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            {uploading ? (
               <div className="space-y-1">
                 <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                   <div
                     className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-out"
                     style={{ width: `${progress}%` }}
                   />
                 </div>
                 <p className="text-[9px] font-bold uppercase tracking-widest text-primary">Uploading... {progress}%</p>
               </div>
            ) : (
                <p className="text-[10px] text-muted-foreground font-medium italic">
                  Preview updates instantly when you paste a valid image link.
                </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-sm text-xs">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
