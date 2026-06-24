'use client';
import { useRef, useEffect, useState } from 'react';
import { Loader2, MapPin, AlertTriangle, RefreshCw } from 'lucide-react';

interface LeafletMapViewProps {
  latitude: number;
  longitude: number;
  title?: string;
  height?: string;
  zoom?: number;
}

export function LeafletMapView({ latitude, longitude, title, height = '300px', zoom = 15 }: LeafletMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!latitude || !longitude) {
      setLoading(false);
      return;
    }
    if (!containerRef.current) return;
    let destroyed = false;

    async function init() {
      try {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        if (!containerRef.current || destroyed) return;

        const icon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
        });

        const map = L.map(containerRef.current, {
          center: [latitude, longitude],
          zoom,
          zoomControl: true,
        }).setView([latitude, longitude], zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 19,
        }).addTo(map);

        const marker = L.marker([latitude, longitude], { icon }).addTo(map);
        if (title) marker.bindPopup(title);

        mapRef.current = map;
        setLoading(false);
      } catch {
        if (!destroyed) {
          setError('فشل تحميل الخريطة');
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      destroyed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude, zoom, title]);

  if (!latitude || !longitude) {
    return (
      <div className='flex items-center justify-center rounded-xl border border-border bg-muted/5' style={{ height }}>
        <div className='text-center'>
          <MapPin className='mx-auto h-8 w-8 text-muted' />
          <p className='mt-2 text-sm text-muted'>لا توجد إحداثيات للخريطة</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5' style={{ height }}>
        <div className='text-center'>
          <AlertTriangle className='mx-auto h-8 w-8 text-destructive' />
          <p className='mt-2 text-sm text-destructive'>{error}</p>
          <button onClick={() => window.location.reload()} className='mt-2 inline-flex items-center gap-1 text-xs text-destructive hover:text-destructive/80'>
            <RefreshCw className='h-3 w-3' />إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center rounded-xl border border-border bg-muted/5' style={{ height }}>
        <Loader2 className='h-8 w-8 animate-spin text-muted' />
      </div>
    );
  }

  return (
    <div ref={containerRef} className='rounded-xl border border-border overflow-hidden z-0' style={{ height, minHeight: '250px' }} />
  );
}
