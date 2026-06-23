'use client';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });

interface Props { latitude: number; longitude: number; onMove: (lat: number, lng: number) => void; }

function DraggableMarker({ lat, lng, onMove }: { lat: number; lng: number; onMove: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onMove(e.latlng.lat, e.latlng.lng); },
  });
  return <Marker draggable position={[lat, lng]} eventHandlers={{ dragend: (e) => { const m = e.target; const p = m.getLatLng(); onMove(p.lat, p.lng); } }} />;
}

export default function PropertyMapInput({ latitude, longitude, onMove }: Props) {
  return (
    <MapContainer center={[latitude, longitude]} zoom={15} className='h-full w-full rounded-lg' scrollWheelZoom={false}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
      <DraggableMarker lat={latitude} lng={longitude} onMove={onMove} />
    </MapContainer>
  );
}
