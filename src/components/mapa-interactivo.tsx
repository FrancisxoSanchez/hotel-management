'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function MapaInteractivo() {
  const position: [number, number] = [-24.7811, -65.41157];
  const zoomLevel = 16;

  return (
    <MapContainer
      center={position}
      zoom={zoomLevel}
      scrollWheelZoom={false}
      className="h-full w-full z-0"
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <Marker position={position}>
        <Popup>
          <div className="text-center">
            <strong className="block text-base">Hotel Grand Vista</strong>
            <span className="text-sm text-muted-foreground">Balcarce y Entre Rios, Salta</span>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}