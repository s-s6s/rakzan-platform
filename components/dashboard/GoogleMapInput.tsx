'use client';
import { useState, useRef, useEffect } from 'react';
import { Loader2, MapPin, Search, Crosshair } from 'lucide-react';
import type L from 'leaflet';

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
  const mapInstance = useRef<L.Map | null>(null);
  const markerInstance = useRef<L.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addressText, setAddressText] = useState('');
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(latitude && longitude ? { lat: latitude, lng: longitude } : null);

  useEffect(() => {
    async function init() {
      if (!mapRef.current || mapInstance.current) return;
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      const defaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
      });

      const center: L.LatLngExpression = markerPos || { lat: latitude || 24.7136, lng: longitude || 46.6753 };
      const map = L.map(mapRef.current, { center, zoom, zoomControl: true }).setView(center, zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      mapInstance.current = map;

      if (markerPos) {
        const marker = L.marker([markerPos.lat, markerPos.lng], { draggable: true, icon: defaultIcon }).addTo(map);
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setMarkerPos({ lat: pos.lat, lng: pos.lng });
          onChange(pos.lat, pos.lng);
          reverseGeocode(pos.lat, pos.lng);
        });
        markerInstance.current = marker;
      }

      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (markerInstance.current) markerInstance.current.setLatLng([lat, lng]);
        else {
          const marker = L.marker([lat, lng], { draggable: true, icon: defaultIcon }).addTo(map);
          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            setMarkerPos({ lat: pos.lat, lng: pos.lng });
            onChange(pos.lat, pos.lng);
            reverseGeocode(pos.lat, pos.lng);
          });
          markerInstance.current = marker;
        }
        setMarkerPos({ lat, lng });
        onChange(lat, lng);
        reverseGeocode(lat, lng);
      });

      setLoading(false);
    }
    init();
    return () => { mapInstance.current?.remove(); mapInstance.current = null; };
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`);
      const data = await res.json();
      if (data.display_name) {
        setAddressText(data.display_name);
        onAddressChange?.(data.display_name);
      }
    } catch { }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&accept-language=ar`);
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latNum = parseFloat(lat), lngNum = parseFloat(lon);
        const L = await import('leaflet');
        const defaultIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
        });
        mapInstance.current?.setView([latNum, lngNum], 16);
        if (markerInstance.current) markerInstance.current.setLatLng([latNum, lngNum]);
        else {
          const marker = L.marker([latNum, lngNum], { draggable: true, icon: defaultIcon }).addTo(mapInstance.current!);
          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            setMarkerPos({ lat: pos.lat, lng: pos.lng });
            onChange(pos.lat, pos.lng);
            reverseGeocode(pos.lat, pos.lng);
          });
          markerInstance.current = marker;
        }
        setMarkerPos({ lat: latNum, lng: lngNum });
        onChange(latNum, lngNum);
        setAddressText(display_name);
        onAddressChange?.(display_name);
      }
    } catch { }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      const L = await import('leaflet');
      const defaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
      });
      mapInstance.current?.setView([lat, lng], 16);
      if (markerInstance.current) markerInstance.current.setLatLng([lat, lng]);
      else {
        const marker = L.marker([lat, lng], { draggable: true, icon: defaultIcon }).addTo(mapInstance.current!);
        marker.on('dragend', () => {
          const p = marker.getLatLng();
          setMarkerPos({ lat: p.lat, lng: p.lng });
          onChange(p.lat, p.lng);
          reverseGeocode(p.lat, p.lng);
        });
        markerInstance.current = marker;
      }
      setMarkerPos({ lat, lng });
      onChange(lat, lng);
      reverseGeocode(lat, lng);
    });
  };

  if (loading) return <div className='flex items-center justify-center rounded-xl border border-border bg-muted/5' style={{ height }}><Loader2 className='h-8 w-8 animate-spin text-muted' /></div>;

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
          <input type='text' value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchLocation()} placeholder='ابحث عن عنوان أو موقع...' className='w-full rounded-lg border border-border bg-white py-2.5 pr-10 pl-10 text-sm outline-none focus:border-primary' />
          {searchQuery && <button onClick={() => setSearchQuery('')} className='absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground'><svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' /></svg></button>}
        </div>
        <button onClick={getCurrentLocation} className='flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2.5 text-sm font-medium text-muted hover:bg-muted/10' title='موقعي الحالي'>
          <Crosshair className='h-4 w-4' />
        </button>
      </div>
      <div ref={mapRef} className='rounded-xl border border-border overflow-hidden z-0' style={{ height }} />
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
