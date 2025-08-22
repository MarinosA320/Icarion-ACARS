import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon not showing up
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

if (typeof L.Icon.Default.prototype._getIconUrl === 'undefined') {
  L.Icon.Default.prototype._getIconUrl = function (name: string) {
    return L.Icon.Default.prototype.options[name];
  };
}

interface SimpleMapProps {
  center: [number, number];
  zoom: number;
  depCoords: [number, number] | null;
  arrCoords: [number, number] | null;
  departureIcao: string;
  arrivalIcao: string;
}

const SimpleMap: React.FC<SimpleMapProps> = ({ center, zoom, depCoords, arrCoords, departureIcao, arrivalIcao }) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className="h-full w-full" // Ensure it takes full height and width of its parent
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {depCoords && <Marker position={depCoords} title={`Departure: ${departureIcao}`} />}
      {arrCoords && <Marker position={arrCoords} title={`Arrival: ${arrivalIcao}`} />}
      {depCoords && arrCoords && (
        <Polyline positions={[depCoords, arrCoords]} color="#007bff" weight={3} opacity={0.7} />
      )}
      {depCoords && arrCoords && (
        <Polyline
          positions={[
            [depCoords[0] + 1, depCoords[1] + 1],
            [center[0], center[1]],
            [arrCoords[0] - 1, arrCoords[1] - 1],
          ]}
          color="#ff7800"
          weight={2}
          dashArray="5, 5"
          opacity={0.5}
          tooltip="Simulated Airway"
        />
      )}
    </MapContainer>
  );
};

export default SimpleMap;