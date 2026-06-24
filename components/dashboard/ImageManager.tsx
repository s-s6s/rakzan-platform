'use client';
import { useState } from 'react';
import { Loader2, Upload, Trash2, Image as ImageIcon, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface ImageManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  category: string;
  maxImages?: number;
  bucket?: string;
}

async function ensureBucket(bucket: string) {
  try {
    const res = await fetch('/api/storage/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucket }),
    });
    const data = await res.json();
    if (!res.ok) console.warn('Bucket init warning:', data);
  } catch (err) {
    console.warn('Bucket init failed:', err);
  }
}

export function ImageManager({ images, onChange, category, maxImages = 20, bucket = 'property-images' }: ImageManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const uploadFiles = async (files: FileList) => {
    const supabase = createClient();
    const remaining = maxImages - images.length;
    const toUpload = Array.from(files).slice(0, remaining);

    if (toUpload.length < files.length) {
      toast.warning(`يمكنك إضافة ${remaining} صور فقط`);
    }

    for (const file of toUpload) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`نوع الملف غير مدعوم: ${file.name}`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`حجم الملف كبير جداً: ${file.name} (الحد الأقصى 10MB)`);
        return;
      }
    }

    await ensureBucket(bucket);

    setUploading(true);
    const urls: string[] = [];

    const uploads = toUpload.map(async (file, i) => {
      const ext = file.name.split('.').pop();
      const fileName = `${category}_${Date.now()}_${i}.${ext}`;

      const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

      if (error) {
        toast.error(`فشل رفع ${file.name}: ${error.message}`);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
      return publicUrl;
    });

    const results = await Promise.all(uploads);
    for (let i = 0; i < results.length; i++) {
      if (results[i]) {
        urls.push(results[i]!);
      }
      setUploadProgress(Math.round(((i + 1) / results.length) * 100));
    }

    onChange([...images, ...urls]);
    setUploading(false);
    setUploadProgress(null);
    if (urls.length > 0) toast.success(`تم رفع ${urls.length} صور`);
  };

  const removeImage = async (index: number) => {
    const url = images[index];
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);

    // Delete from storage
    if (url) {
      try {
        const supabase = createClient();
        const path = url.split('/').pop();
        if (path) {
          await supabase.storage.from(bucket).remove([path]);
        }
      } catch {
        // silent - storage cleanup is best-effort
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      uploadFiles(e.target.files);
      e.target.value = '';
    }
  };

  const remaining = maxImages - images.length;

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <p className='text-xs text-muted'>{images.length} / {maxImages} صورة</p>
      </div>

      {images.length > 0 && (
        <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2'>
          {images.map((url, i) => (
            <div key={i} className='group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted/10'>
              <img
                src={url} alt=''
                className='h-full w-full object-cover'
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x200/e2e8f0/94a3b8?text=خطأ'; }}
              />
              <div className='absolute inset-0 flex items-center justify-center gap-1 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100'>
                <button onClick={() => removeImage(i)} className='rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 transition-colors' title='حذف'>
                  <Trash2 className='h-3.5 w-3.5' />
                </button>
              </div>
            </div>
          ))}
          {remaining > 0 && (
            <label className='flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/5 aspect-square transition-colors hover:border-primary/40 hover:bg-primary/5'>
              <div className='text-center'>
                <Plus className='mx-auto h-6 w-6 text-muted' />
                <span className='mt-1 block text-[10px] text-muted'>إضافة</span>
              </div>
              <input type='file' accept='image/jpeg,image/png,image/webp' multiple className='hidden' onChange={handleFileSelect} />
            </label>
          )}
        </div>
      )}

      {images.length === 0 && (
        <div
          className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-primary/5'}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById(`file-${category}`)?.click()}
        >
          <div className={`rounded-full p-3 ${dragOver ? 'bg-primary/10 text-primary' : 'bg-muted/10 text-muted'}`}>
            <Upload className='h-6 w-6' />
          </div>
          <p className='mt-3 text-sm font-medium text-muted'>اسحب الصور هنا أو اضغط للاختيار</p>
          <p className='mt-1 text-xs text-muted/60'>PNG, JPG, WebP - حتى {maxImages} صور</p>
          <input id={`file-${category}`} type='file' accept='image/jpeg,image/png,image/webp' multiple className='hidden' onChange={handleFileSelect} />
        </div>
      )}

      {uploading && (
        <div className='space-y-1.5'>
          <div className='flex items-center justify-between text-xs text-muted'>
            <span>جاري الرفع...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className='h-2 overflow-hidden rounded-full bg-muted/10'>
            <div className='h-full rounded-full bg-primary transition-all duration-300' style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

// Full image gallery component for property detail
interface ImageGalleryProps {
  images: { category: string; urls: string[] }[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [activeTab, setActiveTab] = useState(images[0]?.category || '');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const allImages = images.flatMap(i => i.urls);
  const activeImages = images.find(i => i.category === activeTab)?.urls || [];

  const categoryLabels: Record<string, string> = {
    bathroom: 'حمامات', bedroom: 'غرف نوم', living: 'مجلس', kitchen: 'مطبخ',
    facilities: 'مرافق', exterior: 'واجهة', other: 'أخرى', additional: 'إضافية',
  };

  if (allImages.length === 0) return <div className='flex flex-col items-center justify-center py-16 text-muted'><ImageIcon className='h-12 w-12' /><p className='mt-3'>لا توجد صور</p></div>;

  return (
    <div>
      <div className='flex gap-1 overflow-x-auto border-b pb-px mb-4'>
        {images.filter(g => g.urls.length > 0).map(g => (
          <button key={g.category} onClick={() => setActiveTab(g.category)} className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${activeTab === g.category ? 'border-b-2 border-primary text-primary' : 'text-muted hover:text-foreground'}`}>
            {categoryLabels[g.category] || g.category} ({g.urls.length})
          </button>
        ))}
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
        {activeImages.map((url, i) => (
          <div key={i} className='group relative aspect-[4/3] overflow-hidden rounded-lg border cursor-pointer' onClick={() => setLightboxIndex(allImages.indexOf(url))}>
            <img src={url} alt='' className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-110' />
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm' onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className='absolute left-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20'>✕</button>
          <button onClick={e => { e.stopPropagation(); setLightboxIndex(i => i !== null ? Math.max(0, i - 1) : null); }} className='absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20'>‹</button>
          <button onClick={e => { e.stopPropagation(); setLightboxIndex(i => i !== null ? Math.min(allImages.length - 1, i + 1) : null); }} className='absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20'>›</button>
          <img src={allImages[lightboxIndex]} alt='' className='max-h-[90vh] max-w-[90vw] rounded-lg object-contain' onClick={e => e.stopPropagation()} />
          <p className='absolute bottom-4 text-sm text-white/60'>{lightboxIndex + 1} / {allImages.length}</p>
        </div>
      )}
    </div>
  );
}
