'use client';
import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, X, Loader2 } from 'lucide-react';

interface Props { images: string[]; onChange: (images: string[]) => void; max?: number; label?: string; }

export function ImageUpload({ images, onChange, max = 10, label }: Props) {
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || images.length + files.length > max) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const uploaded: string[] = [];
      for (const file of files) {
        const ext = file.name.split('.').pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { data, error } = await supabase.storage.from('property-images').upload(path, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('property-images').getPublicUrl(data.path);
        uploaded.push(publicUrl);
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      console.error(err);
    } finally { setUploading(false); e.target.value = ''; }
  }, [images, onChange, max]);

  const remove = (index: number) => onChange(images.filter((_, i) => i !== index));

  return (
    <div className='space-y-2'>
      {label && <p className='text-xs font-medium text-muted'>{label}</p>}
      <div className='flex flex-wrap gap-2'>
        {images.map((url, i) => (
          <div key={i} className='relative h-20 w-20 overflow-hidden rounded-lg border'>
            <img src={url} alt='' className='h-full w-full object-cover' />
            <button type='button' onClick={() => remove(i)} className='absolute left-0.5 top-0.5 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70'><X className='h-3 w-3' /></button>
          </div>
        ))}
        {images.length < max && (
          <label className='flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary'>
            {uploading ? <Loader2 className='h-5 w-5 animate-spin' /> : <Upload className='h-5 w-5' />}
            <input type='file' accept='image/*' multiple onChange={upload} disabled={uploading} className='hidden' />
          </label>
        )}
      </div>
    </div>
  );
}
