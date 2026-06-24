'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, MapPin, Search, Crosshair, AlertTriangle, RefreshCw } from 'lucide-react';

interface LeafletMapInputProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  onAddressChange?: (address: string) => void;
  height?: string;
  zoom?: number;
  city?: string;
}

export function LeafletMapInput({ latitude, longitude, onChange, onAddressChange, height = '400px', zoom = 15, city }: LeafletMapInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const initRef = useRef(false);
  const cityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addressText, setAddressText] = useState('');
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  );

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
        { headers: { 'User-Agent': 'RakzanPlatform/1.0' } }
      );
      if (!res.ok) return;
      const d = await res.json();
      if (d.display_name) {
        setAddressText(d.display_name);
        onAddressChange?.(d.display_name);
      }
    } catch {
      // silent - reverse geocode is optional
    }
  };

  const makeMarker = useCallback((L: any, map: any, lat: number, lng: number) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      return;
    }
    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
    });
    const marker = L.marker([lat, lng], { draggable: true, icon }).addTo(map);
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setMarkerPos({ lat: pos.lat, lng: pos.lng });
      onChange(pos.lat, pos.lng);
      reverseGeocode(pos.lat, pos.lng);
    });
    markerRef.current = marker;
  }, [onChange]);

  const flyTo = useCallback(async (place: string) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1&accept-language=ar`,
        { headers: { 'User-Agent': 'RakzanPlatform/1.0' } }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data.length > 0 && mapRef.current) {
        const { lat, lon, display_name } = data[0];
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lon);
        mapRef.current.setView([latNum, lngNum], 14);
        makeMarker(leafletRef.current, mapRef.current, latNum, lngNum);
        setMarkerPos({ lat: latNum, lng: lngNum });
        onChange(latNum, lngNum);
        setAddressText(display_name);
        onAddressChange?.(display_name);
      }
    } catch {
      // silent - user can retry with search
    }
  }, [onChange, onAddressChange, makeMarker]);

  // Debounce city flyTo to avoid race condition with map init
  useEffect(() => {
    if (city && city.trim().length > 1) {
      if (cityTimerRef.current) clearTimeout(cityTimerRef.current);
      cityTimerRef.current = setTimeout(() => {
        if (initRef.current) flyTo(city);
      }, 500);
    }
    return () => { if (cityTimerRef.current) clearTimeout(cityTimerRef.current); };
  }, [city, flyTo]);

  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function init() {
      try {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        leafletRef.current = L;

        if (!containerRef.current || destroyed) return;

        const center: [number, number] = markerPos
          ? [markerPos.lat, markerPos.lng]
          : [latitude || 24.7136, longitude || 46.6753];

        const map = L.map(containerRef.current, {
          center,
          zoom,
          zoomControl: true,
        }).setView(center, zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;
        initRef.current = true;

        if (markerPos) makeMarker(L, map, markerPos.lat, markerPos.lng);

        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          makeMarker(L, map, lat, lng);
          setMarkerPos({ lat, lng });
          onChange(lat, lng);
          reverseGeocode(lat, lng);
        });

        setLoading(false);
      } catch {
        if (!destroyed) {
          setError('فشل تحميل الخريطة. حاول مرة أخرى.');
          setLoading(false);
        }
      }
    }

    // Timeout handling
    timeoutId = setTimeout(() => {
      if (!initRef.current && !destroyed) {
        setError('انتهاء وقت تحميل الخريطة. تأكد من اتصالك بالإنترنت.');
        setLoading(false);
      }
    }, 10000);

    init();

    return () => {
      destroyed = true;
      clearTimeout(timeoutId);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
      initRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&accept-language=ar`,
        { headers: { 'User-Agent': 'RakzanPlatform/1.0' } }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data.length > 0 && mapRef.current) {
        const { lat, lon, display_name } = data[0];
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lon);
        mapRef.current.setView([latNum, lngNum], 16);
        makeMarker(leafletRef.current, mapRef.current, latNum, lngNum);
        setMarkerPos({ lat: latNum, lng: lngNum });
        onChange(latNum, lngNum);
        setAddressText(display_name);
        onAddressChange?.(display_name);
      }
    } catch {
      setError('فشل البحث. حاول مرة أخرى.');
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('متصفحك لا يدعم تحديد الموقع');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 16);
          const L = leafletRef.current;
          if (L) {
            makeMarker(L, mapRef.current, lat, lng);
            setMarkerPos({ lat, lng });
            onChange(lat, lng);
            reverseGeocode(lat, lng);
          }
        }
      },
      () => setError('تعذر الحصول على موقعك الحالي'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const retry = () => {
    setError(null);
    setLoading(true);
    initRef.current = false;
    setTimeout(() => window.location.reload(), 500);
  };

  if (error) {
    return (
      <div className='flex items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5' style={{ height }}>
        <div className='text-center px-6'>
          <AlertTriangle className='mx-auto h-8 w-8 text-destructive' />
          <p className='mt-2 text-sm text-destructive'>{error}</p>
          <button onClick={retry} className='mt-3 inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors'>
            <RefreshCw className='h-3.5 w-3.5' />إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center rounded-xl border border-border bg-muted/5' style={{ height }}>
        <div className='text-center'>
          <Loader2 className='mx-auto h-8 w-8 animate-spin text-muted' />
          <p className='mt-2 text-xs text-muted'>جاري تحميل الخريطة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
          <input
            type='text' value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchLocation()}
            placeholder='ابحث عن عنوان أو مدينة...'
            className='w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20'
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className='absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground'>
              <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          )}
        </div>
        <button onClick={getCurrentLocation} className='btn btn-outline btn-icon' title='موقعي الحالي'>
          <Crosshair className='h-4 w-4' />
        </button>
      </div>
      <div ref={containerRef} className='rounded-xl border border-border overflow-hidden z-0' style={{ height, minHeight: '300px' }} />
      {addressText && (
        <p className='text-xs text-muted flex items-center gap-1'>
          <MapPin className='h-3 w-3' />{addressText}
        </p>
      )}
      {markerPos && (
        <div className='flex items-center gap-4 text-xs text-muted bg-muted/5 rounded-lg p-2'>
          <span>خط العرض: {markerPos.lat.toFixed(6)}</span>
          <span>خط الطول: {markerPos.lng.toFixed(6)}</span>
        </div>
      )}
    </div>
  );
}
