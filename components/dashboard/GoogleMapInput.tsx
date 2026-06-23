'use client';
import { useState, useRef, useEffect } from 'react';
import { Loader2, MapPin, Search, Crosshair } from 'lucide-react';

interface GoogleMapInputProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  onAddressChange?: (address: string) => void;
  height?: string;
  zoom?: number;
}

export function GoogleMapInput({ latitude, longitude, onChange, onAddressChange, height = '400px', zoom = 15 }: GoogleMapInputProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: latitude || 24.7136, lng: longitude || 46.6753 });
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(latitude && longitude ? { lat: latitude, lng: longitude } : null);
  const [addressText, setAddressText] = useState('');

  useEffect(() => {
    if (!(window as any).google?.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''}&libraries=places&language=ar&region=SA`;
      script.async = true;
      script.defer = true;
      script.onload = () => { setLoading(false); initMap(); };
      script.onerror = () => { setError('فشل تحميل خرائط Google. تأكد من إضافة مفتاح API في الإعدادات.'); setLoading(false); };
      document.head.appendChild(script);
    } else {
      setLoading(false);
      setTimeout(initMap, 100);
    }
  }, []);

  const initMap = () => {
    if (!mapRef.current || !(window as any).google) return;
    const center = markerPos || mapCenter;
    const map = new google.maps.Map(mapRef.current, {
      center, zoom, mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true, streetViewControl: true, fullscreenControl: true,
      styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
    });

    let marker: google.maps.Marker | null = null;
    if (markerPos) {
      marker = new google.maps.Marker({ position: markerPos, map, draggable: true, animation: google.maps.Animation.DROP });
      marker.addListener('dragend', () => {
        const pos = marker!.getPosition()!;
        const lat = pos.lat(); const lng = pos.lng();
        setMarkerPos({ lat, lng });
        onChange(lat, lng);
        reverseGeocode(lat, lng);
      });
    }

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng!.lat(); const lng = e.latLng!.lng();
      if (marker) marker.setPosition({ lat, lng });
      else {
        marker = new google.maps.Marker({ position: { lat, lng }, map, draggable: true, animation: google.maps.Animation.DROP });
        marker.addListener('dragend', () => {
          const pos = marker!.getPosition()!;
          const mlat = pos.lat(); const mlng = pos.lng();
          setMarkerPos({ lat: mlat, lng: mlng });
          onChange(mlat, mlng);
          reverseGeocode(mlat, mlng);
        });
      }
      setMarkerPos({ lat, lng });
      onChange(lat, lng);
      reverseGeocode(lat, lng);
    });

    const autocomplete = new google.maps.places.Autocomplete(searchRef.current!, { types: ['geocode'], language: 'ar', region: 'SA' } as any);
    autocomplete.bindTo('bounds', map);
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat(); const lng = place.geometry.location.lng();
        map.setCenter({ lat, lng }); map.setZoom(16);
        if (marker) marker.setPosition({ lat, lng });
        else {
          marker = new google.maps.Marker({ position: { lat, lng }, map, draggable: true });
          marker.addListener('dragend', () => {
            const pos = marker!.getPosition()!;
            const mlat = pos.lat(); const mlng = pos.lng();
            setMarkerPos({ lat: mlat, lng: mlng }); onChange(mlat, mlng); reverseGeocode(mlat, mlng);
          });
        }
        setMarkerPos({ lat, lng }); onChange(lat, lng);
        setSearchQuery(place.formatted_address || '');
        onAddressChange?.(place.formatted_address || '');
        setAddressText(place.formatted_address || '');
      }
    });
  };

  const reverseGeocode = (lat: number, lng: number) => {
    if (!(window as any).google) return;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng }, language: 'ar' }, (results) => {
      if (results?.[0]) {
        setAddressText(results[0].formatted_address);
        onAddressChange?.(results[0].formatted_address);
      }
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) { setError('الموقع غير متاح'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { onChange(pos.coords.latitude, pos.coords.longitude); setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
      () => { setError('لم نتمكن من الحصول على موقعك'); }
    );
  };

  if (error) return <div className='flex items-center justify-center rounded-xl border border-border bg-muted/5' style={{ height }}><div className='text-center'><MapPin className='mx-auto h-8 w-8 text-muted' /><p className='mt-2 text-sm text-muted'>{error}</p></div></div>;

  if (loading) return <div className='flex items-center justify-center rounded-xl border border-border bg-muted/5' style={{ height }}><Loader2 className='h-8 w-8 animate-spin text-muted' /></div>;

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
          <input ref={searchRef} type='text' value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder='ابحث عن عنوان أو موقع...' className='w-full rounded-lg border border-border bg-white py-2.5 pr-10 pl-10 text-sm outline-none focus:border-primary' />
          {searchQuery && <button onClick={() => setSearchQuery('')} className='absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground'><svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' /></svg></button>}
        </div>
        <button onClick={getCurrentLocation} className='flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2.5 text-sm font-medium text-muted hover:bg-muted/10' title='موقعي الحالي'>
          <Crosshair className='h-4 w-4' />
        </button>
      </div>
      <div ref={mapRef} className='rounded-xl border border-border overflow-hidden' style={{ height }} />
      {addressText && <p className='text-xs text-muted flex items-center gap-1'><MapPin className='h-3 w-3' />{addressText}</p>}
      {markerPos && (
        <div className='flex items-center gap-4 text-xs text-muted bg-muted/5 rounded-lg p-2'>
          <span>خط العرض: {markerPos.lat.toFixed(6)}</span>
          <span>خط الطول: {markerPos.lng.toFixed(6)}</span>
        </div>
      )}
    </div>
  );
}
