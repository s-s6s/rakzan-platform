'use client';
import { useRef, useEffect, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import type L from 'leaflet';

interface GoogleMapViewProps {
  latitude: number; longitude: number;
  title?: string; height?: string; zoom?: number;
}

export function GoogleMapView({ latitude, longitude, title, height = '300px', zoom = 15 }: GoogleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!latitude || !longitude) { setLoading(false); return; }
    if (!mapRef.current || mapInstance.current) return;
    let map: L.Map;
    async function init() {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      const defaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
      });
      map = L.map(mapRef.current!, { center: [latitude, longitude], zoom, zoomControl: true }).setView([latitude, longitude], zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      L.marker([latitude, longitude], { icon: defaultIcon }).addTo(map).bindPopup(title || '');
      mapInstance.current = map;
      setLoading(false);
    }
    init();
    return () => { mapInstance.current?.remove(); mapInstance.current = null; };
  }, [latitude, longitude]);

  if (!latitude || !longitude) return <div className='flex items-center justify-center rounded-xl border border-border bg-muted/5' style={{ height }}><div className='text-center'><MapPin className='mx-auto h-8 w-8 text-muted' /><p className='mt-2 text-sm text-muted'>لا توجد إحداثيات للخريطة</p></div></div>;

  if (loading) return <div className='flex items-center justify-center rounded-xl border border-border bg-muted/5' style={{ height }}><Loader2 className='h-8 w-8 animate-spin text-muted' /></div>;

  return <div ref={mapRef} className='rounded-xl border border-border overflow-hidden z-0' style={{ height }} />;
}
