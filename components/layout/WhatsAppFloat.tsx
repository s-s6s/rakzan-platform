'use client';
import { MessageCircle } from 'lucide-react';
const PHONE = '966551234567';
const MESSAGE = 'مرحباً، أود الاستفسار عن عقاراتكم';
export function WhatsAppFloat() {
  return (<a href={`https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`} target='_blank' rel='noopener noreferrer' className='fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110'><MessageCircle className='h-7 w-7' /></a>);
}
