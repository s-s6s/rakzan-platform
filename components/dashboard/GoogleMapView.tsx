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
  const [error, setError] = useState('');

  useEffect(() => {
    if (!latitude || !longitude) { setLoading(false); return; }

    const init = () => {
      if (!mapRef.current || !(window as any).google) return;
      const pos = { lat: latitude, lng: longitude };
      const map = new google.maps.Map(mapRef.current, {
        center: pos, zoom, mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false, streetViewControl: true, fullscreenControl: true,
        zoomControl: true,
      });
      new google.maps.Marker({ position: pos, map, title: title || undefined, animation: google.maps.Animation.DROP });
      setLoading(false);
    };

    if ((window as any).google?.maps) { init(); }
    else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''}&language=ar&region=SA`;
      script.async = true;
      script.defer = true;
      script.onload = init;
      script.onerror = () => { setError('فشل تحميل الخريطة'); setLoading(false); };
      document.head.appendChild(script);
    }
  }, [latitude, longitude]);

  if (!latitude || !longitude) return <div className='flex items-center justify-center rounded-xl border border-border bg-muted/5' style={{ height }}><div className='text-center'><MapPin className='mx-auto h-8 w-8 text-muted' /><p className='mt-2 text-sm text-muted'>لا توجد إحداثيات للخريطة</p></div></div>;

  if (error) return <div className='flex items-center justify-center rounded-xl border border-border bg-muted/5' style={{ height }}><p className='text-sm text-muted'>{error}</p></div>;

  if (loading) return <div className='flex items-center justify-center rounded-xl border border-border bg-muted/5' style={{ height }}><Loader2 className='h-8 w-8 animate-spin text-muted' /></div>;

  return <div ref={mapRef} className='rounded-xl border border-border overflow-hidden' style={{ height }} />;
}
