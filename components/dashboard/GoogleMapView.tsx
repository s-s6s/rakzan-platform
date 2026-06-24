'use client';
import { useRef, useEffect, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';

interface GoogleMapViewProps {
  latitude: number; longitude: number;
  title?: string; height?: string; zoom?: number;
}

export function GoogleMapView({ latitude, longitude, title, height = '300px', zoom = 15 }: GoogleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!latitude || !longitude) { setLoading(false); return; }
    if (!mapRef.current) return;
    let destroyed = false;
    async function init() {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      if (!mapRef.current || destroyed) return;
      const icon = L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
      const map = L.map(mapRef.current, { center: [latitude, longitude], zoom, zoomControl: true }).setView([latitude, longitude], zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap', maxZoom: 19 }).addTo(map);
      L.marker([latitude, longitude], { icon }).addTo(map).bindPopup(title || '');
      setLoading(false);
    }
    init();
    return () => { destroyed = true; };
  }, [latitude, longitude]);

  if (!latitude || !longitude) return <div className='flex items-center justify-center rounded-xl border border-border bg-muted/5' style={{ height }}><div className='text-center'><MapPin className='mx-auto h-8 w-8 text-muted' /><p className='mt-2 text-sm text-muted'>لا توجد إحداثيات للخريطة</p></div></div>;

  if (loading) return <div className='flex items-center justify-center rounded-xl border border-border bg-muted/5' style={{ height }}><Loader2 className='h-8 w-8 animate-spin text-muted' /></div>;

  return <div ref={mapRef} className='rounded-xl border border-border overflow-hidden z-0' style={{ height, minHeight: '250px' }} />;
}
