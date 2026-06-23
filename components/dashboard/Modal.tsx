'use client';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean; onClose: () => void; title: string;
  children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-[95vw] h-[95vh]' };

  return (
    <div ref={overlayRef} className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4' onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className={`w-full ${sizes[size]} rounded-xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
        <div className='flex items-center justify-between border-b px-6 py-4'>
          <h2 className='font-display text-lg font-semibold'>{title}</h2>
          <button onClick={onClose} className='rounded-md p-1.5 text-muted hover:bg-muted/10 hover:text-foreground transition-colors'>
            <X className='h-5 w-5' />
          </button>
        </div>
        <div className='overflow-y-auto p-6' style={{ maxHeight: 'calc(95vh - 80px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
