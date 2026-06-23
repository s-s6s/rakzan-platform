'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useLocale } from '@/lib/LocaleContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });

interface Props { latitude: number; longitude: number; title?: string; className?: string; }

export function PropertyMap({ latitude, longitude, title, className = '' }: Props) {
  const [mounted, setMounted] = useState(false);
  const { locale } = useLocale();
  const position: [number, number] = [latitude, longitude];

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className={`h-64 rounded-lg bg-muted/20 flex items-center justify-center text-sm text-muted ${className}`}>{locale === 'ar' ? 'جاري تحميل الخريطة...' : 'Loading map...'}</div>;

  return (
    <div className={`h-64 rounded-lg overflow-hidden ${className}`}>
      <MapContainer center={position} zoom={15} scrollWheelZoom={false} className='h-full w-full' zoomControl={false}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
        <Marker position={position}>
          <Popup>{title || position.join(', ')}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
