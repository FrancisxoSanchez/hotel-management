'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- NO IMPORTAMOS LAS IMÁGENES AQUÍ ARRIBA ---

export default function MapaInteractivo() {
  const position: [number, number] = [-24.7811, -65.41157];
  const zoomLevel = 16;

  // --- CAMBIO: Usamos 'require' DENTRO de la función ---
  // 'require' es manejado de forma diferente por el bundler
  // y suele resolver correctamente los 'assets' de Leaflet.
  const DefaultIcon = L.icon({
    iconUrl: require('leaflet/dist/images/marker-icon.png').default,
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
    shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  // --- FIN DEL CAMBIO ---

  return (
    <MapContainer
      center={position}
      zoom={zoomLevel}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Esto usará el ícono 'DefaultIcon' definido arriba */}
      <Marker position={position} icon={DefaultIcon}>
        <Popup>
          Hotel Grand Vista <br /> Balcarce 252, Salta
        </Popup>
      </Marker>
    </MapContainer>
  );
}